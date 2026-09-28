import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDemo } from '../demo/store';
import { filterCards, type MarketplaceFilter } from '../services/mockMarketplaceService';
import CardTile from '../components/demo/CardTile';
import GetCardModal from '../components/demo/GetCardModal';
import RouteRollLink from '../components/demo/RouteRollLink';
import { RollButton } from '../components/shared';

type TypeFilter = 'all' | 'official' | 'creator';

const SORTS: { id: MarketplaceFilter; label: string }[] = [
  { id: 'trending', label: 'Trending' },
  { id: 'new', label: 'Newest' },
  { id: 'rewards', label: 'Highest Reward' },
  { id: 'active', label: 'Most Used' },
  { id: 'popular', label: 'Most Cardholders' },
];

export default function Marketplace() {
  const { cards } = useDemo();
  const [params] = useSearchParams();
  const [query, setQuery] = useState('');
  const [type, setType] = useState<TypeFilter>('all');
  const [sort, setSort] = useState<MarketplaceFilter>((params.get('filter') as MarketplaceFilter) || 'trending');
  const [getCardTarget, setGetCardTarget] = useState<string | null>(null);

  const scoped = useMemo(() => {
    const byType = cards.filter((c) => (type === 'all' ? true : type === 'official' ? c.isOfficial : !c.isOfficial));
    return filterCards(byType, query, sort);
  }, [cards, type, sort, query]);

  const target = cards.find((c) => c.id === getCardTarget);

  return (
    <div className="app-page">
      <div className="app-header">
        <div>
          <h1 className="app-title">Discover Cards</h1>
          <p className="app-sub">Explore the RUN Card and cards created by the community.</p>
        </div>
      </div>

      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Search by card, creator or X handle"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="filter-row" style={{ marginBottom: '0.6rem' }}>
        {(['all', 'official', 'creator'] as TypeFilter[]).map((t) => (
          <RollButton key={t} text={t === 'all' ? 'All' : t === 'official' ? 'RUN Card' : 'Creator Cards'} active={type === t} onClick={() => setType(t)} />
        ))}
      </div>
      <div className="filter-row" style={{ marginBottom: '2rem' }}>
        {SORTS.map((s) => (
          <RollButton key={s.id} text={s.label} active={sort === s.id} onClick={() => setSort(s.id)} />
        ))}
      </div>

      {scoped.length === 0 ? (
        <div className="empty-state">No cards match that search.</div>
      ) : (
        <div className="card-grid">
          {scoped.map((card) => (
            <CardTile
              key={card.id}
              card={card}
              actions={
                <>
                  <RouteRollLink text="View Card" to={`/card/${card.id}`} />
                  {!card.ownedByUser && !card.isOfficial && <RollButton text="Get Card" onClick={() => setGetCardTarget(card.id)} />}
                </>
              }
            />
          ))}
        </div>
      )}

      {target && <GetCardModal card={target} onClose={() => setGetCardTarget(null)} />}
    </div>
  );
}
