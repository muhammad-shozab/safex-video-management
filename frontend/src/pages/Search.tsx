import { useState } from 'react'
import { api, fmtDuration, fmtViews, type YtItem } from '../lib/api'

export default function Search() {
  const [q, setQ] = useState('')
  const [items, setItems] = useState<YtItem[]>([])
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState<string | null>(null)
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')
  const [searched, setSearched] = useState(false)

  async function doSearch(e?: React.FormEvent) {
    e?.preventDefault()
    if (!q.trim()) return
    setLoading(true); setErr(''); setMsg('')
    try { setItems(await api.ytSearch(q)); setSearched(true) }
    catch (e: any) { setErr(e.message) }
    finally { setLoading(false) }
  }

  async function doImport(id: string, title: string) {
    setMsg(''); setErr(''); setImporting(id)
    try {
      await api.import(id)
      setMsg(`Imported "${title}" - moved to Library (Pending review).`)
    } catch (e: any) { setErr(e.message) }
    finally { setImporting(null) }
  }

  const suggestions = ['science experiments for kids', 'introduction to algebra', 'python for beginners', 'world history']

  return (
    <>
      <div className="hero-search">
        <h2>Find educational content on YouTube</h2>
        <p>Search, preview, then import to the SafeX library for review and publishing.</p>
        <form onSubmit={doSearch} className="search-field">
          <input
            placeholder="e.g. kids science experiments"
            value={q}
            onChange={e => setQ(e.target.value)}
            autoFocus
          />
          <button className="btn" disabled={loading}>
            {loading ? <><span className="spinner-border spinner-border-sm me-1" /> Searching…</>
                     : <><i className="bi bi-search me-1" /> Search</>}
          </button>
        </form>
        {!searched && (
          <div className="mt-3 d-flex gap-2 flex-wrap">
            <span className="small text-white-50 me-1">Try:</span>
            {suggestions.map(s => (
              <button
                key={s}
                type="button"
                className="chip-tab"
                style={{ background: 'rgba(255,255,255,.14)', borderColor: 'transparent', color: '#fff' }}
                onClick={() => { setQ(s); setTimeout(() => doSearch(), 0) }}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {err && <div className="alert alert-danger"><i className="bi bi-exclamation-triangle me-2" />{err}</div>}
      {msg && <div className="alert alert-success"><i className="bi bi-check-circle me-2" />{msg}</div>}

      {loading && (
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
      )}

      {!loading && searched && items.length === 0 && (
        <div className="empty">
          <i className="bi bi-search" />
          <h5>No results</h5>
          <div className="small">Try different keywords.</div>
        </div>
      )}

      <div className="row g-3">
        {items.map(v => (
          <div className="col-md-6 col-xl-4" key={v.youTubeId}>
            <div className="card-video">
              <div className="thumb-wrap">
                <img className="thumb" src={v.thumbnailUrl} alt={v.title} loading="lazy" />
                <span className="duration-chip">{fmtDuration(v.durationSeconds)}</span>
              </div>
              <div className="body">
                <div className="title">{v.title}</div>
                <div className="meta">
                  <span><i className="bi bi-person-video3 me-1" />{v.channelTitle}</span>
                  <span><i className="bi bi-eye me-1" />{fmtViews(v.viewCount)}</span>
                </div>
                <div className="actions">
                  <a className="btn btn-sm btn-ghost" target="_blank" rel="noreferrer"
                     href={`https://youtube.com/watch?v=${v.youTubeId}`}>
                    <i className="bi bi-play-circle" /> Preview
                  </a>
                  <button
                    className="btn btn-sm btn-brand ms-auto"
                    onClick={() => doImport(v.youTubeId, v.title)}
                    disabled={importing === v.youTubeId}
                  >
                    {importing === v.youTubeId
                      ? <><span className="spinner-border spinner-border-sm me-1" /> Importing…</>
                      : <><i className="bi bi-download" /> Import</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
