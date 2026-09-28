import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDemo } from '../demo/store';
import { yourCards, creatorEstimate, formatNum, formatUsd } from '../demo/selectors';
import MiniLine from '../components/demo/MiniLine';
import { RollButton } from '../components/shared';

type Tab = 'overview' | 'card' | 'campaign' | 'creator';

/** Deterministic, cosmetic trend leading up to the current value — there's no historical log in the demo state. */
function trend(current: number) {
  return Array.from({ length: 8 }, (_, i) => Math.max(1, Math.round(current * (0.35 + (i / 7) * 0.65))));
}

export default function Analytics() {
  const state = useDemo();
  const [params, setParams] = useSearchParams();
  const tab = (params.get('tab') as Tab) || 'overview';
  const cards = yourCards(state);
  const cardId = params.get('card') || cards[0]?.id || '';
  const selectedCard = state.cards.find((c) => c.id === cardId);
  const campaignId = params.get('campaign') || state.campaigns[0]?.id || '';
  const selectedCampaign = state.campaigns.find((c) => c.id === campaignId);

  const setTab = (t: Tab) => setParams((p) => { p.set('tab', t); return p; });

  const creatorTotals = useMemo(
    () =>
      cards.reduce(
        (acc, c) => {
          acc.holders += c.activeUsers;
          acc.volume += c.transactionVolume;
          acc.rewards += creatorEstimate(c).estimated;
          acc.participants += 0;
          return acc;
        },
        { holders: 0, volume: 0, rewards: 0, participants: 0 },
      ),
    [cards],
  );

  return (
    <div className="app-page">
      <div className="app-header">
        <div>
          <h1 className="app-title">Analytics</h1>
          <p className="app-sub">Card, campaign and creator performance across RUN.</p>
        </div>
      </div>

      <div className="filter-row" style={{ marginBottom: '2rem' }}>
        {(['overview', 'card', 'campaign', 'creator'] as Tab[]).map((t) => (
          <RollButton key={t} text={t[0].toUpperCase() + t.slice(1)} active={tab === t} onClick={() => setTab(t)} />
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <div className="panel-grid" style={{ marginBottom: '2rem' }}>
            <div className="stat-tile"><p className="stat-tile__label">Cards You Run</p><p className="stat-tile__value">{cards.length}</p></div>
            <div className="stat-tile"><p className="stat-tile__label">Cardholders</p><p className="stat-tile__value">{formatNum(creatorTotals.holders)}</p></div>
            <div className="stat-tile"><p className="stat-tile__label">Total Volume</p><p className="stat-tile__value">{formatUsd(creatorTotals.volume)}</p></div>
            <div className="stat-tile"><p className="stat-tile__label">Creator Rewards</p><p className="stat-tile__value is-orange">{formatUsd(creatorTotals.rewards)}</p></div>
          </div>
          <p className="section-label">Growth</p>
          <div className="panel"><MiniLine values={trend(creatorTotals.volume || 1000)} /></div>
        </>
      )}

      {tab === 'card' && (
        <>
          <div className="field" style={{ maxWidth: 320, marginBottom: '1.5rem' }}>
            <label>Card</label>
            <select value={cardId} onChange={(e) => setParams((p) => { p.set('card', e.target.value); p.set('tab', 'card'); return p; })}>
              {state.cards.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          {selectedCard && (
            <>
              <div className="panel-grid" style={{ marginBottom: '2rem' }}>
                <div className="stat-tile"><p className="stat-tile__label">Card Views</p><p className="stat-tile__value">{formatNum(selectedCard.cardViews)}</p></div>
                <div className="stat-tile"><p className="stat-tile__label">Cardholders</p><p className="stat-tile__value">{formatNum(selectedCard.activeUsers)}</p></div>
                <div className="stat-tile"><p className="stat-tile__label">Activations</p><p className="stat-tile__value">{formatNum(selectedCard.activations)}</p></div>
                <div className="stat-tile"><p className="stat-tile__label">Transaction Volume</p><p className="stat-tile__value">{formatUsd(selectedCard.transactionVolume)}</p></div>
              </div>
              <p className="section-label">Growth</p>
              <div className="panel"><MiniLine values={trend(selectedCard.activeUsers || 10)} /></div>
            </>
          )}
        </>
      )}

      {tab === 'campaign' && (
        <>
          <div className="field" style={{ maxWidth: 320, marginBottom: '1.5rem' }}>
            <label>Campaign</label>
            <select value={campaignId} onChange={(e) => setParams((p) => { p.set('campaign', e.target.value); p.set('tab', 'campaign'); return p; })}>
              {state.campaigns.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          {selectedCampaign && (
            <div className="panel-grid">
              <div className="stat-tile"><p className="stat-tile__label">Participants</p><p className="stat-tile__value">{formatNum(selectedCampaign.participants)}</p></div>
              <div className="stat-tile"><p className="stat-tile__label">Verified Actions</p><p className="stat-tile__value">{selectedCampaign.tasks.filter((t) => t.status === 'verified').length}</p></div>
              <div className="stat-tile"><p className="stat-tile__label">Completion Rate</p><p className="stat-tile__value">{Math.round(selectedCampaign.progress * 100)}%</p></div>
              <div className="stat-tile"><p className="stat-tile__label">Rewards Distributed</p><p className="stat-tile__value is-orange">{formatUsd(selectedCampaign.tasks.filter((t) => t.status === 'verified').reduce((s, t) => s + t.reward, 0))}</p></div>
              <div className="stat-tile"><p className="stat-tile__label">X Activity</p><p className="stat-tile__value">{selectedCampaign.tasks.filter((t) => t.type === 'x-post' && t.status === 'verified').length}</p></div>
              <div className="stat-tile"><p className="stat-tile__label">Referral Activity</p><p className="stat-tile__value">{selectedCampaign.tasks.filter((t) => t.type === 'referral' && t.status === 'verified').length}</p></div>
            </div>
          )}
        </>
      )}

      {tab === 'creator' && (
        <div className="panel-grid">
          <div className="stat-tile"><p className="stat-tile__label">Total Cards</p><p className="stat-tile__value">{cards.length}</p></div>
          <div className="stat-tile"><p className="stat-tile__label">Active Cards</p><p className="stat-tile__value">{cards.filter((c) => c.runState === 'running').length}</p></div>
          <div className="stat-tile"><p className="stat-tile__label">Cardholders</p><p className="stat-tile__value">{formatNum(creatorTotals.holders)}</p></div>
          <div className="stat-tile"><p className="stat-tile__label">Total Volume</p><p className="stat-tile__value">{formatUsd(creatorTotals.volume)}</p></div>
          <div className="stat-tile"><p className="stat-tile__label">Creator Rewards</p><p className="stat-tile__value is-orange">{formatUsd(creatorTotals.rewards)}</p></div>
          <div className="stat-tile"><p className="stat-tile__label">Community Growth</p><p className="stat-tile__value">{formatNum(cards.reduce((s, c) => s + c.communitySize, 0))}</p></div>
        </div>
      )}
    </div>
  );
}
