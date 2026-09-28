import type { RunCard } from '../demo/types';

export type MarketplaceFilter = 'trending' | 'new' | 'rewards' | 'active' | 'popular';

export function filterCards(cards: RunCard[], query: string, filter: MarketplaceFilter): RunCard[] {
  const q = query.trim().toLowerCase();
  let list = cards;
  if (q) {
    list = list.filter(
      (c) => c.name.toLowerCase().includes(q) || c.creator.toLowerCase().includes(q) || c.creatorHandle.toLowerCase().includes(q),
    );
  }
  switch (filter) {
    case 'new':
      return [...list].sort((a, b) => b.createdAt - a.createdAt);
    case 'rewards':
      return [...list].sort((a, b) => b.rewardRate - a.rewardRate);
    case 'active':
      return [...list].sort((a, b) => b.activeUsers - a.activeUsers);
    case 'popular':
      return [...list].sort((a, b) => b.communitySize - a.communitySize);
    case 'trending':
    default:
      return [...list].sort((a, b) => b.transactionVolume - a.transactionVolume);
  }
}
