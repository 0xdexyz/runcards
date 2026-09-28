import { useState } from 'react';
import { useDemo, useDemoDispatch } from '../demo/store';
import { myCards, formatUsd } from '../demo/selectors';
import CardVisual from '../components/demo/CardVisual';
import StatusPill from '../components/demo/StatusPill';
import AddFundsModal from '../components/demo/AddFundsModal';
import CardDetailsModal from '../components/demo/CardDetailsModal';
import RouteRollLink from '../components/demo/RouteRollLink';
import { RollButton } from '../components/shared';

export default function MyCards() {
  const state = useDemo();
  const dispatch = useDemoDispatch();
  const cards = myCards(state);
  const [fundCard, setFundCard] = useState<string | null>(null);
  const [detailsCard, setDetailsCard] = useState<string | null>(null);
  const [activityCard, setActivityCard] = useState<string | null>(null);

  const toggleFreeze = (cardId: string, current: string) => {
    dispatch({ type: 'SET_CARD_STATUS', cardId, status: current === 'active' ? 'frozen' : 'active' });
  };

  const fundTarget = cards.find((c) => c.id === fundCard);
  const detailsTarget = cards.find((c) => c.id === detailsCard);

  return (
    <div className="app-page">
      <div className="app-header">
        <div>
          <h1 className="app-title">Cards I Use</h1>
          <p className="app-sub">The RUN Card and creator cards you use for everyday spending.</p>
        </div>
      </div>

      {!state.user.walletConnected && <div className="empty-state" style={{ marginBottom: '1.5rem' }}>Connect your wallet to activate cards.</div>}

      <div className="card-grid">
        {cards.map((card) => (
          <article className="card-tile" key={card.id}>
            <CardVisual theme={card.theme} accentColor={card.accentColor} symbol={card.symbol} name={card.name} official={card.isOfficial} id={card.id} createdAt={card.createdAt} />
            <div>
              <p className="card-tile__name">{card.name}</p>
              <StatusPill status={card.status} />
            </div>
            <p className="app-sub">Reward rate: {card.rewardRate}% · Balance: {formatUsd(card.balanceUsd)}</p>
            <div className="card-tile__actions">
              <RouteRollLink text="View" to={`/card/${card.id}`} />
              <RollButton text="Card Details" onClick={() => setDetailsCard(card.id)} />
              <RollButton text="Add Funds" onClick={() => setFundCard(card.id)} disabled={card.status === 'frozen'} />
              <RollButton text={card.status === 'active' ? 'Freeze' : 'Unfreeze'} onClick={() => toggleFreeze(card.id, card.status)} />
              <RollButton text="Activity" onClick={() => setActivityCard(activityCard === card.id ? null : card.id)} />
            </div>
            {activityCard === card.id && (
              <div className="panel" style={{ marginTop: '0.6rem' }}>
                {state.transactions.filter((t) => t.cardId === card.id).length === 0 ? (
                  <p className="app-sub">No activity yet.</p>
                ) : (
                  state.transactions
                    .filter((t) => t.cardId === card.id)
                    .slice(0, 6)
                    .map((t) => (
                      <div className="data-row" key={t.id}>
                        <span>{t.merchant}</span>
                        <span>{formatUsd(t.amount)}</span>
                        <span>{t.asset}</span>
                        <StatusPill status={t.status} />
                      </div>
                    ))
                )}
              </div>
            )}
          </article>
        ))}
      </div>

      {fundTarget && <AddFundsModal cardId={fundTarget.id} cardName={fundTarget.name} onClose={() => setFundCard(null)} />}
      {detailsTarget && <CardDetailsModal card={detailsTarget} onClose={() => setDetailsCard(null)} />}
    </div>
  );
}
