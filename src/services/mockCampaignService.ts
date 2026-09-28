import { delay } from './delay';

export async function joinCampaign(campaignId: string) {
  await delay(700);
  return { campaignId };
}

export async function completeTask(campaignId: string, taskId: string) {
  await delay(600);
  return { campaignId, taskId };
}

export interface CreateCampaignInput {
  cardId: string;
  title: string;
  objective: string;
  rewardPool: number;
  durationDays: number;
}

export async function createCampaign(input: CreateCampaignInput) {
  if (!input.title.trim()) throw new Error('Campaign name is required.');
  await delay(1200);
  return input;
}
