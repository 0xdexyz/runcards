import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

const TABS = [
  { to: '/campaigns', label: 'Discover Campaigns', end: true },
  { to: '/campaigns/mine', label: 'My Campaigns' },
  { to: '/campaigns/create', label: 'Create Campaign' },
];

export default function CampaignsShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="app-page">
      <div className="app-header">
        <div>
          <h1 className="app-title">{title}</h1>
          <p className="app-sub">{subtitle}</p>
        </div>
      </div>
      <div className="filter-row" style={{ marginBottom: '2rem' }}>
        {TABS.map((tab) => (
          <NavLink key={tab.to} to={tab.to} end={tab.end} className={({ isActive }) => `roll-btn${isActive ? ' is-active' : ''}`} style={{ textDecoration: 'none' }}>
            <span className="roll-btn__text" data-text={tab.label}>
              <span>{tab.label}</span>
            </span>
          </NavLink>
        ))}
      </div>
      {children}
    </div>
  );
}
