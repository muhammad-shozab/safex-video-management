export default function StatusBadge({ status }: { status: string }) {
  return <span className={`badge-status badge-status-${status}`}>{status}</span>
}
