import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, type Category, type Video } from '../lib/api'

export default function Edit() {
  const { id } = useParams()
  const nav = useNavigate()
  const [v, setV] = useState<Video | null>(null)
  const [cats, setCats] = useState<Category[]>([])
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api.get(Number(id)).then(setV)
    api.categories().then(setCats)
  }, [id])

  if (!v) return <div className="skeleton" style={{ height: 400 }} />

  function set<K extends keyof Video>(k: K, val: Video[K]) {
    setV(prev => (prev ? { ...prev, [k]: val } : prev))
  }

  async function save() {
    setBusy(true)
    try {
      await api.edit(v!.id, {
        title: v!.title, description: v!.description, thumbnailUrl: v!.thumbnailUrl,
        categoryId: v!.categoryId, language: v!.language, audience: v!.audience, status: v!.status,
      })
      nav('/library')
    } finally { setBusy(false) }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <Link to="/library" className="small text-muted text-decoration-none">
            <i className="bi bi-arrow-left me-1" /> Back to library
          </Link>
          <h1 className="page-title-lg mt-1">Edit Video</h1>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="panel panel-pad">
            {v.thumbnailUrl && (
              <img src={v.thumbnailUrl} alt="" className="w-100 rounded mb-3" style={{ aspectRatio: '16/9', objectFit: 'cover' }} />
            )}
            <div className="small text-muted"><i className="bi bi-broadcast me-1" />Status</div>
            <div className="fw-semibold mb-2">{v.status}</div>
            <div className="small text-muted"><i className="bi bi-people me-1" />Audience</div>
            <div className="fw-semibold">{v.audience}</div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="panel panel-pad">
            <label className="form-label small fw-semibold">Title</label>
            <input className="form-control mb-3" value={v.title} onChange={e => set('title', e.target.value)} />

            <label className="form-label small fw-semibold">Description</label>
            <textarea className="form-control mb-3" rows={4} value={v.description ?? ''} onChange={e => set('description', e.target.value)} />

            <label className="form-label small fw-semibold">Thumbnail URL</label>
            <input className="form-control mb-3" value={v.thumbnailUrl ?? ''} onChange={e => set('thumbnailUrl', e.target.value)} />

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Category</label>
                <select className="form-select" value={v.categoryId ?? ''}
                        onChange={e => set('categoryId', e.target.value ? Number(e.target.value) : undefined)}>
                  <option value="">-- none --</option>
                  {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-semibold">Language</label>
                <input className="form-control" value={v.language ?? ''} onChange={e => set('language', e.target.value)} placeholder="en" />
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-semibold">Audience</label>
                <select className="form-select" value={v.audience} onChange={e => set('audience', e.target.value)}>
                  <option value="general">General</option>
                  <option value="kids">Kids</option>
                </select>
              </div>
            </div>

            <label className="form-label small fw-semibold mt-3">Status</label>
            <select className="form-select mb-4" value={v.status} onChange={e => set('status', e.target.value)}>
              {['Pending','Approved','Published','Rejected'].map(s => <option key={s}>{s}</option>)}
            </select>

            <div className="d-flex gap-2">
              <button className="btn btn-brand" onClick={save} disabled={busy}>
                {busy ? <span className="spinner-border spinner-border-sm" />
                      : <><i className="bi bi-save me-1" /> Save changes</>}
              </button>
              <Link to="/library" className="btn btn-ghost">Cancel</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
