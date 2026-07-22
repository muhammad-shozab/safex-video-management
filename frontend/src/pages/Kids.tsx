import { useMemo, useState } from 'react'
import { kidsStore, categoryStore } from '../lib/store'
import { fmtDuration } from '../lib/api'

export default function Kids() {
  const videos = kidsStore.list()
  const cats = categoryStore.list().filter(c => c.audience === 'kids' || c.audience === 'both')
  const [catId, setCatId] = useState<string>('all')
  const [age, setAge] = useState<number>(0)
  const [playing, setPlaying] = useState<string | null>(null)

  const filtered = useMemo(() => videos
    .filter(v => catId === 'all' || v.categoryId === catId)
    .filter(v => age === 0 || (age >= v.ageMin && age <= v.ageMax)), [videos, catId, age])

  return (
    <div className="kids-panel">
      <div className="page-header">
        <div>
          <h1 className="page-title-lg">Kids Panel</h1>
          <p className="page-sub">Age-appropriate content — server-side filtered to audience: kids.</p>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <label className="small text-muted">Age</label>
          <select className="form-select form-select-sm" style={{ width: 100 }} value={age} onChange={e => setAge(+e.target.value)}>
            <option value={0}>All</option>
            {[2,3,4,5,6,7,8,9,10].map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      <div className="panel panel-pad mb-3">
        <div className="d-flex gap-2 flex-wrap">
          <button className={`chip-tab -big ${catId === 'all' ? '-active' : ''}`} onClick={() => setCatId('all')}>
            <i className="bi bi-grid-3x3-gap me-1" /> All
          </button>
          {cats.map(c => (
            <button key={c.id} className={`chip-tab -big ${catId === c.id ? '-active' : ''}`} onClick={() => setCatId(c.id)} style={{ borderColor: catId === c.id ? c.color : undefined }}>
              <i className={`bi ${c.icon} me-1`} style={{ color: c.color }} /> {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="row g-3">
        {filtered.map(v => (
          <div key={v.id} className="col-6 col-md-4 col-lg-3">
            <div className="kids-card" onClick={() => setPlaying(v.youTubeId)}>
              <div className="kids-thumb">
                <img src={v.thumbnailUrl} alt={v.title} />
                <div className="kids-play"><i className="bi bi-play-fill" /></div>
                <div className="kids-dur">{fmtDuration(v.durationSeconds)}</div>
              </div>
              <div className="kids-body">
                <div className="kids-title">{v.title}</div>
                <div className="small text-muted d-flex justify-content-between">
                  <span>{v.channel}</span>
                  <span>Ages {v.ageMin}–{v.ageMax}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-12"><div className="panel panel-pad text-center text-muted py-5">No videos match this filter.</div></div>
        )}
      </div>

      {playing && (
        <div className="modal-backdrop-x" onClick={() => setPlaying(null)}>
          <div className="panel" style={{ width: 'min(900px, 94vw)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div className="ratio ratio-16x9">
              <iframe src={`https://www.youtube.com/embed/${playing}?autoplay=1`} title="Video" allow="autoplay; encrypted-media" allowFullScreen />
            </div>
            <div className="d-flex justify-content-end p-2">
              <button className="btn btn-outline-secondary btn-sm" onClick={() => setPlaying(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
