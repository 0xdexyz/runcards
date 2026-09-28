import { useMemo } from 'react';
import { useDemo, useDemoDispatch } from '../demo/store';
import { yourCards, creatorEstimate, formatNum, formatUsd } from '../demo/selectors';
import CardVisual from '../components/demo/CardVisual';
import StatusPill from '../components/demo/StatusPill';
import RouteRollLink from '../components/demo/RouteRollLink';
import { RollButton } from '../components/shared';

export default function Launchpad() {
  const state = useDemo();
  const dispatch = useDemoDispatch();
  const cards = yourCards(state);

  const totals = useMemo(() => {
    const holders = cards.reduce((s, c) => s + c.activeUsers, 0);
    const volume = cards.reduce((s, c) => s + c.transactionVolume, 0);
    const estimate = cards.reduce((s, c) => s + creatorEstimate(c).unclaimed, 0);
    return { holders, volume, estimate };
  }, [cards]);

  const running = cards.filter((c) => c.runState === 'running');
  const drafts = cards.filter((c) => c.runState === 'draft');
  const paused = cards.filter((c) => c.runState === 'paused');

  const togglePause = (cardId: string, current: string) => {
    dispatch({ type: 'SET_CARD_RUN_STATE', cardId, runState: current === 'running' ? 'paused' : 'running' });
  };

  return (
    <div className="app-page">
      <div className="app-header">
        <div>
          <h1 className="app-title">RUN Your Card</h1>
          <p className="app-sub">Create your own card, define its rewards, build campaigns, and grow your community.</p>
        </div>
        <RouteRollLink text="Create Your Card" to="/launchpad/create" className="is-active" />
      </div>

      <div className="panel-grid" style={{ marginBottom: '2.5rem' }}>
        <div className="stat-tile">
          <p className="stat-tile__label">Cards You Run</p>
          <p className="stat-tile__value">{cards.length}</p>
        </div>
        <div className="stat-tile">
          <p className="stat-tile__label">Cardholders</p>
          <p className="stat-tile__value">{formatNum(totals.holders)}</p>
        </div>
        <div className="stat-tile">
          <p className="stat-tile__label">Total Volume</p>
          <p className="stat-tile__value">{formatUsd(totals.volume)}</p>
        </div>
        <div className="stat-tile">
          <p className="stat-tile__label">Unclaimed Creator Rewards</p>
          <p className="stat-tile__value is-orange">{formatUsd(totals.estimate)}</p>
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="empty-state">
          You haven't run a card yet.
          <br />
          <br />
          <RouteRollLink text="Create Your Card" to="/launchpad/create" />
        </div>
      ) : (
        <>
          {running.length > 0 && (
            <>
              <p className="section-label">Running</p>
              {running.map((c) => (
                <LaunchpadRow key={c.id} cardId={c.id} onPause={() => togglePause(c.id, c.runState)} />
              ))}
            </>
          )}
          {drafts.length > 0 && (
            <>
              <p className="section-label">Drafts</p>
              {drafts.map((c) => (
                <DraftRow key={c.id} cardId={c.id} />
              ))}
            </>
          )}
          {paused.length > 0 && (
            <>
              <p className="section-label">Paused</p>
              {paused.map((c) => (
                <LaunchpadRow key={c.id} cardId={c.id} onPause={() => togglePause(c.id, c.runState)} />
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
}

function LaunchpadRow({ cardId, onPause }: { cardId: string; onPause: () => void }) {
  const state = useDemo();
  const card = state.cards.find((c) => c.id === cardId);
  if (!card) return null;
  return (
    <div className="panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
      <CardVisual theme={card.theme} accentColor={card.accentColor} symbol={card.symbol} name={card.name} id={card.id} createdAt={card.createdAt} style={{ width: 90, height: 56 }} />
      <div style={{ flex: 1, minWidth: 160 }}>
        <p style={{ fontWeight: 700 }}>{card.name}</p>
        <StatusPill status={card.runState} />
      </div>
      <span className="app-sub">{formatNum(card.activeUsers)} holders</span>
      <RouteRollLink text="Manage" to={`/card/${card.id}`} />
      <RouteRollLink text="Analytics" to={`/analytics?tab=card&card=${card.id}`} />
      <RouteRollLink text="Campaigns" to={`/campaigns?card=${card.id}`} />
      <RollButton text={card.runState === 'running' ? 'Pause' : 'Resume'} onClick={onPause} />
    </div>
  );
}

function DraftRow({ cardId }: { cardId: string }) {
  const state = useDemo();
  const card = state.cards.find((c) => c.id === cardId);
  if (!card) return null;
  return (
    <div className="panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
      <CardVisual theme={card.theme} accentColor={card.accentColor} symbol={card.symbol || '—'} name={card.name || 'Untitled'} id={card.id} createdAt={card.createdAt} style={{ width: 90, height: 56 }} />
      <div style={{ flex: 1, minWidth: 160 }}>
        <p style={{ fontWeight: 700 }}>{card.name || 'Untitled Card'}</p>
        <StatusPill status="draft" />
      </div>
      <RouteRollLink text="Continue" to={`/launchpad/create?draft=${card.id}`} />
    </div>
  );
}
