import { useState } from 'react'
import { settingsStore, activity } from '../lib/store'
import { useTheme } from '../context/ThemeContext'

export default function Settings() {
  const [s, setS] = useState(settingsStore.get())
  const { theme, setTheme } = useTheme()
  const [saved, setSaved] = useState(false)

  const save = () => { settingsStore.set(s); setSaved(true); setTimeout(() => setSaved(false), 1600) }
  const reset = () => { if (confirm('Reset all settings to defaults?')) { settingsStore.reset(); setS(settingsStore.get()) } }
  const wipe = () => {
    if (!confirm('This clears all local data (categories, users, recommendations). Continue?')) return
    Object.keys(localStorage).filter(k => k.startsWith('shozab')).forEach(k => localStorage.removeItem(k))
    activity.log('system', 'Workspace wiped')
    location.reload()
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title-lg">Settings</h1>
          <p className="page-sub">Platform configuration and preferences.</p>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-lg-6">
          <div className="panel panel-pad">
            <h5 className="mb-3">Platform</h5>
            <div className="mb-3"><label className="form-label small text-muted">Site name</label>
              <input className="form-control" value={s.siteName} onChange={e => setS({ ...s, siteName: e.target.value })} /></div>
            <div className="mb-3"><label className="form-label small text-muted">Support email</label>
              <input className="form-control" value={s.supportEmail} onChange={e => setS({ ...s, supportEmail: e.target.value })} /></div>
            <div className="row g-3">
              <div className="col-6"><label className="form-label small text-muted">Default language</label>
                <select className="form-select" value={s.defaultLanguage} onChange={e => setS({ ...s, defaultLanguage: e.target.value })}>
                  <option value="en">English</option><option value="ur">Urdu</option><option value="ar">Arabic</option><option value="fr">French</option>
                </select></div>
              <div className="col-6"><label className="form-label small text-muted">Timezone</label>
                <select className="form-select" value={s.timezone} onChange={e => setS({ ...s, timezone: e.target.value })}>
                  <option>Asia/Karachi</option><option>UTC</option><option>Europe/London</option><option>America/New_York</option>
                </select></div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="panel panel-pad">
            <h5 className="mb-3">Content policy</h5>
            <div className="form-check form-switch mb-2">
              <input className="form-check-input" type="checkbox" id="auto" checked={s.autoPublishApproved} onChange={e => setS({ ...s, autoPublishApproved: e.target.checked })} />
              <label className="form-check-label small" htmlFor="auto">Auto-publish videos after admin approval</label>
            </div>
            <div className="form-check form-switch mb-3">
              <input className="form-check-input" type="checkbox" id="strict" checked={s.kidsModeStrict} onChange={e => setS({ ...s, kidsModeStrict: e.target.checked })} />
              <label className="form-check-label small" htmlFor="strict">Strict Kids Mode (block all comments and external links)</label>
            </div>
            <div className="mb-3">
              <label className="form-label small text-muted d-flex justify-content-between">
                <span>YouTube quota warning threshold</span><b>{s.quotaWarningPct}%</b>
              </label>
              <input type="range" className="form-range" min={50} max={95} value={s.quotaWarningPct} onChange={e => setS({ ...s, quotaWarningPct: +e.target.value })} />
            </div>
          </div>

          <div className="panel panel-pad mt-3">
            <h5 className="mb-3">Appearance</h5>
            <div className="d-flex gap-2">
              {(['light', 'dark'] as const).map(t => (
                <button key={t} className={`chip-tab ${theme === t ? '-active' : ''}`} onClick={() => setTheme(t)}>
                  <i className={`bi ${t === 'dark' ? 'bi-moon-stars' : 'bi-sun'} me-1`} />{t[0].toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="d-flex gap-2 align-items-center">
            <button className="btn btn-primary" onClick={save}><i className="bi bi-check2 me-1" />Save settings</button>
            <button className="btn btn-outline-secondary" onClick={reset}>Reset defaults</button>
            <button className="btn btn-outline-danger ms-auto" onClick={wipe}><i className="bi bi-trash3 me-1" />Wipe workspace</button>
            {saved && <span className="small text-success"><i className="bi bi-check-circle me-1" />Saved</span>}
          </div>
        </div>
      </div>
    </>
  )
}
