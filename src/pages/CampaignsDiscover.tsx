import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDemo } from '../demo/store';
import { formatMinutesAgo, formatNum, formatUsd, recentActivity } from '../demo/selectors';
import CampaignsShell from '../components/demo/CampaignsShell';
import RouteRollLink from '../components/demo/RouteRollLink';
import { RollButton } from '../components/shared';

type Filter = 'trending' | 'rewards' | 'ending' | 'new' | 'official' | 'creator';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'trending', label: 'Trending' },
  { id: 'rewards', label: 'Highest Rewards' },
  { id: 'ending', label: 'Ending Soon' },
  { id: 'new', label: 'New' },
  { id: 'official', label: 'RUN Card' },
  { id: 'creator', label: 'Creator Cards' },
];

function daysLeft(endDate: number) {
  return Math.max(0, Math.ceil((endDate - Date.now()) / 86_400_000));
}

export default function CampaignsDiscover() {
  const state = useDemo();
  const [params] = useSearchParams();
  const cardScope = params.get('card');
  const [filter, setFilter] = useState<Filter>('trending');

  const list = useMemo(() => {
    let items = state.campaigns.filter((c) => c.status !== 'ended');
    if (cardScope) items = items.filter((c) => c.cardId === cardScope);
    const withCard = items.map((c) => ({ campaign: c, card: state.cards.find((k) => k.id === c.cardId) }));
    switch (filter) {
      case 'rewards':
        return withCard.sort((a, b) => b.campaign.rewardPool - a.campaign.rewardPool);
      case 'ending':
        return withCard.sort((a, b) => a.campaign.endDate - b.campaign.endDate);
      case 'new':
        return withCard.sort((a, b) => b.campaign.startDate - a.campaign.startDate);
      case 'official':
        return withCard.filter((x) => x.card?.isOfficial);
      case 'creator':
        return withCard.filter((x) => x.card && !x.card.isOfficial);
      case 'trending':
      default:
        return withCard.sort((a, b) => b.campaign.participants - a.campaign.participants);
    }
  }, [state, filter, cardScope]);

  return (
    <CampaignsShell title="Campaigns" subtitle="Promote and grow cards through verified community activity.">
      <div className="filter-row" style={{ marginBottom: '2rem' }}>
        {FILTERS.map((f) => (
          <RollButton key={f.id} text={f.label} active={filter === f.id} onClick={() => setFilter(f.id)} />
        ))}
      </div>

      {list.length === 0 ? (
        <div className="empty-state">No campaigns match this filter.</div>
      ) : (
        <div className="panel">
          {list.map(({ campaign: c, card }) => (
            <div key={c.id} style={{ padding: '0.9rem 0', borderBottom: '1px solid rgb(5 5 5 / 0.12)' }}>
              <div className="data-row" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr auto', border: 'none', padding: 0 }}>
                <div>
                  <p style={{ fontWeight: 700 }}>{c.title}</p>
                  <p className="app-sub">{card?.name} · {c.creatorHandle}</p>
                </div>
                <span>{formatUsd(c.rewardPool)} pool</span>
                <span>{formatNum(c.participants)} joined</span>
                <span>{daysLeft(c.endDate)}d left</span>
                <RouteRollLink text="View Campaign" to={`/campaign/${c.id}`} />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem 1.2rem', marginTop: '0.6rem' }}>
                {recentActivity(c).map((a, i) => (
                  <p key={i} className="app-sub" style={{ fontSize: 11 }}>
                    <span style={{ color: 'var(--ink)' }}>{a.handle}</span> {a.verb} · {formatMinutesAgo(a.minutesAgo)}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </CampaignsShell>
  );
}
