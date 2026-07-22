import { useEffect, useState } from 'react'
import { api, fmtDuration, type Video } from '../lib/api'
import EmptyState from '../components/EmptyState'
import { Link } from 'react-router-dom'

export default function Trash() {
  const [items, setItems] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try { setItems(await api.list(undefined, true)) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title-lg">Trash</h1>
          <p className="page-sub">Soft-deleted videos. Restore or delete permanently.</p>
        </div>
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: 200 }} />
      ) : items.length === 0 ? (
        <EmptyState
          icon="bi-trash"
          title="Trash is empty"
          hint="Deleted videos will appear here for 30 days."
          action={<Link to="/library" className="btn btn-ghost btn-sm"><i className="bi bi-arrow-left me-1" /> Back to library</Link>}
        />
      ) : (
        <div className="row g-3">
          {items.map(v => (
            <div className="col-md-6 col-xl-4" key={v.id}>
              <div className="card-video">
                {v.thumbnailUrl && (
                  <div className="thumb-wrap">
                    <img className="thumb" src={v.thumbnailUrl} alt={v.title} style={{ opacity: .6 }} />
                    <span className="duration-chip">{fmtDuration(v.durationSeconds)}</span>
                  </div>
                )}
                <div className="body">
                  <div className="title">{v.title}</div>
                  <div className="meta"><i className="bi bi-person-video3 me-1" />{v.channelTitle}</div>
                  <div className="actions">
                    <button className="btn btn-sm btn-brand" onClick={async () => { await api.restore(v.id); load() }}>
                      <i className="bi bi-arrow-counterclockwise" /> Restore
                    </button>
                    <button className="btn btn-sm btn-ghost ms-auto"
                            style={{ color: 'var(--status-rejected-fg)' }}
                            onClick={async () => {
                              if (confirm('Permanently delete? This cannot be undone.')) { await api.hardDelete(v.id); load() }
                            }}>
                      <i className="bi bi-trash-fill" /> Delete forever
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
