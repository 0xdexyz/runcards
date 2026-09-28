import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { RunCard } from '../../demo/types';
import { formatNum } from '../../demo/selectors';
import CardVisual from './CardVisual';

export default function CardTile({ card, actions }: { card: RunCard; actions?: ReactNode }) {
  return (
    <article className="card-tile">
      <Link to={`/card/${card.id}`} style={{ display: 'contents' }}>
        <CardVisual theme={card.theme} accentColor={card.accentColor} symbol={card.symbol} name={card.name} official={card.isOfficial} id={card.id} createdAt={card.createdAt} />
        <div>
          <p className="card-tile__name">{card.name}</p>
          <p className="card-tile__handle">
            {card.isOfficial ? 'Official RUN Card' : `Creator · ${card.creatorHandle}`}
          </p>
        </div>
      </Link>
      <div className="card-tile__stats">
        <span>
          Reward <b>{card.rewardRate}%</b>
        </span>
        <span>
          Users <b>{formatNum(card.activeUsers)}</b>
        </span>
        <span>
          Campaigns <b>{card.campaignIds.length}</b>
        </span>
      </div>
      {actions && <div className="card-tile__actions">{actions}</div>}
    </article>
  );
}
