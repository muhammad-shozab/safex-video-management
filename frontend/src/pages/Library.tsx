import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, fmtDuration, type Video } from '../lib/api'
import StatusBadge from '../components/StatusBadge'
import EmptyState from '../components/EmptyState'

const TABS = ['All', 'Pending', 'Approved', 'Published', 'Rejected'] as const

export default function Library() {
  const [videos, setVideos] = useState<Video[]>([])
  const [tab, setTab] = useState<typeof TABS[number]>('All')
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try { setVideos(await api.list(undefined, false)) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const counts = useMemo(() => TABS.reduce((acc, t) => {
    acc[t] = t === 'All' ? videos.length : videos.filter(v => v.status === t).length
    return acc
  }, {} as Record<string, number>), [videos])

  const visible = useMemo(() => {
    let list = tab === 'All' ? videos : videos.filter(v => v.status === tab)
    if (q.trim()) {
      const s = q.toLowerCase()
      list = list.filter(v => v.title.toLowerCase().includes(s) || v.channelTitle?.toLowerCase().includes(s))
    }
    return list
  }, [videos, tab, q])

  async function del(id: number) {
    if (!confirm('Move to trash?')) return
    await api.softDelete(id); load()
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title-lg">Library</h1>
          <p className="page-sub">All imported videos. Review, publish, edit, or delete.</p>
        </div>
        <Link to="/" className="btn btn-brand">
          <i className="bi bi-plus-lg me-1" /> Import more
        </Link>
      </div>

      <div className="d-flex gap-2 flex-wrap mb-3 align-items-center">
        {TABS.map(t => (
          <button key={t} className={`chip-tab ${tab === t ? '-active' : ''}`} onClick={() => setTab(t)}>
            {t} <span className="count">{counts[t] ?? 0}</span>
          </button>
        ))}
        <div className="ms-auto position-relative" style={{ minWidth: 220 }}>
          <i className="bi bi-search position-absolute" style={{ left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="form-control"
            style={{ paddingLeft: 34 }}
            placeholder="Search…"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="row g-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="col-md-6 col-xl-4" key={i}>
              <div className="card-video">
                <div className="skeleton" style={{ aspectRatio: '16/9' }} />
                <div className="body">
                  <div className="skeleton mb-2" style={{ height: 14, width: '90%' }} />
                  <div className="skeleton" style={{ height: 12, width: '60%' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon="bi-collection-play"
          title="No videos here"
          hint={tab === 'All' ? 'Import a video from YouTube to get started.' : `No ${tab.toLowerCase()} videos.`}
          action={<Link to="/" className="btn btn-brand btn-sm"><i className="bi bi-search me-1" /> Search YouTube</Link>}
        />
      ) : (
        <div className="row g-3">
          {visible.map(v => (
            <div className="col-md-6 col-xl-4" key={v.id}>
              <div className="card-video">
                {v.thumbnailUrl && (
                  <div className="thumb-wrap">
                    <img className="thumb" src={v.thumbnailUrl} alt={v.title} loading="lazy" />
                    <span className="duration-chip">{fmtDuration(v.durationSeconds)}</span>
                  </div>
                )}
                <div className="body">
                  <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
                    <StatusBadge status={v.status} />
                    <span className="small text-muted">
                      <i className={`bi ${v.audience === 'kids' ? 'bi-emoji-smile' : 'bi-people'} me-1`} />
                      {v.audience}
                    </span>
                  </div>
                  <div className="title">{v.title}</div>
                  <div className="meta">
                    <span><i className="bi bi-person-video3 me-1" />{v.channelTitle}</span>
                    {v.category && <span><i className="bi bi-tag me-1" />{v.category.name}</span>}
                  </div>
                  <div className="actions">
                    <Link to={`/review/${v.id}`} className="btn btn-sm btn-ghost" title="Review">
                      <i className="bi bi-check2-square" />
                    </Link>
                    <Link to={`/publish/${v.id}`} className="btn btn-sm btn-ghost" title="Publish">
                      <i className="bi bi-broadcast" />
                    </Link>
                    <Link to={`/edit/${v.id}`} className="btn btn-sm btn-ghost" title="Edit">
                      <i className="bi bi-pencil" />
                    </Link>
                    <button className="btn btn-sm btn-ghost ms-auto" onClick={() => del(v.id)} title="Delete"
                            style={{ color: 'var(--status-rejected-fg)' }}>
                      <i className="bi bi-trash" />
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
