import { useEffect, useMemo, useState } from 'react'
import { userStore, subscribe, type AppUser } from '../lib/store'
import { DEFAULT_AVATAR } from '../context/AuthContext'

export default function Users() {
  const [users, setUsers] = useState<AppUser[]>(() => userStore.list())
  const [q, setQ] = useState('')
  const [role, setRole] = useState<'all' | AppUser['role']>('all')
  const [showInvite, setShowInvite] = useState(false)

  useEffect(() => subscribe('users', () => setUsers(userStore.list())), [])

  const filtered = useMemo(() => users
    .filter(u => role === 'all' || u.role === role)
    .filter(u => !q || u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase())),
    [users, q, role])

  const counts = {
    total: users.length,
    admins: users.filter(u => u.role === 'Admin').length,
    general: users.filter(u => u.role === 'General').length,
    kids: users.filter(u => u.role === 'Kids').length,
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title-lg">Users & Roles</h1>
          <p className="page-sub">Manage platform members and their access levels.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowInvite(true)}>
          <i className="bi bi-person-plus me-1" /> Invite user
        </button>
      </div>

      <div className="row g-3 mb-3">
        {[
          { label: 'Total users', v: counts.total, icon: 'bi-people' },
          { label: 'Admins', v: counts.admins, icon: 'bi-shield-lock' },
          { label: 'General', v: counts.general, icon: 'bi-person' },
          { label: 'Kids', v: counts.kids, icon: 'bi-emoji-smile' },
        ].map(c => (
          <div className="col-6 col-md-3" key={c.label}>
            <div className="stat-card">
              <div className="stat-ic"><i className={`bi ${c.icon}`} /></div>
              <div>
                <div className="stat-num">{c.v}</div>
                <div className="stat-lbl">{c.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="panel panel-pad mb-3">
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <div className="input-group" style={{ maxWidth: 340 }}>
            <span className="input-group-text"><i className="bi bi-search" /></span>
            <input className="form-control" placeholder="Search users..." value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <div className="d-flex gap-1">
            {(['all', 'Admin', 'General', 'Kids'] as const).map(r => (
              <button key={r} className={`chip-tab ${role === r ? '-active' : ''}`} onClick={() => setRole(r)}>{r}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="panel users-panel">
        <div className="table-responsive">
          <table className="table users-table mb-0 align-middle">
            <thead>
              <tr>
                <th>User</th>
                <th className="text-center">Role</th>
                <th className="text-center">Status</th>
                <th className="text-center">Joined</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <img className="avatar-img" src={u.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.email || u.id)}`} alt="" style={{ width: 34, height: 34 }} />
                      <div className="min-w-0">
                        <div className="fw-medium text-truncate">{u.name}</div>
                        <div className="small text-muted text-truncate">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-center">
                    <select
                      className="form-select form-select-sm role-select"
                      value={u.role}
                      onChange={e => userStore.update(u.id, { role: e.target.value as any, kidsMode: e.target.value === 'Kids' })}
                    >
                      <option>Admin</option><option>General</option><option>Kids</option>
                    </select>
                  </td>
                  <td className="text-center"><span className={`status-pill -${u.status}`}>{u.status}</span></td>
                  <td className="text-center small text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="text-center">
                    <div className="d-inline-flex gap-1 justify-content-center flex-wrap">
                      {u.status === 'suspended'
                        ? <button className="btn btn-sm btn-outline-success" onClick={() => userStore.update(u.id, { status: 'active' })}>Activate</button>
                        : <button className="btn btn-sm btn-outline-warning" onClick={() => userStore.update(u.id, { status: 'suspended' })}>Suspend</button>}
                      <button className="btn btn-sm btn-outline-danger" onClick={() => { if (confirm(`Remove ${u.email}?`)) userStore.remove(u.id) }}>Remove</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center text-muted py-4">No users match.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showInvite && <InviteUser onClose={() => setShowInvite(false)} />}
    </>
  )
}

function InviteUser({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<AppUser['role']>('General')

  const submit = () => {
    if (!name || !email) return
    userStore.create({ name, email, role, kidsMode: role === 'Kids', status: 'invited' })
    onClose()
  }

  return (
    <div className="modal-backdrop-x" onClick={onClose}>
      <div className="panel panel-pad" style={{ width: 'min(480px, 94vw)' }} onClick={e => e.stopPropagation()}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Invite a user</h5>
          <button className="icon-btn" onClick={onClose}><i className="bi bi-x-lg" /></button>
        </div>
        <div className="mb-2"><label className="form-label small text-muted">Full name</label>
          <input className="form-control" value={name} onChange={e => setName(e.target.value)} /></div>
        <div className="mb-2"><label className="form-label small text-muted">Email</label>
          <input className="form-control" value={email} onChange={e => setEmail(e.target.value)} placeholder="user@school.edu" /></div>
        <div className="mb-3"><label className="form-label small text-muted">Role</label>
          <select className="form-select" value={role} onChange={e => setRole(e.target.value as any)}>
            <option>Admin</option><option>General</option><option>Kids</option>
          </select></div>
        <div className="d-flex justify-content-end gap-2">
          <button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={!name || !email}>Send invite</button>
        </div>
      </div>
    </div>
  )
}
