import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDemo } from '../demo/store';
import { getCampaignsForCard, formatNum, formatUsd } from '../demo/selectors';
import Breadcrumb from '../components/demo/Breadcrumb';
import CardVisual from '../components/demo/CardVisual';
import GetCardModal from '../components/demo/GetCardModal';
import ShareXModal from '../components/demo/ShareXModal';
import RouteRollLink from '../components/demo/RouteRollLink';
import { RollButton } from '../components/shared';

export default function CardDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const state = useDemo();
  const [getCard, setGetCard] = useState(false);
  const [share, setShare] = useState(false);
  const [flipped, setFlipped] = useState(false);

  const card = state.cards.find((c) => c.id === id);
  if (!card) {
    return (
      <div className="app-page">
        <p className="empty-state">Card not found.</p>
        <RollButton text="Back to Marketplace" onClick={() => navigate('/marketplace')} />
      </div>
    );
  }

  const campaigns = getCampaignsForCard(state, card.id);
  const activeCampaign = campaigns.find((c) => c.status === 'active');

  return (
    <div className="app-page">
      <Breadcrumb items={[{ label: 'Marketplace', to: '/marketplace' }, { label: card.name }]} />

      <div className="app-header">
        <div>
          <p className="section-label">{card.isOfficial ? 'Official RUN Card' : 'Creator Card'}</p>
          <h1 className="app-title">{card.name}</h1>
          <p className="app-sub">{card.description}</p>
        </div>
        <div>
          {flipped ? (
            <CardVisual theme={card.backTheme} accentColor={card.backAccentColor} symbol={card.symbol} name={card.name} id={card.id} createdAt={card.createdAt} style={{ width: 220, height: 138 }} />
          ) : (
            <CardVisual theme={card.theme} accentColor={card.accentColor} symbol={card.symbol} name={card.name} official={card.isOfficial} id={card.id} createdAt={card.createdAt} style={{ width: 220, height: 138 }} />
          )}
          <RollButton text="Flip Card" onClick={() => setFlipped((f) => !f)} style={{ marginTop: '0.6rem' }} />
        </div>
      </div>

      <div className="panel-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-tile">
          <p className="stat-tile__label">Creator</p>
          <p className="stat-tile__value" style={{ fontSize: '1.1rem' }}>{card.creator}</p>
          <p className="app-sub">{card.creatorHandle}</p>
        </div>
        <div className="stat-tile">
          <p className="stat-tile__label">Reward Structure</p>
          <p className="stat-tile__value is-orange">{card.rewardRate}%</p>
          <p className="app-sub">User reward on eligible spend</p>
        </div>
        <div className="stat-tile">
          <p className="stat-tile__label">Active Cardholders</p>
          <p className="stat-tile__value">{formatNum(card.activeUsers)}</p>
        </div>
        <div className="stat-tile">
          <p className="stat-tile__label">Card Activity</p>
          <p className="stat-tile__value">{formatUsd(card.transactionVolume)}</p>
          <p className="app-sub">Eligible transaction volume</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
        {!card.ownedByUser && !card.isOfficial && <RollButton text="Get Card" onClick={() => setGetCard(true)} />}
        {activeCampaign && <RouteRollLink text="Join Campaign" to={`/campaign/${activeCampaign.id}`} />}
        <RollButton text="Share" onClick={() => setShare(true)} />
        <RouteRollLink text="Run Similar Card" to="/launchpad/create" />
      </div>

      <p className="section-label">Campaigns</p>
      {campaigns.length === 0 ? (
        <div className="empty-state">No campaigns yet for this card.</div>
      ) : (
        <div className="panel">
          {campaigns.map((c) => (
            <div className="data-row" key={c.id}>
              <span>{c.title}</span>
              <span>{formatUsd(c.rewardPool)} pool</span>
              <span>{formatNum(c.participants)} participants</span>
              <RouteRollLink text="View Campaign" to={`/campaign/${c.id}`} />
            </div>
          ))}
        </div>
      )}

      <p className="section-label">Community</p>
      <div className="panel-grid">
        <div className="stat-tile">
          <p className="stat-tile__label">Card Views</p>
          <p className="stat-tile__value">{formatNum(card.cardViews)}</p>
        </div>
        <div className="stat-tile">
          <p className="stat-tile__label">Applications</p>
          <p className="stat-tile__value">{formatNum(card.applications)}</p>
        </div>
        <div className="stat-tile">
          <p className="stat-tile__label">Community Size</p>
          <p className="stat-tile__value">{formatNum(card.communitySize)}</p>
        </div>
      </div>

      {getCard && <GetCardModal card={card} onClose={() => setGetCard(false)} />}
      {share && <ShareXModal cardName={card.name} onClose={() => setShare(false)} />}
    </div>
  );
}
