import { useDemo } from '../demo/store';
import { joinedCampaigns, formatNum } from '../demo/selectors';
import CampaignsShell from '../components/demo/CampaignsShell';
import RouteRollLink from '../components/demo/RouteRollLink';

export default function CampaignsMine() {
  const state = useDemo();
  const campaigns = joinedCampaigns(state);

  return (
    <CampaignsShell title="My Campaigns" subtitle="Campaigns you've joined, in progress or completed.">
      {campaigns.length === 0 ? (
        <div className="empty-state">
          You haven't joined a campaign yet.
          <br />
          <br />
          <RouteRollLink text="Discover Campaigns" to="/campaigns" />
        </div>
      ) : (
        <div className="panel">
          {campaigns.map((c) => {
            const remaining = c.tasks.filter((t) => t.status !== 'verified').length;
            const card = state.cards.find((k) => k.id === c.cardId);
            return (
              <div className="data-row" key={c.id} style={{ gridTemplateColumns: '2fr 1fr 1fr auto' }}>
                <div>
                  <p style={{ fontWeight: 700 }}>{c.title}</p>
                  <p className="app-sub">{card?.name}</p>
                </div>
                <div className="progress" style={{ alignSelf: 'center' }}>
                  <span className="progress__fill" style={{ width: `${Math.round(c.progress * 100)}%` }} />
                </div>
                <span>{remaining === 0 ? 'Completed' : `${formatNum(remaining)} tasks left`}</span>
                <RouteRollLink text="View" to={`/campaign/${c.id}`} />
              </div>
            );
          })}
        </div>
      )}
    </CampaignsShell>
  );
}
