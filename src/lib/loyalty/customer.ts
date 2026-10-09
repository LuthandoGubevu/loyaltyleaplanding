import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase/admin';
import { planFor } from '@/lib/plans';
import { businessRef, getActiveRewards, memberSummary, programFrom, withProgress } from './server';
import type { RewardProgress } from './types';

// Customer-side views. A customer's membership at a shop is the member doc
// keyed by their cellphone number (businesses/{bid}/members/{phone}). It is
// theirs when it's linked to their account, or not yet linked to anyone (a
// member added at the till by number; it links on their next app scan).

export type CustomerStore = {
  businessId: string;
  name: string;
  earnRule: string;
  stamps: number;
  lifetimeStamps: number;
  lastVisit: number | null;
  rewards: RewardProgress[];
  nextReward: { name: string; stampsToGo: number } | null;
  readyRewards: string[];
  birthdayReward: string | null;
};

export type ActivityEntry = {
  businessId: string;
  shop: string;
  type: 'stamp' | 'redeem';
  rewardName: string | null;
  birthday: boolean;
  at: number;
};

const millis = (v: unknown) => (v instanceof Timestamp ? v.toMillis() : null);

async function activeBusinesses() {
  const snap = await adminDb.collection('businesses').where('status', '==', 'active').get();
  return snap.docs;
}

async function memberships(uid: string, phone: string | null) {
  if (!phone) return [];
  const businesses = await activeBusinesses();
  if (businesses.length === 0) return [];
  const memberDocs = await adminDb.getAll(...businesses.map((b) => b.ref.collection('members').doc(phone)));
  return businesses
    .map((business, i) => ({ business, member: memberDocs[i] }))
    .filter(({ member }) => member.exists && (member.data()!.uid === uid || !member.data()!.uid));
}

export async function getCustomerStores(uid: string, phone: string | null): Promise<CustomerStore[]> {
  const rows = await memberships(uid, phone);
  const stores = await Promise.all(
    rows.map(async ({ business, member }) => {
      const data = business.data();
      const program = programFrom(data);
      const summary = memberSummary(member.id, member.data()!, program, planFor(data.plan));
      const rewards = withProgress(await getActiveRewards(business.id), summary.stamps);
      const next = rewards.find((r) => !r.eligible);
      return {
        businessId: business.id,
        name: data.name as string,
        earnRule: program.earnRule,
        stamps: summary.stamps,
        lifetimeStamps: summary.lifetimeStamps,
        lastVisit: millis(member.data()!.lastStampAt),
        rewards,
        nextReward: next ? { name: next.name, stampsToGo: next.stampsRequired - summary.stamps } : null,
        readyRewards: rewards.filter((r) => r.eligible).map((r) => r.name),
        birthdayReward: summary.birthdayRewardAvailable?.name ?? null,
      };
    }),
  );
  return stores.sort((a, b) => (b.lastVisit ?? 0) - (a.lastVisit ?? 0));
}

export async function getCustomerActivity(uid: string, phone: string | null, businessId?: string): Promise<ActivityEntry[]> {
  const rows = (await memberships(uid, phone)).filter(({ business }) => !businessId || business.id === businessId);
  const perShop = await Promise.all(
    rows.map(async ({ business }) => {
      const snap = await business.ref.collection('stampLog').where('memberId', '==', phone).get();
      return snap.docs.map((d) => {
        const e = d.data();
        return {
          businessId: business.id,
          shop: business.data().name as string,
          type: e.type,
          rewardName: e.rewardName ?? null,
          birthday: e.birthday === true,
          at: millis(e.at) ?? 0,
        } as ActivityEntry;
      });
    }),
  );
  return perShop.flat().sort((a, b) => b.at - a.at).slice(0, 50);
}

export async function getShops(uid: string, phone: string | null) {
  const [businesses, joined] = await Promise.all([activeBusinesses(), memberships(uid, phone)]);
  const joinedIds = new Set(joined.map(({ business }) => business.id));
  const shops = await Promise.all(
    businesses.map(async (b) => {
      const rewards = await getActiveRewards(b.id);
      return {
        businessId: b.id,
        name: b.data().name as string,
        earnRule: programFrom(b.data()).earnRule,
        topReward: rewards[0] ? { name: rewards[0].name, stampsRequired: rewards[0].stampsRequired } : null,
        joined: joinedIds.has(b.id),
      };
    }),
  );
  return shops.sort((a, b) => Number(b.joined) - Number(a.joined) || a.name.localeCompare(b.name));
}
