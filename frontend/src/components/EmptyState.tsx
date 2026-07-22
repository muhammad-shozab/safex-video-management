import type { ReactNode } from 'react'

export default function EmptyState({
  icon = 'bi-inboxes', title, hint, action,
}: { icon?: string; title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="empty">
      <i className={`bi ${icon}`} />
      <h5>{title}</h5>
      {hint && <div className="small">{hint}</div>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}
