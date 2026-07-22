/**
 * Placeholder page for modules owned by other Group 22 teammates.
 * When their code is ready, replace this route in App.tsx with their component.
 */
export default function ModulePlaceholder({
  title, owner, icon, bullets,
}: { title: string; owner: string; icon: string; bullets: string[] }) {
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title-lg">{title}</h1>
          <p className="page-sub">{owner}</p>
        </div>
      </div>

      <div className="panel panel-pad">
        <div className="d-flex align-items-center gap-3 mb-3">
          <div className="stat-icon"><i className={`bi ${icon}`} /></div>
          <div>
            <div className="fw-semibold">Integration slot ready</div>
            <div className="small text-muted">
              This route is reserved so navigation and role-gating already work.
              Drop the teammate's component into <code>src/App.tsx</code> when ready.
            </div>
          </div>
        </div>

        <ul className="mb-0">
          {bullets.map(b => <li key={b} className="mb-1">{b}</li>)}
        </ul>
      </div>
    </>
  )
}
