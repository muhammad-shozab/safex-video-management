import { useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth, DEFAULT_AVATAR, type Role } from '../context/AuthContext'
import { useEffect, useRef, useState } from 'react'
import { notificationStore, subscribe, type Notification } from '../lib/store'

const TITLES: Record<string, string> = {
  '/': 'Search YouTube',
  '/dashboard': 'Admin Dashboard',
  '/library': 'Video Library',
  '/trash': 'Trash',
  '/categories': 'Category Management',
  '/recommendations': 'Recommendations',
  '/users': 'Users & Roles',
  '/kids': 'Kids Panel',
  '/profile': 'Profile',
  '/settings': 'Settings',
  '/login': 'Sign in',
}

export default function Topbar({ onMenu }: { onMenu: () => void }) {
  const { pathname } = useLocation()
  const nav = useNavigate()
  const { theme, toggle } = useTheme()
  const { user, signInAs, signOut } = useAuth()
  const [openRole, setOpenRole] = useState(false)
  const [openNotif, setOpenNotif] = useState(false)
  const [openHelp, setOpenHelp] = useState(false)
  const [notifs, setNotifs] = useState<Notification[]>([])
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const load = () => setNotifs(notificationStore.list())
    load()
    return subscribe('notifications', load)
  }, [])

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpenRole(false); setOpenNotif(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const title = TITLES[pathname] || (pathname.startsWith('/review') ? 'Review Video'
    : pathname.startsWith('/publish') ? 'Publish Video'
    : pathname.startsWith('/edit') ? 'Edit Video' : 'Shozab Admin')

  const unread = notifs.filter(n => !n.read).length

  return (
    <header className="topbar" ref={ref}>
      <button className="icon-btn -menu" onClick={onMenu} aria-label="Open menu">
        <i className="bi bi-list fs-5" />
      </button>

      <h1 className="page-title">{title}</h1>
      <div className="spacer" />

      {user && <span className="role-pill d-none d-sm-inline">Role: {user.role}</span>}

      <button className="icon-btn" onClick={toggle} title="Toggle theme" aria-label="Toggle theme">
        <i className={`bi ${theme === 'dark' ? 'bi-sun' : 'bi-moon-stars'}`} />
      </button>

      <div className="position-relative">
        <button
          className="icon-btn"
          title="Notifications"
          onClick={() => { setOpenNotif(o => !o); setOpenRole(false) }}
        >
          <i className="bi bi-bell" />
          {unread > 0 && <span className="notif-dot">{unread}</span>}
        </button>
        {openNotif && (
          <div className="panel panel-pad position-absolute end-0 mt-2" style={{ width: 340, zIndex: 60 }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="fw-semibold">Notifications</div>
              <button className="btn btn-sm btn-link p-0" onClick={() => { notificationStore.markAllRead() }}>Mark all read</button>
            </div>
            <div style={{ maxHeight: 320, overflowY: 'auto' }}>
              {notifs.length === 0 && <div className="small text-muted py-3 text-center">All caught up.</div>}
              {notifs.map(n => (
                <div key={n.id} className={`notif-row ${n.read ? '' : '-unread'}`}>
                  <i className={`bi ${n.icon}`} />
                  <div>
                    <div className="small">{n.message}</div>
                    <div className="text-muted" style={{ fontSize: 11 }}>{new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
            {notifs.length > 0 && (
              <>
                <hr className="my-2" />
                <button className="btn btn-sm w-100" onClick={() => notificationStore.clear()}>Clear all</button>
              </>
            )}
          </div>
        )}
      </div>

      <button
        className="icon-btn d-none d-sm-inline-grid"
        title="Help"
        onClick={() => setOpenHelp(true)}
      >
        <i className="bi bi-question-circle" />
      </button>

      <div className="position-relative">
        <button
          onClick={() => { setOpenRole(o => !o); setOpenNotif(false) }}
          className="d-flex align-items-center gap-2 border-0 bg-transparent p-1"
          aria-label="Account"
        >
          <img className="avatar-img" src={user?.avatarUrl || DEFAULT_AVATAR} alt="" />
        </button>
        {openRole && (
          <div
            className="panel panel-pad position-absolute end-0 mt-2"
            style={{ width: 260, zIndex: 60 }}
          >
            <div className="d-flex align-items-center gap-2 mb-2">
              <img className="avatar-img" src={user?.avatarUrl || DEFAULT_AVATAR} alt="" style={{ width: 40, height: 40 }} />
              <div>
                <div className="fw-semibold">{user?.name}</div>
                <div className="small text-muted">{user?.email}</div>
              </div>
            </div>
            <hr className="my-2" />
            <button className="sf-menu-item" onClick={() => { setOpenRole(false); nav('/profile') }}>
              <i className="bi bi-person-circle" /> View profile
            </button>
            <button className="sf-menu-item" onClick={() => { setOpenRole(false); nav('/settings') }}>
              <i className="bi bi-gear" /> Settings
            </button>
            <div className="small text-muted mt-2 mb-1">Switch role (demo)</div>
            <div className="d-flex gap-1 flex-wrap">
              {(['Admin', 'General', 'Kids'] as Role[]).map(r => (
                <button
                  key={r}
                  className={`chip-tab ${user?.role === r ? '-active' : ''}`}
                  onClick={() => { signInAs(r); setOpenRole(false) }}
                >
                  {r}
                </button>
              ))}
            </div>
            <hr className="my-2" />
            <button className="sf-menu-item -danger" onClick={() => { signOut(); setOpenRole(false); nav('/login') }}>
              <i className="bi bi-box-arrow-right" /> Sign out
            </button>
          </div>
        )}
      </div>

      {openHelp && (
        <div className="modal-backdrop-x" onClick={() => setOpenHelp(false)}>
          <div className="panel panel-pad" style={{ width: 'min(560px, 92vw)' }} onClick={e => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="mb-0">Help & shortcuts</h5>
              <button className="icon-btn" onClick={() => setOpenHelp(false)}><i className="bi bi-x-lg" /></button>
            </div>
            <ul className="mb-0 small">
              <li><b>Search</b> — pull videos from YouTube and import to Library.</li>
              <li><b>Review</b> — verify educational quality and copyright before publishing.</li>
              <li><b>Publish</b> — assign audience (Kids/General) and a category.</li>
              <li><b>Categories</b> — full CRUD taxonomy for Kids and General.</li>
              <li><b>Recommendations</b> — moderate community-submitted videos.</li>
              <li><b>Users & Roles</b> — invite users and assign Admin/General/Kids.</li>
            </ul>
          </div>
        </div>
      )}
    </header>
  )
}
