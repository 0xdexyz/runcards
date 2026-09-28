import { Link } from 'react-router-dom';

export default function Breadcrumb({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" style={{ fontSize: 11, color: 'var(--ink-muted)', marginBottom: '1.2rem' }}>
      {items.map((item, i) => (
        <span key={i}>
          {item.to ? <Link to={item.to} style={{ color: 'inherit' }}>{item.label}</Link> : item.label}
          {i < items.length - 1 ? ' / ' : ''}
        </span>
      ))}
    </nav>
  );
}
