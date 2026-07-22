/**
 * Client-side data store (localStorage) that powers modules whose
 * ASP.NET Core backend isn't running: Categories, Recommendations,
 * Users, Notifications, Activity feed.
 *
 * Everything here is intentionally small and framework-free so it
 * can be swapped 1:1 for real API calls when your teammates ship
 * their controllers.
 */

const NS = 'shozab.v2'
const key = (k: string) => `${NS}.${k}`

function read<T>(k: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key(k))
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
function write<T>(k: string, value: T) {
  if (typeof window === 'undefined') return
  localStorage.setItem(key(k), JSON.stringify(value))
  window.dispatchEvent(new CustomEvent(`store:${k}`))
}

export function subscribe(k: string, cb: () => void) {
  const handler = () => cb()
  window.addEventListener(`store:${k}`, handler)
  return () => window.removeEventListener(`store:${k}`, handler)
}

const uid = () => Math.random().toString(36).slice(2, 10)

/* ------------------------------ Categories ------------------------------ */

export interface Category {
  id: string
  name: string
  slug: string
  audience: 'kids' | 'general' | 'both'
  parentId: string | null
  color: string
  icon: string
  createdAt: string
}

const SEED_CATEGORIES: Category[] = [
  // Technology
  { id: 'c-tech',      name: 'Technology',       slug: 'technology',      audience: 'general', parentId: null,      color: '#4648d4', icon: 'bi-cpu',              createdAt: new Date().toISOString() },
  { id: 'c-prog',      name: 'Programming',      slug: 'programming',     audience: 'general', parentId: 'c-tech',  color: '#3a3ccc', icon: 'bi-code-slash',       createdAt: new Date().toISOString() },
  { id: 'c-web',       name: 'Web Development',  slug: 'web-dev',         audience: 'general', parentId: 'c-tech',  color: '#5b5df0', icon: 'bi-globe2',           createdAt: new Date().toISOString() },
  { id: 'c-ai',        name: 'AI & Machine Learning', slug: 'ai-ml',      audience: 'general', parentId: 'c-tech',  color: '#7a4ad9', icon: 'bi-cpu-fill',         createdAt: new Date().toISOString() },
  // Science
  { id: 'c-sci',       name: 'Science',          slug: 'science',         audience: 'both',    parentId: null,      color: '#a02a68', icon: 'bi-atom',             createdAt: new Date().toISOString() },
  { id: 'c-phys',      name: 'Physics',          slug: 'physics',         audience: 'both',    parentId: 'c-sci',   color: '#b83a7b', icon: 'bi-magnet',           createdAt: new Date().toISOString() },
  { id: 'c-chem',      name: 'Chemistry',        slug: 'chemistry',       audience: 'both',    parentId: 'c-sci',   color: '#c94a8c', icon: 'bi-eyedropper',       createdAt: new Date().toISOString() },
  { id: 'c-bio',       name: 'Biology',          slug: 'biology',         audience: 'both',    parentId: 'c-sci',   color: '#4a9d5a', icon: 'bi-tree',             createdAt: new Date().toISOString() },
  // Mathematics
  { id: 'c-math',      name: 'Mathematics',      slug: 'mathematics',     audience: 'both',    parentId: null,      color: '#2f7d4f', icon: 'bi-calculator',       createdAt: new Date().toISOString() },
  { id: 'c-algebra',   name: 'Algebra',          slug: 'algebra',         audience: 'both',    parentId: 'c-math',  color: '#3a8d5f', icon: 'bi-plus-slash-minus', createdAt: new Date().toISOString() },
  { id: 'c-geom',      name: 'Geometry',         slug: 'geometry',        audience: 'both',    parentId: 'c-math',  color: '#4a9d6f', icon: 'bi-triangle',         createdAt: new Date().toISOString() },
  // History
  { id: 'c-hist',      name: 'History',          slug: 'history',         audience: 'general', parentId: null,      color: '#8a5a2b', icon: 'bi-book',             createdAt: new Date().toISOString() },
  { id: 'c-hist-w',    name: 'World History',    slug: 'world-history',   audience: 'general', parentId: 'c-hist',  color: '#a06a3b', icon: 'bi-globe-americas',   createdAt: new Date().toISOString() },
  { id: 'c-hist-a',    name: 'Ancient Civilizations', slug: 'ancient',    audience: 'general', parentId: 'c-hist',  color: '#b57a4b', icon: 'bi-bank',             createdAt: new Date().toISOString() },
  // Languages
  { id: 'c-lang',      name: 'Languages',        slug: 'languages',       audience: 'both',    parentId: null,      color: '#c4661a', icon: 'bi-translate',        createdAt: new Date().toISOString() },
  { id: 'c-lang-en',   name: 'English',          slug: 'english',         audience: 'both',    parentId: 'c-lang',  color: '#d4762a', icon: 'bi-fonts',            createdAt: new Date().toISOString() },
  { id: 'c-lang-es',   name: 'Spanish',          slug: 'spanish',         audience: 'both',    parentId: 'c-lang',  color: '#e4863a', icon: 'bi-chat-dots',        createdAt: new Date().toISOString() },
  // Kids
  { id: 'c-kids-abc',  name: 'ABC & Phonics',    slug: 'abc-phonics',     audience: 'kids',    parentId: null,      color: '#d94a8c', icon: 'bi-alphabet',         createdAt: new Date().toISOString() },
  { id: 'c-kids-abc-l',name: 'Letters A-M',      slug: 'letters-a-m',     audience: 'kids',    parentId: 'c-kids-abc', color: '#e95a9c', icon: 'bi-type', createdAt: new Date().toISOString() },
  { id: 'c-kids-abc-p',name: 'Phonics Drills',   slug: 'phonics-drills',  audience: 'kids',    parentId: 'c-kids-abc', color: '#f96aac', icon: 'bi-mic',  createdAt: new Date().toISOString() },
  { id: 'c-kids-rhy',  name: 'Rhymes & Songs',   slug: 'rhymes',          audience: 'kids',    parentId: null,      color: '#4aa3d9', icon: 'bi-music-note-beamed', createdAt: new Date().toISOString() },
  { id: 'c-kids-rhy-c',name: 'Classic Nursery',  slug: 'classic-nursery', audience: 'kids',    parentId: 'c-kids-rhy', color: '#5ab3e9', icon: 'bi-music-note', createdAt: new Date().toISOString() },
  { id: 'c-kids-rhy-a',name: 'Action Songs',     slug: 'action-songs',    audience: 'kids',    parentId: 'c-kids-rhy', color: '#6ac3f9', icon: 'bi-person-arms-up', createdAt: new Date().toISOString() },
  { id: 'c-kids-sto',  name: 'Story Time',       slug: 'story-time',      audience: 'kids',    parentId: null,      color: '#7a4ad9', icon: 'bi-journal-richtext', createdAt: new Date().toISOString() },
  { id: 'c-kids-sto-f',name: 'Fairy Tales',      slug: 'fairy-tales',     audience: 'kids',    parentId: 'c-kids-sto', color: '#8a5ae9', icon: 'bi-stars', createdAt: new Date().toISOString() },
  { id: 'c-kids-sto-b',name: 'Bedtime Stories',  slug: 'bedtime',         audience: 'kids',    parentId: 'c-kids-sto', color: '#9a6af9', icon: 'bi-moon-stars', createdAt: new Date().toISOString() },
]

