import { Timestamp } from 'firebase-admin/firestore';
import { daysUntilBirthday, sastToday } from '@/lib/birthday';
import type { Plan } from '@/lib/plans';
import { businessRef, getActiveRewards } from './server';

const DAY_MS = 86_400_000;
const SAST_OFFSET_MS = 2 * 3600_000;
export const WEEKS = 12;
const MONTHS = 6;
const LAPSED_DAYS = 30;

type LogEntry = {
  memberId: string;
  type: 'stamp' | 'redeem';
  method: 'qr' | 'phone';
  at: number;
  costRand: number | null;
  rewardName: string | null;
  birthday: boolean;
};

type MemberRow = {
  id: string;
  name: string;
  phone: string;
  stamps: number;
  lifetimeStamps: number;
  createdAt: number | null;
  lastStampAt: number | null;
  birthday: string | null;
  birthYear: number | null;
  email: string | null;
  hasApp: boolean;
};

const millis = (v: unknown): number | null => (v instanceof Timestamp ? v.toMillis() : null);

// Monday 00:00 (SAST, as a UTC timestamp) of the week containing `t`.
function weekStart(t: number): number {
  const day = sastToday(t);
  const dow = new Date(day).getUTCDay(); // 0 = Sunday
  return day - ((dow + 6) % 7) * DAY_MS;
}

