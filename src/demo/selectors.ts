import type { Campaign, DemoState, RunCard } from './types';

export function formatUsd(n: number) {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatNum(n: number) {
  return n.toLocaleString('en-US');
}

export function getCardById(state: DemoState, id: string | undefined): RunCard | undefined {
  return id ? state.cards.find((c) => c.id === id) : undefined;
}

export function getCampaignById(state: DemoState, id: string | undefined): Campaign | undefined {
  return id ? state.campaigns.find((c) => c.id === id) : undefined;
}

export function getCampaignsForCard(state: DemoState, cardId: string): Campaign[] {
  return state.campaigns.filter((c) => c.cardId === cardId);
}

export function creatorEstimate(card: RunCard) {
  const estimated = Math.round(card.transactionVolume * (card.rewards.creatorShare / 100) * 100) / 100;
  const unclaimed = Math.max(0, estimated - card.creatorClaimed);
  return { eligibleVolume: card.transactionVolume, creatorShare: card.rewards.creatorShare, estimated, unclaimed };
}

export function myCards(state: DemoState): RunCard[] {
  return state.cards.filter((c) => c.ownedByUser && c.runState !== 'draft');
}

export function yourCards(state: DemoState): RunCard[] {
  return state.cards.filter((c) => c.createdByUser);
}

export function joinedCampaigns(state: DemoState): Campaign[] {
  return state.campaigns.filter((c) => c.joined);
}

const ACTIVITY_HANDLES = [
  'alex.rn', 'mira_k', 'devonwrx', 'sana.codes', 'kylebuilds', 'priya_v', 'tomas.rm',
  'noahlane', 'ren_dao', 'jules.eth', 'harperq', 'ivy_run', 'markosol', 'lena.tx',
];

const ACTIVITY_VERBS = ['joined the campaign', 'completed a task', 'referred a new user', 'shared the card', 'posted about the card'];

function hashSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return h;
}

export interface CampaignActivityItem {
  handle: string;
  verb: string;
  minutesAgo: number;
}

/** Deterministic recent-activity feed for a campaign, derived from its own id and participant count. */
export function recentActivity(campaign: Campaign, count = 3): CampaignActivityItem[] {
  const seed = hashSeed(campaign.id);
  return Array.from({ length: count }, (_, i) => {
    const n = seed + i * 2654435761;
    const handle = ACTIVITY_HANDLES[(n >>> 4) % ACTIVITY_HANDLES.length];
    const verb = ACTIVITY_VERBS[(n >>> 8) % ACTIVITY_VERBS.length];
    const minutesAgo = 1 + ((n >>> 12) % 180) + i * 7;
    return { handle: `@${handle}`, verb, minutesAgo };
  }).sort((a, b) => a.minutesAgo - b.minutesAgo);
}

export function formatMinutesAgo(m: number) {
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
