import { useMemo } from 'react';
import { useDemo, useDemoDispatch } from '../demo/store';
import { yourCards, creatorEstimate, formatUsd } from '../demo/selectors';
import Breadcrumb from '../components/demo/Breadcrumb';
import CardVisual from '../components/demo/CardVisual';
import { RollButton } from '../components/shared';

export default function CreatorRewards() {
  const state = useDemo();
  const dispatch = useDemoDispatch();
  const cards = yourCards(state);

  const totals = useMemo(() => {
    return cards.reduce(
      (acc, c) => {
        const e = creatorEstimate(c);
        acc.volume += e.eligibleVolume;
        acc.estimated += e.estimated;
        acc.unclaimed += e.unclaimed;
        return acc;
      },
      { volume: 0, estimated: 0, unclaimed: 0 },
    );
  }, [cards]);

  return (
    <div className="app-page">
      <Breadcrumb items={[{ label: 'Rewards', to: '/rewards' }, { label: 'Creator Rewards' }]} />
      <div className="app-header">
        <div>
          <h1 className="app-title">Creator Rewards</h1>
          <p className="app-sub">Economics associated with the cards you run — configurable, not a guaranteed return.</p>
        </div>
      </div>

      <div className="panel-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-tile">
          <p className="stat-tile__label">Eligible Volume</p>
          <p className="stat-tile__value">{formatUsd(totals.volume)}</p>
        </div>
        <div className="stat-tile">
          <p className="stat-tile__label">Estimated Creator Rewards</p>
          <p className="stat-tile__value is-orange">{formatUsd(totals.estimated)}</p>
        </div>
        <div className="stat-tile">
          <p className="stat-tile__label">Unclaimed</p>
          <p className="stat-tile__value">{formatUsd(totals.unclaimed)}</p>
          <RollButton text="Claim Creator Rewards" onClick={() => dispatch({ type: 'CLAIM_CREATOR_REWARDS' })} />
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="empty-state">Run a card to start earning creator rewards.</div>
      ) : (
        cards.map((c) => {
          const e = creatorEstimate(c);
          return (
            <div className="panel" key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <CardVisual theme={c.theme} accentColor={c.accentColor} symbol={c.symbol} name={c.name} id={c.id} createdAt={c.createdAt} style={{ width: 90, height: 56 }} />
              <div style={{ flex: 1, minWidth: 160 }}>
                <p style={{ fontWeight: 700 }}>{c.name}</p>
                <p className="app-sub">Configured creator share: {c.rewards.creatorShare}%</p>
              </div>
              <span className="app-sub">Volume {formatUsd(e.eligibleVolume)}</span>
              <span className="app-sub">Estimated {formatUsd(e.estimated)}</span>
            </div>
          );
        })
      )}
    </div>
  );
}
