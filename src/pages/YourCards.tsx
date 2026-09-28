import { useDemo, useDemoDispatch } from '../demo/store';
import { yourCards, formatNum, formatUsd, creatorEstimate } from '../demo/selectors';
import CardVisual from '../components/demo/CardVisual';
import StatusPill from '../components/demo/StatusPill';
import RouteRollLink from '../components/demo/RouteRollLink';
import { RollButton } from '../components/shared';

export default function YourCards() {
  const state = useDemo();
  const dispatch = useDemoDispatch();
  const cards = yourCards(state);

  const togglePause = (cardId: string, current: string) => {
    dispatch({ type: 'SET_CARD_RUN_STATE', cardId, runState: current === 'running' ? 'paused' : 'running' });
  };

  return (
    <div className="app-page">
      <div className="app-header">
        <div>
          <h1 className="app-title">Cards I Run</h1>
          <p className="app-sub">Cards you've created and run through the Launchpad.</p>
        </div>
        <RouteRollLink text="Create Your Card" to="/launchpad/create" />
      </div>

      {cards.length === 0 ? (
        <div className="empty-state">
          You haven't run a card yet.
          <br />
          <br />
          <RouteRollLink text="RUN Your Card" to="/launchpad/create" />
        </div>
      ) : (
        <div className="card-grid">
          {cards.map((card) => {
            const est = creatorEstimate(card);
            return (
              <article className="card-tile" key={card.id}>
                <CardVisual theme={card.theme} accentColor={card.accentColor} symbol={card.symbol} name={card.name} official={card.isOfficial} id={card.id} createdAt={card.createdAt} />
                <div>
                  <p className="card-tile__name">{card.name}</p>
                  <StatusPill status={card.runState} />
                </div>
                <div className="card-tile__stats">
                  <span>Holders <b>{formatNum(card.activeUsers)}</b></span>
                  <span>Volume <b>{formatUsd(card.transactionVolume)}</b></span>
                  <span>Campaigns <b>{card.campaignIds.length}</b></span>
                </div>
                <p className="app-sub">Creator earnings (unclaimed): {formatUsd(est.unclaimed)}</p>
                <div className="card-tile__actions">
                  {card.runState === 'draft' ? (
                    <RouteRollLink text="Continue" to={`/launchpad/create?draft=${card.id}`} />
                  ) : (
                    <>
                      <RouteRollLink text="Manage" to={`/card/${card.id}`} />
                      <RouteRollLink text="Analytics" to={`/analytics?tab=card&card=${card.id}`} />
                      <RollButton text={card.runState === 'running' ? 'Pause' : 'Resume'} onClick={() => togglePause(card.id, card.runState)} />
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
