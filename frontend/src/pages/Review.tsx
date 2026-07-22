import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, fmtDuration, fmtViews, type Video } from '../lib/api'

const CHECKS = [
  { id: 'quality',   label: 'Educational quality is acceptable', icon: 'bi-mortarboard' },
  { id: 'language',  label: 'Language is appropriate',           icon: 'bi-translate' },
  { id: 'audience',  label: 'Target audience is clear',          icon: 'bi-people' },
  { id: 'copyright', label: 'No copyright concerns',             icon: 'bi-shield-check' },
  { id: 'category',  label: 'Category fits the platform',        icon: 'bi-tags' },
  { id: 'desc',      label: 'Description is accurate',           icon: 'bi-card-text' },
]

export default function Review() {
  const { id } = useParams()
  const nav = useNavigate()
  const [v, setV] = useState<Video | null>(null)
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState<'Approved' | 'Rejected' | null>(null)

  useEffect(() => { api.get(Number(id)).then(v => { setV(v); setNotes(v.reviewNotes ?? '') }) }, [id])

  if (!v) return <div className="skeleton" style={{ height: 400 }} />

  const okCount = Object.values(checked).filter(Boolean).length
  const allOk = okCount === CHECKS.length

  async function submit(status: 'Approved' | 'Rejected') {
    setSubmitting(status)
    try { await api.review(v!.id, { reviewNotes: notes, status }); nav('/library') }
    finally { setSubmitting(null) }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <Link to="/library" className="small text-muted text-decoration-none">
            <i className="bi bi-arrow-left me-1" /> Back to library
          </Link>
          <h1 className="page-title-lg mt-1">Review Video</h1>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="panel">
            <div className="ratio ratio-16x9" style={{ borderRadius: 0, overflow: 'hidden' }}>
              <iframe src={`https://www.youtube.com/embed/${v.youTubeId}`} allowFullScreen title={v.title} />
            </div>
            <div className="panel-pad">
              <h4 className="fw-bold mb-2">{v.title}</h4>
              <div className="d-flex gap-3 flex-wrap small text-muted mb-3">
                <span><i className="bi bi-person-video3 me-1" />{v.channelTitle}</span>
                <span><i className="bi bi-clock me-1" />{fmtDuration(v.durationSeconds)}</span>
                <span><i className="bi bi-eye me-1" />{fmtViews(v.viewCount)} views</span>
              </div>
              <p className="small" style={{ color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>
                {v.description || 'No description provided.'}
              </p>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="panel panel-pad" style={{ position: 'sticky', top: 84 }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0"><i className="bi bi-clipboard-check me-2" />Checklist</h5>
              <span className="small text-muted">{okCount}/{CHECKS.length}</span>
            </div>

            {CHECKS.map(c => (
              <label key={c.id} className={`checklist-item ${checked[c.id] ? 'checked' : ''}`}>
                <input
                  className="form-check-input m-0"
                  type="checkbox"
                  checked={!!checked[c.id]}
                  onChange={e => setChecked(s => ({ ...s, [c.id]: e.target.checked }))}
                />
                <i className={`bi ${c.icon}`} style={{ color: 'var(--brand-2)' }} />
                <span className="small">{c.label}</span>
              </label>
            ))}

            <label className="form-label mt-3 small fw-semibold">Review notes</label>
            <textarea
              className="form-control"
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Optional notes for the record…"
            />

            <div className="d-flex gap-2 mt-3">
              <button className="btn btn-brand flex-fill" disabled={!allOk || !!submitting} onClick={() => submit('Approved')}>
                {submitting === 'Approved'
                  ? <span className="spinner-border spinner-border-sm" />
                  : <><i className="bi bi-check2-circle me-1" /> Approve</>}
              </button>
              <button className="btn btn-ghost flex-fill" disabled={!!submitting} onClick={() => submit('Rejected')}
                      style={{ color: 'var(--status-rejected-fg)' }}>
                {submitting === 'Rejected'
                  ? <span className="spinner-border spinner-border-sm" />
                  : <><i className="bi bi-x-circle me-1" /> Reject</>}
              </button>
            </div>
            {!allOk && <div className="small text-muted mt-2"><i className="bi bi-info-circle me-1" />Tick all items to enable approve.</div>}
          </div>
        </div>
      </div>
    </>
  )
}