export const categoryStore = {
  list(): Category[] {
    const cur = read<Category[] | null>('categories', null)
    if (!cur) { write('categories', SEED_CATEGORIES); return SEED_CATEGORIES }
    return cur
  },
  save(cats: Category[]) { write('categories', cats) },
  create(input: Omit<Category, 'id' | 'createdAt'>): Category {
    const c: Category = { ...input, id: uid(), createdAt: new Date().toISOString() }
    const next = [c, ...this.list()]; write('categories', next); activity.log('category', `Created category "${c.name}"`); return c
  },
  update(id: string, patch: Partial<Category>) {
    const next = this.list().map(c => c.id === id ? { ...c, ...patch } : c)
    write('categories', next); activity.log('category', `Updated category "${patch.name ?? id}"`)
  },
  remove(id: string) {
    const cat = this.list().find(c => c.id === id)
    const next = this.list().filter(c => c.id !== id && c.parentId !== id)
    write('categories', next); if (cat) activity.log('category', `Deleted category "${cat.name}"`)
  },
}

/* --------------------------- Recommendations --------------------------- */

export interface Recommendation {
  id: string
  youtubeUrl: string
  title: string
  reason: string
  submittedBy: string
  submittedAt: string
  status: 'pending' | 'approved' | 'rejected'
  reviewNote?: string
  audience: 'kids' | 'general'
  categoryId?: string | null
}

const SEED_RECS: Recommendation[] = [
  { id: 'r1', youtubeUrl: 'https://youtu.be/aircAruvnKk', title: 'But what is a neural network? — 3Blue1Brown', reason: 'Great primer for AP CS students.', submittedBy: 'sara.k@school.edu', submittedAt: new Date(Date.now() - 86400000).toISOString(), status: 'pending', audience: 'general', categoryId: 'c-tech' },
  { id: 'r2', youtubeUrl: 'https://youtu.be/kufs2GbLhU8', title: 'Baby Shark Dance', reason: 'Requested by preschool teacher.', submittedBy: 'parent@family.io', submittedAt: new Date(Date.now() - 2 * 86400000).toISOString(), status: 'pending', audience: 'kids', categoryId: 'c-kids-rhy' },
  { id: 'r3', youtubeUrl: 'https://youtu.be/Y_UmWdcTrrc', title: 'The Map of Mathematics', reason: 'Excellent overview, teacher-approved.', submittedBy: 'teacher.m@school.edu', submittedAt: new Date(Date.now() - 5 * 86400000).toISOString(), status: 'approved', audience: 'general', categoryId: 'c-math', reviewNote: 'Perfect for grade 9–12 assembly.' },
]

