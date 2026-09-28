import type { CardRewardConfig, CardTheme } from '../demo/types';
import { delay } from './delay';

export interface CreateCardInput {
  name: string;
  symbol: string;
  description: string;
  theme: CardTheme;
  accentColor?: string;
  rewards: CardRewardConfig;
}

/** Simulated card issuance — validates locally, then resolves as if a backend had run it. */
export async function runCard(input: CreateCardInput) {
  if (!input.name.trim()) throw new Error('Card name is required.');
  if (!input.symbol.trim()) throw new Error('Card symbol is required.');
  await delay(1600);
  return input;
}

/** Save an in-progress card without publishing it — used by the Launchpad's "Save Draft". */
export async function saveDraftCard(input: CreateCardInput) {
  await delay(500);
  return input;
}

export async function acquireCard(cardId: string) {
  await delay(1300 + Math.random() * 700);
  return { cardId };
}

export async function setCardStatus(cardId: string, status: 'active' | 'frozen') {
  await delay(500);
  return { cardId, status };
}
