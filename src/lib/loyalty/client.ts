// Browser-side helpers for loyalty settings. All writes go through the API so
// plan limits are enforced on the server.
import { apiFetch } from '@/lib/api-client';
import type { Plan } from '@/lib/plans';
import type { LoyaltyProgram, Reward } from './types';

export function fetchProgram() {
  return apiFetch<{ program: LoyaltyProgram; plan: Plan }>('/api/program');
}

export function saveProgram(program: LoyaltyProgram) {
  return apiFetch('/api/program', { method: 'PATCH', body: program });
}

export async function fetchRewards(): Promise<Reward[]> {
  return (await apiFetch<{ rewards: Reward[] }>('/api/rewards')).rewards;
}

export function createReward(reward: Omit<Reward, 'id'>) {
  return apiFetch<{ id: string }>('/api/rewards', { method: 'POST', body: reward });
}

export function updateReward(rewardId: string, reward: Partial<Omit<Reward, 'id'>>) {
  return apiFetch(`/api/rewards/${encodeURIComponent(rewardId)}`, { method: 'PATCH', body: reward });
}
