import { NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useAuth, DEFAULT_AVATAR } from '../context/AuthContext'

interface NavEntry {
  to: string
  label: string
  icon: string
  end?: boolean
  roles?: Array<'Admin' | 'General' | 'Kids'>
  badge?: string
}

const NAV_GROUPS: Array<{ label: string; kicker?: string; items: NavEntry[] }> = [
  {
    label: 'Overview', kicker: '01',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: 'bi-columns-gap', roles: ['Admin'] },
    ],
  },
  {
    label: 'Video Management', kicker: '02',
    items: [
      { to: '/', label: 'Search YouTube', icon: 'bi-search', end: true, roles: ['Admin'] },
      { to: '/library', label: 'Library', icon: 'bi-collection-play', roles: ['Admin'] },
      { to: '/trash', label: 'Trash', icon: 'bi-trash3', roles: ['Admin'] },
    ],
  },
  {
    label: 'Platform Modules', kicker: '03',
    items: [
      { to: '/categories', label: 'Categories', icon: 'bi-tags', roles: ['Admin'] },
      { to: '/recommendations', label: 'Recommendations', icon: 'bi-lightbulb', roles: ['Admin'] },
      { to: '/users', label: 'Users & Roles', icon: 'bi-people', roles: ['Admin'] },
    ],
  },
  {
    label: 'Explore', kicker: '04',
    items: [
      { to: '/kids', label: 'Kids Panel', icon: 'bi-emoji-smile', roles: ['Admin', 'Kids'] },
    ],
  },
  {
    label: 'Account', kicker: '05',
    items: [
      { to: '/profile', label: 'Profile', icon: 'bi-person-badge' },
      { to: '/settings', label: 'Settings', icon: 'bi-gear' },
    ],
  },
]

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, signOut } = useAuth()
  const nav = useNavigate()
  const role = user?.role ?? 'Admin'
  const [menu, setMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (menu && menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [menu])

  return (
    <>
      <aside className={`sidebar ${open ? '-open' : ''}`}>
        <div className="brand">
          <div className="brand-avatar-wrap" aria-hidden>
            <img className="brand-avatar" src={user?.avatarUrl || DEFAULT_AVATAR} alt="" />
            <span className="brand-status" />
          </div>
          <div className="brand-text">
            <div className="brand-name">Shozab<span className="brand-name-dim">/Admin</span></div>
            <div className="brand-tag">SafeX Educational Platform</div>
          </div>
        </div>

        <nav className="side-nav">
          {NAV_GROUPS.map(group => {
            const items = group.items.filter(i => !i.roles || i.roles.includes(role))
            if (items.length === 0) return null
            return (
              <div key={group.label} className="nav-group">
                <div className="nav-section">
                  {group.kicker && <span className="nav-kicker">{group.kicker}</span>}
                  <span>{group.label}</span>
                </div>
                {items.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className="nav-item"
                    onClick={onClose}
                  >
                    <span className="nav-ic"><i className={`bi ${item.icon}`} /></span>
                    <span className="nav-lbl">{item.label}</span>
                    {item.badge && <span className="nav-badge">{item.badge}</span>}
                    <span className="nav-caret" aria-hidden><i className="bi bi-chevron-right" /></span>
                  </NavLink>
                ))}
              </div>
            )
          })}
        </nav>

        <div className="sidebar-footer" ref={menuRef}>
          <div className="sf-user">
            <img className="sf-avatar-img" src={user?.avatarUrl || DEFAULT_AVATAR} alt="" />
            <div className="sf-meta">
              <div className="sf-name">{user?.name ?? 'Shozab Haider'}</div>
              <div className="sf-role">{role} · Online</div>
            </div>
            <button
              className="sf-more"
              aria-label="Account menu"
              onClick={() => setMenu(m => !m)}
            >
              <i className="bi bi-three-dots" />
            </button>

            {menu && (
              <div className="sf-menu">
                <button className="sf-menu-item" onClick={() => { setMenu(false); onClose(); nav('/profile') }}>
                  <i className="bi bi-person-circle" /> View profile
                </button>
                <button className="sf-menu-item" onClick={() => { setMenu(false); onClose(); nav('/settings') }}>
                  <i className="bi bi-gear" /> Settings
                </button>
                <button className="sf-menu-item" onClick={() => { setMenu(false); onClose(); nav('/users') }}>
                  <i className="bi bi-people" /> Manage users
                </button>
                <button className="sf-menu-item" onClick={() => {
                  const data = JSON.stringify(Object.fromEntries(Object.entries(localStorage).filter(([k]) => k.startsWith('shozab'))), null, 2)
                  const blob = new Blob([data], { type: 'application/json' })
                  const url = URL.createObjectURL(blob); const a = document.createElement('a')
                  a.href = url; a.download = 'shozab-workspace.json'; a.click(); URL.revokeObjectURL(url)
                  setMenu(false)
                }}>
                  <i className="bi bi-download" /> Export workspace
                </button>
                <div className="sf-menu-sep" />
                <button className="sf-menu-item -danger" onClick={() => { setMenu(false); signOut(); nav('/login') }}>
                  <i className="bi bi-box-arrow-right" /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <div className={`sidebar-overlay ${open ? '-on' : ''}`} onClick={onClose} />
    </>
  )
}
