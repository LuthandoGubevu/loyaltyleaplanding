// Loyalty Leap subscription plans. Limits are enforced on the server
// (src/lib/loyalty/server.ts and the API routes); the UI only reflects them.

export type PlanId = 'Starter' | 'Growth' | 'Pro';
export type AnalyticsLevel = 'none' | 'basic' | 'full';

export type Plan = {
  id: PlanId;
  priceMonthly: number;
  maxMembers: number | null; // null = unlimited
  maxActiveRewards: number | null;
  analytics: AnalyticsLevel;
  birthdayRewards: boolean;
  export: boolean;
  support: string;
};

export const PLANS: Record<PlanId, Plan> = {
  Starter: {
    id: 'Starter',
    priceMonthly: 399,
    maxMembers: 250,
    maxActiveRewards: 2,
    analytics: 'none',
    birthdayRewards: false,
    export: false,
    support: 'Email support',
  },
  Growth: {
    id: 'Growth',
    priceMonthly: 799,
    maxMembers: 1000,
    maxActiveRewards: null,
    analytics: 'basic',
    birthdayRewards: true,
    export: false,
    support: 'Priority email support',
  },
  Pro: {
    id: 'Pro',
    priceMonthly: 1199,
    maxMembers: null,
    maxActiveRewards: null,
    analytics: 'full',
    birthdayRewards: true,
    export: true,
    support: 'Dedicated onboarding',
  },
};

export const PLAN_IDS: PlanId[] = ['Starter', 'Growth', 'Pro'];

export const UPGRADE_CONTACT = 'lgubevu@gmail.com';

// Businesses created before these plans existed used Launch/Growth/Complete.
export function normalizePlan(raw: unknown): PlanId {
  if (raw === 'Starter' || raw === 'Growth' || raw === 'Pro') return raw;
  if (raw === 'Complete') return 'Pro';
  return 'Starter';
}

export function planFor(raw: unknown): Plan {
  return PLANS[normalizePlan(raw)];
}

export function formatLimit(limit: number | null): string {
  return limit === null ? 'Unlimited' : limit.toLocaleString('en-ZA');
}