export const recommendationStore = {
  list(): Recommendation[] {
    const cur = read<Recommendation[] | null>('recommendations', null)
    if (!cur) { write('recommendations', SEED_RECS); return SEED_RECS }
    return cur
  },
  create(input: Omit<Recommendation, 'id' | 'submittedAt' | 'status'>): Recommendation {
    const r: Recommendation = { ...input, id: uid(), submittedAt: new Date().toISOString(), status: 'pending' }
    write('recommendations', [r, ...this.list()])
    notify(`New recommendation from ${r.submittedBy}: ${r.title}`, 'lightbulb')
    activity.log('recommendation', `${r.submittedBy} submitted "${r.title}"`)
    return r
  },
  update(id: string, patch: Partial<Recommendation>) {
    write('recommendations', this.list().map(r => r.id === id ? { ...r, ...patch } : r))
    if (patch.status) activity.log('recommendation', `${patch.status === 'approved' ? 'Approved' : 'Rejected'} recommendation ${id}`)
  },
  remove(id: string) {
    write('recommendations', this.list().filter(r => r.id !== id))
  },
}

/* --------------------------------- Users -------------------------------- */

export interface AppUser {
  id: string
  name: string
  email: string
  role: 'Admin' | 'General' | 'Kids'
  avatarUrl?: string
  status: 'active' | 'invited' | 'suspended'
  kidsMode: boolean
  createdAt: string
  lastActiveAt?: string
}

const SEED_USERS: AppUser[] = [
  { id: 'u-me',  name: 'Shozab Haider',     email: 'shozab@safex.io',        role: 'Admin',   status: 'active',    kidsMode: false, createdAt: new Date().toISOString(), avatarUrl: 'https://lh3.googleusercontent.com/a/ACg8ocI3TCqAOFDc-cgZVtK7J6a6_lBN1vYfVDlHflT1E1EaByDNvjo=s288-c-no' },
  { id: 'u-lead',name: 'Sairam Abdullah',   email: 'sairam@safex.io',        role: 'Admin',   status: 'active',    kidsMode: false, createdAt: new Date().toISOString() },
  { id: 'u-1',   name: 'Amelia Chen',       email: 'amelia.c@school.edu',    role: 'General', status: 'active',    kidsMode: false, createdAt: new Date(Date.now()-9e8).toISOString() },
  { id: 'u-2',   name: 'Rahul Verma',       email: 'rahul.v@school.edu',     role: 'General', status: 'active',    kidsMode: false, createdAt: new Date(Date.now()-6e8).toISOString() },
  { id: 'u-3',   name: 'Kid Explorer',      email: 'kid1@family.io',         role: 'Kids',    status: 'active',    kidsMode: true,  createdAt: new Date(Date.now()-3e8).toISOString() },
  { id: 'u-4',   name: 'Fatima Noor',       email: 'fatima.n@school.edu',    role: 'General', status: 'invited',   kidsMode: false, createdAt: new Date().toISOString() },
  { id: 'u-5',   name: 'Suspended User',    email: 'suspended@example.com',  role: 'General', status: 'suspended', kidsMode: false, createdAt: new Date(Date.now()-2e9).toISOString() },
]

export const userStore = {
  list(): AppUser[] {
    const cur = read<AppUser[] | null>('users', null)
    if (!cur) { write('users', SEED_USERS); return SEED_USERS }
    return cur
  },
  create(input: Omit<AppUser, 'id' | 'createdAt'>): AppUser {
    const u: AppUser = { ...input, id: uid(), createdAt: new Date().toISOString() }
    write('users', [u, ...this.list()])
    activity.log('user', `Invited ${u.email} as ${u.role}`)
    return u
  },
  update(id: string, patch: Partial<AppUser>) {
    write('users', this.list().map(u => u.id === id ? { ...u, ...patch } : u))
    activity.log('user', `Updated user ${id}`)
  },
  remove(id: string) {
    const u = this.list().find(x => x.id === id)
    write('users', this.list().filter(x => x.id !== id))
    if (u) activity.log('user', `Removed ${u.email}`)
  },
}

/* ------------------------------ Notifications ---------------------------- */

export interface Notification {
  id: string
  message: string
  icon: string
  createdAt: string
  read: boolean
}

