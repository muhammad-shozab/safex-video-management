import { useEffect, useMemo, useState } from 'react'
import { recommendationStore, categoryStore, subscribe, notify, type Recommendation } from '../lib/store'

export default function Recommendations() {
  const [items, setItems] = useState<Recommendation[]>(() => recommendationStore.list())
  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending')
  const [showAdd, setShowAdd] = useState(false)
  const cats = categoryStore.list()

  useEffect(() => subscribe('recommendations', () => setItems(recommendationStore.list())), [])

  const counts = {
    pending: items.filter(i => i.status === 'pending').length,
    approved: items.filter(i => i.status === 'approved').length,
    rejected: items.filter(i => i.status === 'rejected').length,
    all: items.length,
  }
  const filtered = useMemo(() => tab === 'all' ? items : items.filter(i => i.status === tab), [items, tab])

  const decide = (r: Recommendation, status: 'approved' | 'rejected') => {
    const note = status === 'rejected' ? prompt('Reason for rejection (optional):') || '' : ''
    recommendationStore.update(r.id, { status, reviewNote: note })
    notify(`Recommendation ${status}: ${r.title}`, status === 'approved' ? 'bi-check-circle' : 'bi-x-circle')
  }

  const ytId = (url: string) => {
    const m = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{11})/)
    return m?.[1] ?? ''
  }
  const thumb = (url: string) => {
    const id = ytId(url)
    return id ? `https://i.ytimg.com/vi/${id}/mqdefault.jpg` : ''
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title-lg">Recommendations</h1>
          <p className="page-sub">Community-submitted videos awaiting moderation.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <i className="bi bi-plus-lg me-1" /> Submit recommendation
        </button>
      </div>

      <div className="panel panel-pad mb-3">
        <div className="d-flex gap-2 flex-wrap">
          {(['pending', 'approved', 'rejected', 'all'] as const).map(t => (
            <button key={t} className={`chip-tab ${tab === t ? '-active' : ''}`} onClick={() => setTab(t)}>
              {t[0].toUpperCase() + t.slice(1)} <span className="ms-1 opacity-75">{counts[t]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="row g-3">
        {filtered.map(r => {
          const cat = cats.find(c => c.id === r.categoryId)
          return (
            <div key={r.id} className="col-12 col-lg-6">
              <div className="panel rec-card h-100">
                <a href={r.youtubeUrl} target="_blank" rel="noreferrer" className="rec-thumb">
                  {thumb(r.youtubeUrl)
                    ? <img src={thumb(r.youtubeUrl)} alt="" loading="lazy" />
                    : <div className="rec-thumb-fallback"><i className="bi bi-youtube" /></div>}
                  <span className="rec-thumb-play"><i className="bi bi-play-fill" /></span>
                </a>
                <div className="rec-body">
                  <div className="d-flex gap-2 align-items-center mb-2 flex-wrap">
                    <span className={`aud-pill -${r.audience}`}>{r.audience}</span>
                    {cat && <span className="cat-chip" style={{ background: cat.color }}><i className={`bi ${cat.icon}`} /> {cat.name}</span>}
                    <span className={`status-pill -${r.status}`}>{r.status}</span>
                  </div>
                  <div className="fw-semibold rec-title">{r.title}</div>
                  <div className="small text-muted mt-1">
                    From <b>{r.submittedBy}</b> · {new Date(r.submittedAt).toLocaleDateString()}
                  </div>
                  <div className="small mt-2 rec-reason">{r.reason}</div>
                  {r.reviewNote && <div className="small text-muted mt-2 fst-italic">Note: {r.reviewNote}</div>}
                  {r.status === 'pending' && (
                    <div className="d-flex gap-2 mt-3 flex-wrap">
                      <button className="btn btn-sm btn-success" onClick={() => decide(r, 'approved')}>
                        <i className="bi bi-check2 me-1" /> Approve
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => decide(r, 'rejected')}>
                        <i className="bi bi-x me-1" /> Reject
                      </button>
                      <a className="btn btn-sm btn-outline-secondary ms-auto" href={r.youtubeUrl} target="_blank" rel="noreferrer">
                        <i className="bi bi-box-arrow-up-right me-1" /> Open
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="col-12"><div className="panel panel-pad text-center text-muted py-5">Nothing here yet.</div></div>
        )}
      </div>

      {showAdd && <AddRecommendation onClose={() => setShowAdd(false)} />}
    </>
  )
}

function AddRecommendation({ onClose }: { onClose: () => void }) {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [reason, setReason] = useState('')
  const [submittedBy, setSubmittedBy] = useState('')
  const [audience, setAudience] = useState<'kids' | 'general'>('general')
  const cats = categoryStore.list()
  const [categoryId, setCategoryId] = useState<string>(cats[0]?.id ?? '')

  const submit = () => {
    if (!url || !title || !submittedBy) return
    recommendationStore.create({ youtubeUrl: url, title, reason, submittedBy, audience, categoryId })
    onClose()
  }

  return (
    <div className="modal-backdrop-x" onClick={onClose}>
      <div className="panel panel-pad" style={{ width: 'min(560px, 94vw)' }} onClick={e => e.stopPropagation()}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Submit a recommendation</h5>
          <button className="icon-btn" onClick={onClose}><i className="bi bi-x-lg" /></button>
        </div>
        <div className="mb-2"><label className="form-label small text-muted">YouTube URL</label>
          <input className="form-control" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://youtu.be/..." /></div>
        <div className="mb-2"><label className="form-label small text-muted">Suggested title</label>
          <input className="form-control" value={title} onChange={e => setTitle(e.target.value)} /></div>
        <div className="mb-2"><label className="form-label small text-muted">Why should we add this?</label>
          <textarea className="form-control" rows={3} value={reason} onChange={e => setReason(e.target.value)} /></div>
        <div className="row g-2">
          <div className="col-6"><label className="form-label small text-muted">Audience</label>
            <select className="form-select" value={audience} onChange={e => setAudience(e.target.value as any)}>
              <option value="general">General</option><option value="kids">Kids</option></select></div>
          <div className="col-6"><label className="form-label small text-muted">Category</label>
            <select className="form-select" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
              {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select></div>
        </div>
        <div className="mt-2"><label className="form-label small text-muted">Your email</label>
          <input className="form-control" value={submittedBy} onChange={e => setSubmittedBy(e.target.value)} placeholder="you@school.edu" /></div>
        <div className="d-flex justify-content-end gap-2 mt-4">
          <button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={!url || !title || !submittedBy}>Submit</button>
        </div>
      </div>
    </div>
  )
}
