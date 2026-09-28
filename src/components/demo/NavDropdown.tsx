import { useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useClickOutside } from '../../lib/useClickOutside';

export interface NavDropdownItem {
  label: string;
  to: string;
}

export default function NavDropdown({ label, to, items }: { label: string; to: string; items: NavDropdownItem[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const location = useLocation();
  useClickOutside(ref, () => setOpen(false));

  const active = location.pathname === to || location.pathname.startsWith(`${to}/`);

  return (
    <div className="nav-drop" ref={ref}>
      <Link to={to} className={active ? 'is-nav-active' : undefined} onClick={() => setOpen(false)}>
        {label}
      </Link>
      <button type="button" className="nav-drop__caret" aria-label={`${label} menu`} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        ▾
      </button>
      {open && (
        <div className="util-panel nav-drop__panel">
          {items.map((item) => (
            <Link key={item.to} to={item.to} onClick={() => setOpen(false)} className="util-panel__row" style={{ display: 'block' }}>
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
