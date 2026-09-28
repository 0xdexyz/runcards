import type { DiscoverVisual } from './DiscoverCardArt';

/**
 * Featured creator cards shown in the DISCOVER reel. `id` must match a real card id in
 * demo/seed.ts so clicking through opens a genuine, connected card detail page.
 */
export interface DiscoverCard {
  id: string;
  name: string;
  category: string;
  visual: DiscoverVisual;
}

export const DISCOVER_CARDS: DiscoverCard[] = [
  { id: 'maya', name: 'MAYA', category: 'Community', visual: 'maya' },
  { id: 'jordan', name: 'JORDAN', category: 'Creator', visual: 'jordan' },
  { id: 'kai', name: 'KAI', category: 'Web3', visual: 'kai' },
  { id: 'luca', name: 'LUCA', category: 'Community', visual: 'luca' },
  { id: 'ava', name: 'AVA', category: 'Creator', visual: 'ava' },
];
