import { delay } from './delay';

/** Simulated post-verification used by the X Activity Simulator inside campaign tasks. */
export async function simulateXActivity() {
  await delay(1200 + Math.random() * 900);
  return { verified: true };
}
