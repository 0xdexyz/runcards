import { delay } from './delay';

export async function claimRewards(available: number) {
  if (available <= 0) throw new Error('Insufficient balance.');
  await delay(1200 + Math.random() * 700);
  return { claimed: available };
}
