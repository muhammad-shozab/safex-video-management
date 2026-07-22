import { useEffect, useMemo, useState } from 'react'
import { categoryStore, subscribe, type Category } from '../lib/store'

const COLORS = ['#4648d4', '#a02a68', '#2f7d4f', '#c4661a', '#7a4ad9', '#d94a8c', '#4aa3d9', '#8a5a2b']
const ICONS = ['bi-tags', 'bi-cpu', 'bi-atom', 'bi-calculator', 'bi-book', 'bi-translate', 'bi-alphabet', 'bi-music-note-beamed', 'bi-journal-richtext', 'bi-globe2', 'bi-easel', 'bi-brush']

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export default function Categories() {
  const [cats, setCats] = useState<Category[]>(() => categoryStore.list())
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<'all' | 'kids' | 'general' | 'both'>('all')
  const [editing, setEditing] = useState<Category | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => subscribe('categories', () => setCats(categoryStore.list())), [])

  const filtered = useMemo(() => cats
    .filter(c => filter === 'all' || c.audience === filter)
    .filter(c => !q || c.name.toLowerCase().includes(q.toLowerCase())), [cats, q, filter])

  const roots = filtered.filter(c => !c.parentId)
  const children = (id: string) => filtered.filter(c => c.parentId === id)

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title-lg">Category Management</h1>
          <p className="page-sub">Kids and General taxonomies with nested categories.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true) }}>
          <i className="bi bi-plus-lg me-1" /> New category
        </button>
      </div>

      <div className="panel panel-pad mb-3">
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <div className="input-group" style={{ maxWidth: 340 }}>
            <span className="input-group-text"><i className="bi bi-search" /></span>
            <input className="form-control" placeholder="Search categories..." value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <div className="d-flex gap-1">
            {(['all', 'kids', 'general', 'both'] as const).map(f => (
              <button key={f} className={`chip-tab ${filter === f ? '-active' : ''}`} onClick={() => setFilter(f)}>
                {f === 'all' ? 'All' : f[0].toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div className="ms-auto small text-muted">{filtered.length} categories</div>
        </div>
      </div>

      <div className="row g-3">
        {roots.map(cat => {
          const subs = children(cat.id)
          return (
            <div className="col-12 col-md-6 col-xl-4" key={cat.id}>
              <div className="cat-card-v2 h-100">
                <div className="cat-card-v2-head" style={{ background: `linear-gradient(135deg, ${cat.color} 0%, ${cat.color}cc 100%)` }}>
                  <div className="cat-card-v2-icon"><i className={`bi ${cat.icon}`} /></div>
                  <div className="cat-card-v2-title-wrap">
                    <div className="cat-card-v2-title">{cat.name}</div>
                    <div className="cat-card-v2-slug">/{cat.slug}</div>
                  </div>
                  <span className={`aud-pill -${cat.audience}`}>{cat.audience}</span>
                </div>
                <div className="cat-card-v2-body">
                  <div className="cat-card-v2-subs-head">
                    <span><i className="bi bi-diagram-3 me-1" /> Subcategories</span>
                    <span className="cat-card-v2-count">{subs.length}</span>
                  </div>
                  {subs.length > 0 ? (
                    <div className="cat-sub-list">
                      {subs.map(ch => (
                        <div key={ch.id} className="cat-sub-item">
                          <span className="cat-sub-dot" style={{ background: ch.color }}><i className={`bi ${ch.icon}`} /></span>
                          <span className="cat-sub-name">{ch.name}</span>
                          <div className="cat-sub-actions">
                            <button className="icon-btn" onClick={() => { setEditing(ch); setShowForm(true) }} title="Edit"><i className="bi bi-pencil" /></button>
                            <button className="icon-btn" onClick={() => { if (confirm(`Delete "${ch.name}"?`)) categoryStore.remove(ch.id) }} title="Delete"><i className="bi bi-x" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="cat-sub-empty">No subcategories yet.</div>
                  )}
                  <div className="cat-card-v2-actions">
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => { setEditing(null); setShowForm(true); setTimeout(() => {}, 0) }}
                      title="Add subcategory">
                      <i className="bi bi-plus-lg me-1" /> Add sub
                    </button>
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => { setEditing(cat); setShowForm(true) }}>
                      <i className="bi bi-pencil me-1" /> Edit
                    </button>
                    <button className="btn btn-sm btn-outline-danger ms-auto" onClick={() => { if (confirm(`Delete "${cat.name}"?`)) categoryStore.remove(cat.id) }}>
                      <i className="bi bi-trash3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        {roots.length === 0 && (
          <div className="col-12">
            <div className="panel panel-pad text-center text-muted py-5">No categories match your filters.</div>
          </div>
        )}
      </div>

      {showForm && (
        <CategoryForm
          initial={editing}
          parents={cats.filter(c => !c.parentId)}
          onClose={() => { setShowForm(false); setEditing(null) }}
        />
      )}
    </>
  )
}

function CategoryForm({ initial, parents, onClose }: { initial: Category | null; parents: Category[]; onClose: () => void }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [audience, setAudience] = useState<Category['audience']>(initial?.audience ?? 'general')
  const [parentId, setParentId] = useState<string | null>(initial?.parentId ?? null)
  const [color, setColor] = useState(initial?.color ?? COLORS[0])
  const [icon, setIcon] = useState(initial?.icon ?? ICONS[0])

  const save = () => {
    if (!name.trim()) return
    const payload = { name: name.trim(), slug: slugify(name), audience, parentId, color, icon }
    if (initial) categoryStore.update(initial.id, payload)
    else categoryStore.create(payload)
    onClose()
  }

  return (
    <div className="modal-backdrop-x" onClick={onClose}>
      <div className="panel panel-pad" style={{ width: 'min(560px, 94vw)' }} onClick={e => e.stopPropagation()}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">{initial ? 'Edit category' : 'New category'}</h5>
          <button className="icon-btn" onClick={onClose}><i className="bi bi-x-lg" /></button>
        </div>
        <div className="mb-3">
          <label className="form-label small text-muted">Name</label>
          <input className="form-control" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Physics" />
        </div>
        <div className="row g-3">
          <div className="col-6">
            <label className="form-label small text-muted">Audience</label>
            <select className="form-select" value={audience} onChange={e => setAudience(e.target.value as any)}>
              <option value="general">General</option>
              <option value="kids">Kids</option>
              <option value="both">Both</option>
            </select>
          </div>
          <div className="col-6">
            <label className="form-label small text-muted">Parent</label>
            <select className="form-select" value={parentId ?? ''} onChange={e => setParentId(e.target.value || null)}>
              <option value="">— Top level —</option>
              {parents.filter(p => p.id !== initial?.id).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-3">
          <label className="form-label small text-muted">Color</label>
          <div className="d-flex flex-wrap gap-2">
            {COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)} className={`color-sw ${color === c ? '-on' : ''}`} style={{ background: c }} />
            ))}
          </div>
        </div>
        <div className="mt-3">
          <label className="form-label small text-muted">Icon</label>
          <div className="d-flex flex-wrap gap-1">
            {ICONS.map(ic => (
              <button key={ic} onClick={() => setIcon(ic)} className={`icon-sw ${icon === ic ? '-on' : ''}`}><i className={`bi ${ic}`} /></button>
            ))}
          </div>
        </div>
        <div className="d-flex justify-content-end gap-2 mt-4">
          <button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={!name.trim()}>{initial ? 'Save' : 'Create'}</button>
        </div>
      </div>
    </div>
  )
}
