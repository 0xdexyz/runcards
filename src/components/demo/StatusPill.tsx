export default function StatusPill({ status }: { status: string }) {
  const isLive = status === 'running' || status === 'active' || status === 'verified' || status === 'completed';
  return (
    <span className="status-line" style={{ fontSize: 11, textTransform: 'uppercase' }}>
      <span className={`status-dot${isLive ? ' is-live' : ''}`} aria-hidden="true" />
      {status}
    </span>
  );
}
