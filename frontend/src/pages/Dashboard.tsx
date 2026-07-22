import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, type Video } from '../lib/api'
import StatusBadge from '../components/StatusBadge'

/**
 * Admin Dashboard - pulls live counts from /api/videos.
 * Chart is a lightweight inline SVG (no chart lib to keep bundle tiny;
 * teammate can swap in Recharts/Chart.js if they prefer).
 */
export default function Dashboard() {
  const [videos, setVideos] = useState<Video[]>([])
  const [trash, setTrash] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const [a, b] = await Promise.all([api.list(), api.list(undefined, true)])
      setVideos(a); setTrash(b); setLoading(false)
    })().catch(() => setLoading(false))
  }, [])

  const stats = useMemo(() => {
    const by = (s: string) => videos.filter(v => v.status === s).length
    return {
      total: videos.length,
      published: by('Published'),
      pending: by('Pending'),
      approved: by('Approved'),
      rejected: by('Rejected'),
      kids: videos.filter(v => v.audience === 'kids').length,
      general: videos.filter(v => v.audience === 'general').length,
      trashed: trash.length,
    }
  }, [videos, trash])

  // videos published per weekday (last 7 days) - for the mini bar chart
  const weekly = useMemo(() => {
    const days: { label: string; count: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      const count = videos.filter(v => v.status === 'Published' && v.updatedAt?.startsWith(key)).length
      days.push({ label: d.toLocaleDateString(undefined, { weekday: 'short' }), count })
    }
    return days
  }, [videos])
  const maxCount = Math.max(1, ...weekly.map(d => d.count))

  const recent = [...videos].sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')).slice(0, 6)

  const cards = [
    { label: 'Kids',            value: stats.kids,      icon: 'bi-emoji-smile',   to: '/library' },
    { label: 'General',         value: stats.general,   icon: 'bi-people',        to: '/library' },
    { label: 'Pending Review',  value: stats.pending,   icon: 'bi-hourglass-split', to: '/library' },
    { label: 'Published',       value: stats.published, icon: 'bi-broadcast',     to: '/library' },
    { label: 'In Trash',        value: stats.trashed,   icon: 'bi-trash',         to: '/trash' },
  ]

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title-lg">Dashboard</h1>
          <p className="page-sub">Real-time overview of the SafeX platform.</p>
        </div>
        <Link to="/" className="btn btn-brand">
          <i className="bi bi-plus-lg me-1" /> Import from YouTube
        </Link>
      </div>

      <div className="stat-grid">
        {cards.map(c => (
          <Link to={c.to} key={c.label} className="stat-card text-decoration-none">
            <div className="stat-head">
              <div className="stat-label">{c.label}</div>
              <div className="stat-icon"><i className={`bi ${c.icon}`} /></div>
            </div>
            <div className="stat-value">{loading ? '-' : c.value}</div>
          </Link>
        ))}
      </div>

      <div className="row g-3">
        <div className="col-lg-7">
          <div className="panel panel-pad h-100 chart-panel">
            <div className="chart-head">
              <div>
                <div className="chart-kicker">Weekly output</div>
                <h5 className="chart-title">Published <span className="chart-title-dim">- last 7 days</span></h5>
              </div>
              <div className="chart-legend">
                <div className="chart-total">{weekly.reduce((a, d) => a + d.count, 0)}</div>
                <div className="chart-total-lbl">Videos<br/>published</div>
              </div>
            </div>

            <div className="chart-body">
              <div className="chart-yaxis">
                {[maxCount, Math.round(maxCount * 0.66), Math.round(maxCount * 0.33), 0].map((n, i) => (
                  <div key={i} className="chart-tick"><span>{n}</span></div>
                ))}
              </div>
              <div className="chart-plot">
                <div className="chart-grid" aria-hidden>
                  <span /><span /><span /><span />
                </div>
                <div className="chart-bars">
                  {weekly.map((d, i) => (
                    <div key={i} className="chart-col">
                      <div className="chart-bar-wrap">
                        <div className="chart-bar-value">{d.count}</div>
                        <div
                          className="chart-bar"
                          style={{ height: `${Math.max(2, (d.count / maxCount) * 100)}%` }}
                          title={`${d.count} published`}
                        />
                      </div>
                      <div className="chart-xlabel">{d.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="panel panel-pad h-100">
            <h5 className="fw-semibold mb-3"><i className="bi bi-clock-history me-2" />Recent Activity</h5>
            {recent.length === 0 ? (
              <div className="text-muted small">No activity yet. Import a video to get started.</div>
            ) : (
              <ul className="list-unstyled mb-0">
                {recent.map(v => (
                  <li key={v.id} className="d-flex gap-2 align-items-center py-2 border-bottom" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex-fill text-truncate">
                      <div className="small fw-semibold text-truncate">{v.title}</div>
                      <div className="small text-muted">{v.channelTitle}</div>
                    </div>
                    <StatusBadge status={v.status} />
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
