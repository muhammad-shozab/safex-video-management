/**
 * SafeX API client.
 *
 * INTEGRATION NOTE (Auth teammate):
 *   Once ASP.NET Core Identity is wired up, attach the JWT here.
 *   Uncomment the `getToken()` line and store the token in
 *   localStorage under 'safex.token' after login.
 */
const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5080'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('safex.token')
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string> | undefined),
  }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, { ...init, headers })
  if (!res.ok) throw new Error((await res.text()) || res.statusText)
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export interface Category { id: number; name: string; slug: string; parentId?: number | null }

export interface Video {
  id: number
  youTubeId: string
  title: string
  description?: string
  channelTitle?: string
  thumbnailUrl?: string
  durationSeconds: number
  viewCount: number
  language?: string
  audience: string
  status: string
  categoryId?: number
  category?: Category
  isDeleted: boolean
  reviewNotes?: string
  createdAt: string
  updatedAt: string
}

export interface YtItem {
  youTubeId: string
  title: string
  description: string
  channelTitle: string
  thumbnailUrl: string
  durationSeconds: number
  viewCount: number
}

export const api = {
  categories: () => req<Category[]>('/api/categories'),
  ytSearch: (q: string) => req<YtItem[]>(`/api/videos/search?q=${encodeURIComponent(q)}`),
  import: (youTubeId: string) => req<Video>('/api/videos/import', { method: 'POST', body: JSON.stringify({ youTubeId }) }),
  list: (status?: string, includeDeleted = false) => {
    const p = new URLSearchParams()
    if (status) p.set('status', status)
    if (includeDeleted) p.set('includeDeleted', 'true')
    const q = p.toString()
    return req<Video[]>(`/api/videos${q ? '?' + q : ''}`)
  },
  get: (id: number) => req<Video>(`/api/videos/${id}`),
  review: (id: number, body: { reviewNotes: string; status: 'Approved' | 'Rejected' }) =>
    req<Video>(`/api/videos/${id}/review`, { method: 'POST', body: JSON.stringify(body) }),
  publish: (id: number, body: { audience: 'kids' | 'general'; categoryId: number }) =>
    req<Video>(`/api/videos/${id}/publish`, { method: 'POST', body: JSON.stringify(body) }),
  edit: (id: number, body: Partial<Video>) =>
    req<Video>(`/api/videos/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  softDelete: (id: number) => req<void>(`/api/videos/${id}`, { method: 'DELETE' }),
  restore: (id: number) => req<Video>(`/api/videos/${id}/restore`, { method: 'POST' }),
  hardDelete: (id: number) => req<void>(`/api/videos/${id}/permanent`, { method: 'DELETE' }),
}

export function fmtDuration(sec: number) {
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`
}
export function fmtViews(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return String(n)
}
