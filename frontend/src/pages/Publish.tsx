import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, type Category, type Video } from '../lib/api'

export default function Publish() {
  const { id } = useParams()
  const nav = useNavigate()
  const [v, setV] = useState<Video | null>(null)
  const [cats, setCats] = useState<Category[]>([])
  const [audience, setAudience] = useState<'kids' | 'general'>('general')
  const [cat, setCat] = useState<number | ''>('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    api.get(Number(id)).then(x => {
      setV(x)
      if (x.categoryId) setCat(x.categoryId)
      if (x.audience) setAudience(x.audience as any)
    })
    api.categories().then(setCats)
  }, [id])

  if (!v) return <div className="skeleton" style={{ height: 300 }} />

  async function submit() {
    setErr('')
    if (!cat) { setErr('Please select a category.'); return }
    setBusy(true)
    try { await api.publish(v!.id, { audience, categoryId: Number(cat) }); nav('/library') }
    catch (e: any) { setErr(e.message) }
    finally { setBusy(false) }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <Link to="/library" className="small text-muted text-decoration-none">
            <i className="bi bi-arrow-left me-1" /> Back to library
          </Link>
          <h1 className="page-title-lg mt-1">Publish Video</h1>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-5">
          <div className="panel panel-pad">
            <div className="ratio ratio-16x9 mb-3" style={{ borderRadius: 0, overflow: 'hidden' }}>
              {v.thumbnailUrl && <img src={v.thumbnailUrl} alt={v.title} style={{ objectFit: 'cover' }} />}
            </div>
            <div className="fw-semibold">{v.title}</div>
            <div className="small text-muted mt-1">{v.channelTitle}</div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="panel panel-pad">
            <h5 className="fw-bold mb-1">Step 1 - Choose audience</h5>
            <p className="small text-muted mb-3">Kids audiences see only content marked kids-safe.</p>

            <div className="audience-picker mb-4">
              <div className={`audience-option ${audience === 'kids' ? '-selected' : ''}`} onClick={() => setAudience('kids')}>
                <i className="bi bi-emoji-smile" />
                <div className="lbl">Kids</div>
                <div className="desc">Age-appropriate, educational, safe.</div>
              </div>
              <div className={`audience-option ${audience === 'general' ? '-selected' : ''}`} onClick={() => setAudience('general')}>
                <i className="bi bi-people" />
                <div className="lbl">General</div>
                <div className="desc">Everyone, including adult learners.</div>
              </div>
            </div>

            <h5 className="fw-bold mb-1">Step 2 - Assign category</h5>
            <p className="small text-muted mb-3">Helps users browse and filter content.</p>
            <select className="form-select mb-4" value={cat} onChange={e => setCat(e.target.value ? Number(e.target.value) : '')}>
              <option value="">-- Select a category --</option>
              {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            {err && <div className="alert alert-danger py-2 small mb-3">{err}</div>}

            <div className="d-flex gap-2">
              <button className="btn btn-brand" onClick={submit} disabled={busy}>
                {busy ? <span className="spinner-border spinner-border-sm" />
                      : <><i className="bi bi-broadcast me-1" /> Publish now</>}
              </button>
              <Link to="/library" className="btn btn-ghost">Cancel</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