function monthKey(t: number): string {
  const d = new Date(t + SAST_OFFSET_MS);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

const isoDay = (t: number) => new Date(t).toISOString().slice(0, 10);
const round2 = (n: number) => Math.round(n * 100) / 100;

export async function loadMembers(bid: string): Promise<MemberRow[]> {
  const snap = await businessRef(bid).collection('members').get();
  return snap.docs.map((d) => {
    const m = d.data();
    return {
      id: d.id,
      name: m.name,
      phone: m.phone,
      stamps: m.stamps ?? 0,
      lifetimeStamps: m.lifetimeStamps ?? 0,
      createdAt: millis(m.createdAt),
      lastStampAt: millis(m.lastStampAt),
      birthday: m.birthday ?? null,
      birthYear: typeof m.birthYear === 'number' ? m.birthYear : null,
      email: m.email ?? null,
      hasApp: Boolean(m.uid),
    };
  });
}

function logFrom(d: FirebaseFirestore.QueryDocumentSnapshot): LogEntry {
  const e = d.data();
  return {
    memberId: e.memberId,
    type: e.type,
    method: e.method,
    at: millis(e.at) ?? 0,
    costRand: typeof e.costRand === 'number' ? e.costRand : null,
    rewardName: e.rewardName ?? null,
    birthday: e.birthday === true,
  };
}

export async function loadLog(bid: string, sinceMs?: number): Promise<LogEntry[]> {
  let q: FirebaseFirestore.Query = businessRef(bid).collection('stampLog');
  if (sinceMs !== undefined) q = q.where('at', '>=', Timestamp.fromMillis(sinceMs));
  const snap = await q.get();
  return snap.docs.map(logFrom).sort((a, b) => a.at - b.at);
}

export async function computeAnalytics(bid: string, plan: Plan, now = Date.now()) {
  const thisWeek = weekStart(now);
  const weekStarts = Array.from({ length: WEEKS }, (_, i) => thisWeek - (WEEKS - 1 - i) * 7 * DAY_MS);
  const nowMonth = new Date(now + SAST_OFFSET_MS);
  const monthStarts = Array.from({ length: MONTHS }, (_, i) =>
    Date.UTC(nowMonth.getUTCFullYear(), nowMonth.getUTCMonth() - (MONTHS - 1 - i), 1) - SAST_OFFSET_MS,
  );
  const since = Math.min(weekStarts[0], monthStarts[0]);

  const [members, log] = await Promise.all([loadMembers(bid), loadLog(bid, since)]);
  const inWeeks = (t: number) => t >= weekStarts[0];
  const stamps = log.filter((e) => e.type === 'stamp');
  const redeems = log.filter((e) => e.type === 'redeem');

  // Weekly series
  const weekly = weekStarts.map((ws) => ({ week: isoDay(ws), stamps: 0, newMembers: 0, rewardsRedeemed: 0 }));
  const weekIndex = (t: number) => weekStarts.indexOf(weekStart(t));
  for (const e of log) {
    const i = weekIndex(e.at);
    if (i < 0) continue;
    if (e.type === 'stamp') weekly[i].stamps++;
    else weekly[i].rewardsRedeemed++;
  }
  for (const m of members) {
    const i = m.createdAt !== null ? weekIndex(m.createdAt) : -1;
    if (i >= 0) weekly[i].newMembers++;
  }

  // Busiest days & hours: 7 rows (Mon..Sun) x 24 hours of stamp counts.
  const heatmap = Array.from({ length: 7 }, () => Array(24).fill(0) as number[]);
  for (const e of stamps) {
    if (!inWeeks(e.at)) continue;
    const d = new Date(e.at + SAST_OFFSET_MS);
    heatmap[(d.getUTCDay() + 6) % 7][d.getUTCHours()]++;
  }

  const topCustomers = [...members]
    .sort((a, b) => b.lifetimeStamps - a.lifetimeStamps)
    .slice(0, 10)
    .filter((m) => m.lifetimeStamps > 0)
    .map((m) => ({ name: m.name, phone: m.phone, lifetimeStamps: m.lifetimeStamps, lastVisit: m.lastStampAt }));

  const upcomingBirthdays = members
    .filter((m) => m.birthday)
    .map((m) => ({ name: m.name, phone: m.phone, birthday: m.birthday!, inDays: daysUntilBirthday(m.birthday!, now) }))
    .filter((m) => m.inDays <= 30)
    .sort((a, b) => a.inDays - b.inDays);

  const monthlyCost = monthStarts.map((ms) => ({ month: monthKey(ms), cost: 0, redemptions: 0, uncosted: 0 }));
  for (const e of redeems) {
    const row = monthlyCost.find((r) => r.month === monthKey(e.at));
    if (!row) continue;
    row.redemptions++;
    if (e.costRand === null) row.uncosted++;
    else row.cost = round2(row.cost + e.costRand);
  }

  const basic = {
    weekly,
    heatmap,
    topCustomers,
    upcomingBirthdays,
    monthlyCost,
    totals: {
      members: members.length,
      stampsThisWeek: weekly[WEEKS - 1].stamps,
      rewardsThisWeek: weekly[WEEKS - 1].rewardsRedeemed,
      newMembersThisWeek: weekly[WEEKS - 1].newMembers,
    },
  };
  if (plan.analytics === 'basic') return { level: 'basic' as const, ...basic };

  // ---- Full analytics (Pro) ----
  const windowStamps = stamps.filter((e) => inWeeks(e.at));
  const windowRedeems = redeems.filter((e) => inWeeks(e.at));

  // Quiet times: the least busy cells among the days and hours the shop is
  // actually trading (any stamp in that hour/day across the window).
  const openHours = Array.from({ length: 24 }, (_, h) => h).filter((h) => heatmap.some((row) => row[h] > 0));
  const openDays = [0, 1, 2, 3, 4, 5, 6].filter((d) => heatmap[d].some((c) => c > 0));
  const quietTimes = openDays
    .flatMap((d) => openHours.map((h) => ({ day: d, hour: h, stamps: heatmap[d][h] })))
    .sort((a, b) => a.stamps - b.stamps || a.day - b.day || a.hour - b.hour)
    .slice(0, 5);

  const methodSplit = {
    qr: windowStamps.filter((e) => e.method === 'qr').length,
    phone: windowStamps.filter((e) => e.method === 'phone').length,
  };

  const returnRate = members.length ? round2((members.filter((m) => m.lifetimeStamps >= 2).length / members.length) * 100) : null;

  const lapsedCutoff = now - LAPSED_DAYS * DAY_MS;
  const lapsed = members
    .filter((m) => m.lastStampAt !== null && m.lastStampAt < lapsedCutoff)
    .sort((a, b) => b.lastStampAt! - a.lastStampAt!)
    .map((m) => ({ name: m.name, phone: m.phone, lastVisit: m.lastStampAt, lifetimeStamps: m.lifetimeStamps }));

  // Time to reward: days from joining to a member's first stamp-reward redemption (all time).
  const allRedeems = (await loadLog(bid)).filter((e) => e.type === 'redeem' && !e.birthday);
  const firstRedeem = new Map<string, number>();
  for (const e of allRedeems) if (!firstRedeem.has(e.memberId)) firstRedeem.set(e.memberId, e.at);
  const durations = members
    .filter((m) => m.createdAt !== null && firstRedeem.has(m.id))
    .map((m) => (firstRedeem.get(m.id)! - m.createdAt!) / DAY_MS);
  const avgDaysToReward = durations.length ? round2(durations.reduce((a, b) => a + b, 0) / durations.length) : null;

  const year = new Date(now + SAST_OFFSET_MS).getUTCFullYear();
  const bands = [
    { band: 'Under 18', min: 0, max: 17 },
    { band: '18–24', min: 18, max: 24 },
    { band: '25–34', min: 25, max: 34 },
    { band: '35–44', min: 35, max: 44 },
    { band: '45–54', min: 45, max: 54 },
    { band: '55+', min: 55, max: 200 },
  ];
  const ageGroups = bands.map((b) => ({
    band: b.band,
    members: members.filter((m) => m.birthYear !== null && year - m.birthYear >= b.min && year - m.birthYear <= b.max).length,
  }));
  const membersWithAge = members.filter((m) => m.birthYear !== null).length;

  const windowCost = windowRedeems.reduce((sum, e) => sum + (e.costRand ?? 0), 0);
  const costPerVisit = windowStamps.length ? round2(windowCost / windowStamps.length) : null;

  // Reward liability (estimate): unredeemed stamps valued at the cheapest
  // active reward's cost per stamp.
  const rewards = await getActiveRewards(bid);
  const costed = rewards.filter((r) => r.costRand !== null);
  const cheapest = costed.sort((a, b) => a.costRand! / a.stampsRequired - b.costRand! / b.stampsRequired)[0];
  const outstandingStamps = members.reduce((sum, m) => sum + m.stamps, 0);
  const rewardLiability = cheapest
    ? round2((outstandingStamps * cheapest.costRand!) / cheapest.stampsRequired)
    : null;

  const perReward = new Map<string, { reward: string; redemptions: number; cost: number }>();
  for (const e of windowRedeems.filter((r) => !r.birthday)) {
    const key = e.rewardName ?? 'Reward';
    const row = perReward.get(key) ?? { reward: key, redemptions: 0, cost: 0 };
    row.redemptions++;
    row.cost = round2(row.cost + (e.costRand ?? 0));
    perReward.set(key, row);
  }
  const rewardPerformance = [...perReward.values()].sort((a, b) => b.redemptions - a.redemptions);

  const birthdayRedeems = windowRedeems.filter((e) => e.birthday);
  const birthdayRewards = {
    redeemed: birthdayRedeems.length,
    cost: round2(birthdayRedeems.reduce((s, e) => s + (e.costRand ?? 0), 0)),
  };

  return {
    level: 'full' as const,
    ...basic,
    quietTimes,
    methodSplit,
    returnRate,
    lapsed: { count: lapsed.length, members: lapsed.slice(0, 50) },
    avgDaysToReward,
    ageGroups,
    membersWithAge,
    costPerVisit,
    rewardLiability,
    outstandingStamps,
    rewardPerformance,
    birthdayRewards,
  };
}

export type AnalyticsResult = Awaited<ReturnType<typeof computeAnalytics>>;

// Headline numbers and recent activity for the dashboard (every plan).
export async function computeSummary(bid: string, now = Date.now()) {
  const since = weekStart(now);
  const [members, weekLog, recentSnap] = await Promise.all([
    loadMembers(bid),
    loadLog(bid, since),
    businessRef(bid).collection('stampLog').orderBy('at', 'desc').limit(10).get(),
  ]);
  const names = new Map(members.map((m) => [m.id, m.name]));
  return {
    totals: {
      members: members.length,
      newMembersThisWeek: members.filter((m) => m.createdAt !== null && m.createdAt >= since).length,
      stampsThisWeek: weekLog.filter((e) => e.type === 'stamp').length,
      rewardsThisWeek: weekLog.filter((e) => e.type === 'redeem').length,
    },
    recent: recentSnap.docs.map(logFrom).map((e) => ({
      name: names.get(e.memberId) ?? 'Customer',
      phone: e.memberId,
      type: e.type,
      rewardName: e.rewardName,
      birthday: e.birthday,
      at: e.at,
    })),
  };
}
