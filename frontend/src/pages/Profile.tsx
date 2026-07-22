import { useState } from 'react'
import { useAuth, DEFAULT_AVATAR } from '../context/AuthContext'
import { activity } from '../lib/store'

export default function Profile() {
  const { user, updateProfile } = useAuth()
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? DEFAULT_AVATAR)
  const [saved, setSaved] = useState(false)
  const recent = activity.list().slice(0, 10)

  const save = () => {
    updateProfile({ name, email, avatarUrl })
    setSaved(true); setTimeout(() => setSaved(false), 1600)
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title-lg">Profile</h1>
          <p className="page-sub">Update your identity across the platform.</p>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-lg-5">
          <div className="panel panel-pad text-center">
            <img src={avatarUrl} alt="" className="profile-avatar mx-auto" />
            <div className="mt-3 fw-semibold fs-5">{name || 'Unnamed'}</div>
            <div className="small text-muted">{email}</div>
            <div className="mt-2"><span className="role-pill">{user?.role}</span></div>
            <hr className="my-3" />
            <div className="text-start">
              <label className="form-label small text-muted">Avatar URL</label>
              <input className="form-control form-control-sm" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-7">
          <div className="panel panel-pad">
            <h5 className="mb-3">Account details</h5>
            <div className="mb-3">
              <label className="form-label small text-muted">Full name</label>
              <input className="form-control" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label small text-muted">Email</label>
              <input className="form-control" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="d-flex gap-2 align-items-center">
              <button className="btn btn-primary" onClick={save}>
                <i className="bi bi-check2 me-1" /> Save changes
              </button>
              {saved && <span className="small text-success"><i className="bi bi-check-circle me-1" />Saved</span>}
            </div>
          </div>

          <div className="panel panel-pad mt-3">
            <h5 className="mb-3">Recent activity</h5>
            {recent.length === 0
              ? <div className="small text-muted">No activity yet.</div>
              : (
                <ul className="list-unstyled mb-0">
                  {recent.map(a => (
                    <li key={a.id} className="d-flex gap-2 py-2 border-bottom">
                      <i className="bi bi-dot" />
                      <div className="flex-grow-1 small">{a.message}</div>
                      <div className="small text-muted">{new Date(a.at).toLocaleString()}</div>
                    </li>
                  ))}
                </ul>
              )}
          </div>
        </div>
      </div>
    </>
  )
}
