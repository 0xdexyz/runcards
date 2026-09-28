import { NavLink } from 'react-router-dom';

const ITEMS = [
  { to: '/marketplace', label: 'Market', icon: '◔' },
  { to: '/launchpad', label: 'Launch', icon: '▲' },
  { to: '/campaigns', label: 'Camp.', icon: '◈' },
  { to: '/rewards', label: 'Rewards', icon: '✦' },
  { to: '/profile', label: 'Profile', icon: '●' },
];

export default function MobileBottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Primary mobile">
      {ITEMS.map((item) => (
        <NavLink key={item.to} to={item.to} className={({ isActive }) => `bottom-nav__item${isActive ? ' is-active' : ''}`}>
          <span aria-hidden="true">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