export const notificationStore = {
  list(): Notification[] {
    return read<Notification[]>('notifications', [
      { id: 'n1', message: 'Welcome to Shozab Admin. Explore the modules from the sidebar.', icon: 'bi-stars', createdAt: new Date().toISOString(), read: false },
    ])
  },
  markAllRead() {
    write('notifications', this.list().map(n => ({ ...n, read: true })))
  },
  clear() { write('notifications', []) },
}

export function notify(message: string, icon = 'bi-bell') {
  const list = notificationStore.list()
  write('notifications', [{ id: uid(), message, icon, createdAt: new Date().toISOString(), read: false }, ...list].slice(0, 30))
}

/* -------------------------------- Activity ------------------------------ */

export interface ActivityEntry {
  id: string
  kind: 'video' | 'category' | 'recommendation' | 'user' | 'system'
  message: string
  at: string
}

export const activity = {
  list(): ActivityEntry[] {
    return read<ActivityEntry[]>('activity', [
      { id: 'a0', kind: 'system', message: 'Platform initialized', at: new Date().toISOString() },
    ])
  },
  log(kind: ActivityEntry['kind'], message: string) {
    const entry: ActivityEntry = { id: uid(), kind, message, at: new Date().toISOString() }
    write('activity', [entry, ...this.list()].slice(0, 100))
  },
}

/* ------------------------------- Settings ------------------------------- */

export interface AppSettings {
  siteName: string
  supportEmail: string
  defaultLanguage: string
  quotaWarningPct: number
  autoPublishApproved: boolean
  kidsModeStrict: boolean
  timezone: string
}

const DEFAULT_SETTINGS: AppSettings = {
  siteName: 'Shozab Admin — SafeX Platform',
  supportEmail: 'support@safex.io',
  defaultLanguage: 'en',
  quotaWarningPct: 80,
  autoPublishApproved: false,
  kidsModeStrict: true,
  timezone: 'Asia/Karachi',
}

export const settingsStore = {
  get(): AppSettings { return read<AppSettings>('settings', DEFAULT_SETTINGS) },
  set(patch: Partial<AppSettings>) {
    write('settings', { ...this.get(), ...patch })
    activity.log('system', 'Updated platform settings')
  },
  reset() { write('settings', DEFAULT_SETTINGS) },
}

/* -------------------------- Kids sample library ------------------------- */

export interface KidsVideo {
  id: string
  title: string
  channel: string
  categoryId: string
  thumbnailUrl: string
  durationSeconds: number
  ageMin: number
  ageMax: number
  youTubeId: string
}

const KIDS_SEED: KidsVideo[] = [
  { id: 'k1', title: 'ABC Phonics Song', channel: 'Little Learners', categoryId: 'c-kids-abc', thumbnailUrl: 'https://i.ytimg.com/vi/BELlZKpi1Zs/hqdefault.jpg', durationSeconds: 180, ageMin: 3, ageMax: 6, youTubeId: 'BELlZKpi1Zs' },
  { id: 'k2', title: 'Twinkle Twinkle Little Star', channel: 'Rhyme Time', categoryId: 'c-kids-rhy', thumbnailUrl: 'https://i.ytimg.com/vi/yCjJyiqpAuU/hqdefault.jpg', durationSeconds: 150, ageMin: 2, ageMax: 5, youTubeId: 'yCjJyiqpAuU' },
  { id: 'k3', title: 'The Very Hungry Caterpillar', channel: 'Story Time', categoryId: 'c-kids-sto', thumbnailUrl: 'https://i.ytimg.com/vi/75NQK-Sm1YY/hqdefault.jpg', durationSeconds: 240, ageMin: 3, ageMax: 7, youTubeId: '75NQK-Sm1YY' },
  { id: 'k4', title: 'Counting 1 to 20', channel: 'Little Learners', categoryId: 'c-kids-abc', thumbnailUrl: 'https://i.ytimg.com/vi/D0Ajq682yrA/hqdefault.jpg', durationSeconds: 210, ageMin: 3, ageMax: 6, youTubeId: 'D0Ajq682yrA' },
  { id: 'k5', title: 'Baby Shark Dance', channel: 'Pinkfong', categoryId: 'c-kids-rhy', thumbnailUrl: 'https://i.ytimg.com/vi/XqZsoesa55w/hqdefault.jpg', durationSeconds: 136, ageMin: 2, ageMax: 6, youTubeId: 'XqZsoesa55w' },
  { id: 'k6', title: 'The Tortoise and the Hare', channel: 'Story Time', categoryId: 'c-kids-sto', thumbnailUrl: 'https://i.ytimg.com/vi/6yBrpvXeUCM/hqdefault.jpg', durationSeconds: 300, ageMin: 4, ageMax: 8, youTubeId: '6yBrpvXeUCM' },
]

export const kidsStore = {
  list(): KidsVideo[] { return read<KidsVideo[]>('kids-videos', KIDS_SEED) },
}
