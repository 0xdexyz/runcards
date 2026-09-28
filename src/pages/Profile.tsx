import { useDemo } from '../demo/store';
import { myCards, yourCards, joinedCampaigns, formatUsd } from '../demo/selectors';
import RouteRollLink from '../components/demo/RouteRollLink';

export default function Profile() {
  const state = useDemo();
  const { user } = state;
  const mine = myCards(state);
  const created = yourCards(state);
  const campaigns = joinedCampaigns(state);
  const initial = (user.xHandle ?? user.username).replace('@', '').slice(0, 1).toUpperCase();

  return (
    <div className="app-page">
      <div className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="card-tile__swatch theme-orange" style={{ width: 64, height: 64, borderRadius: '50%', fontSize: '1.4rem' }}>
            {initial}
          </div>
          <div>
            <h1 className="app-title" style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)' }}>{user.xHandle ?? `@${user.username}`}</h1>
            <p className="app-sub">{user.walletConnected ? user.walletAddress : 'Wallet not connected'}</p>
          </div>
        </div>
      </div>

      <div className="panel-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-tile">
          <p className="stat-tile__label">X Account</p>
          <p className="stat-tile__value" style={{ fontSize: '1.1rem' }}>{user.xConnected ? user.xHandle : 'Not connected'}</p>
          {user.xConnected && <p className="app-sub">{user.xFollowers?.toLocaleString()} followers</p>}
        </div>
        <div className="stat-tile">
          <p className="stat-tile__label">Cards I Run</p>
          <p className="stat-tile__value">{created.length}</p>
          <RouteRollLink text="View" to="/your-cards" />
        </div>
        <div className="stat-tile">
          <p className="stat-tile__label">Cards I Use</p>
          <p className="stat-tile__value">{mine.length}</p>
          <RouteRollLink text="View" to="/my-cards" />
        </div>
        <div className="stat-tile">
          <p className="stat-tile__label">Rewards Available</p>
          <p className="stat-tile__value is-orange">{formatUsd(state.rewards.available)}</p>
          <RouteRollLink text="Rewards" to="/rewards" />
        </div>
      </div>

      <p className="section-label">Campaigns</p>
      {campaigns.length === 0 ? (
        <div className="empty-state">No campaigns joined yet.</div>
      ) : (
        <div className="panel">
          {campaigns.map((c) => (
            <div className="data-row" key={c.id}>
              <span>{c.title}</span>
              <span>{Math.round(c.progress * 100)}% complete</span>
              <RouteRollLink text="View" to={`/campaign/${c.id}`} />
            </div>
          ))}
        </div>
      )}

      <p className="section-label">Recent Activity</p>
      {state.notifications.length === 0 ? (
        <div className="empty-state">No activity yet.</div>
      ) : (
        <div className="panel">
          {state.notifications.slice(0, 10).map((n) => (
            <div className="data-row" key={n.id} style={{ gridTemplateColumns: '1fr auto' }}>
              <span>{n.message}</span>
              <span>{new Date(n.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
