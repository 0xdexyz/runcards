import { simulateXActivity } from './mockXService';

export type XVerificationState = 'not-started' | 'checking' | 'verified' | 'not-verified' | 'unavailable';

/** Simulates verifying a campaign's eligible X activity — no real API call is made. */
export async function verifyCampaignActivity(_taskType: string): Promise<{ state: XVerificationState }> {
  const res = await simulateXActivity();
  return { state: res.verified ? 'verified' : 'not-verified' };
}
