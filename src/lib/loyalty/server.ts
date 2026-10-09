import { FieldValue, Timestamp, type Transaction } from 'firebase-admin/firestore';
import { randomBytes } from 'crypto';
import { adminDb, ApiError } from '@/lib/firebase/admin';
import { birthdayWeekYear } from '@/lib/birthday';
import { formatLimit, planFor, type Plan } from '@/lib/plans';
import {
  DEFAULT_PROGRAM,
  TILL_CODE_TTL_SECONDS,
  type LoyaltyProgram,
  type MemberSummary,
  type Reward,
  type RewardProgress,
} from './types';

export const businessRef = (bid: string) => adminDb.collection('businesses').doc(bid);
const memberRef = (bid: string, phone: string) => businessRef(bid).collection('members').doc(phone);

function costFrom(value: unknown): number | null {
  return typeof value === 'number' && value >= 0 ? value : null;
}

export function programFrom(data: FirebaseFirestore.DocumentData | undefined): LoyaltyProgram {
  const program = data?.program ?? {};
  const birthday = program.birthdayReward ?? {};
  return {
    earnRule: program.earnRule || DEFAULT_PROGRAM.earnRule,
    minSpend: typeof program.minSpend === 'number' ? program.minSpend : null,
    cooldownHours: typeof program.cooldownHours === 'number' ? program.cooldownHours : DEFAULT_PROGRAM.cooldownHours,
    birthdayReward: {
      enabled: birthday.enabled === true,
      name: birthday.name || DEFAULT_PROGRAM.birthdayReward.name,
      costRand: costFrom(birthday.costRand),
    },
  };
}

function birthdayRewardOn(program: LoyaltyProgram, plan: Plan): boolean {
  return plan.birthdayRewards && program.birthdayReward.enabled;
}

function memberSummary(
  id: string,
  data: FirebaseFirestore.DocumentData,
  program: LoyaltyProgram,
  plan: Plan,
): MemberSummary {
  const year = birthdayWeekYear(data.birthday);
  const available =
    birthdayRewardOn(program, plan) && year !== null && data.lastBirthdayRewardYear !== year;
  return {
    id,
    name: data.name,
    phone: data.phone,
    stamps: data.stamps ?? 0,
    lifetimeStamps: data.lifetimeStamps ?? 0,
    birthday: data.birthday ?? null,
    birthdayRewardAvailable: available ? { name: program.birthdayReward.name } : null,
  };
}

function rewardFrom(doc: FirebaseFirestore.DocumentSnapshot): Reward {
  const d = doc.data()!;
  return { id: doc.id, name: d.name, stampsRequired: d.stampsRequired, active: d.active === true, costRand: costFrom(d.costRand) };
}

export async function getBusiness(bid: string) {
  const snap = await businessRef(bid).get();
  if (!snap.exists) throw new ApiError(404, 'Business not found.');
  const data = snap.data()!;
  return { data, plan: planFor(data.plan), program: programFrom(data) };
}

export async function getActiveRewards(bid: string): Promise<Reward[]> {
  const snap = await businessRef(bid).collection('rewards').where('active', '==', true).get();
  return snap.docs.map(rewardFrom).sort((a, b) => a.stampsRequired - b.stampsRequired);
}

export async function getAllRewards(bid: string): Promise<Reward[]> {
  const snap = await businessRef(bid).collection('rewards').get();
  return snap.docs.map(rewardFrom).sort((a, b) => a.stampsRequired - b.stampsRequired);
}

export function withProgress(rewards: Reward[], stamps: number): RewardProgress[] {
  return rewards.map((r) => ({ ...r, eligible: stamps >= r.stampsRequired }));
}

export async function getMember(bid: string, phone: string): Promise<MemberSummary | null> {
  const [snap, business] = await Promise.all([memberRef(bid, phone).get(), getBusiness(bid)]);
  return snap.exists ? memberSummary(snap.id, snap.data()!, business.program, business.plan) : null;
}

export async function countMembers(bid: string): Promise<number> {
  const agg = await businessRef(bid).collection('members').count().get();
  return agg.data().count;
}

export async function countActiveRewards(bid: string): Promise<number> {
  const agg = await businessRef(bid).collection('rewards').where('active', '==', true).count().get();
  return agg.data().count;
}

export async function createTillCode(bid: string, byUid: string) {
  const code = randomBytes(6).toString('base64url');
  const expiresAt = Timestamp.fromMillis(Date.now() + TILL_CODE_TTL_SECONDS * 1000);
  await businessRef(bid).collection('tillCodes').doc(code).set({
    expiresAt,
    usedByMemberId: null,
    usedByName: null,
    usedStamps: null,
    createdByUid: byUid,
    createdAt: FieldValue.serverTimestamp(),
  });
  return { code, expiresAt: expiresAt.toMillis() };
}

type NewMember = {
  name: string;
  uid: string | null;
  addedBy: 'till' | 'app';
  birthday?: string | null;
  birthYear?: number | null;
};

type StampInput = {
  bid: string;
  phone: string;
  method: 'qr' | 'phone';
  byUid: string;
  // Used to create the member on their first stamp; omit to require an existing member.
  newMember?: NewMember;
  // Links an app user to an existing till-created member.
  linkUid?: string;
  tillCode?: string;
};

// Adds one stamp inside a transaction, creating the member on first visit and
// enforcing the business's cooldown and plan member limit. When tillCode is
// given, the code is validated and consumed in the same transaction so it can
// only be used once.
export async function addStamp(input: StampInput) {
  const { bid, phone, method, byUid, newMember, linkUid, tillCode } = input;
  const bRef = businessRef(bid);
  const mRef = memberRef(bid, phone);
  const codeRef = tillCode ? bRef.collection('tillCodes').doc(tillCode) : null;

  // Member limit: only new members count against it, existing ones always earn.
  if (newMember && !(await mRef.get()).exists) {
    const { plan } = await getBusiness(bid);
    if (plan.maxMembers !== null && (await countMembers(bid)) >= plan.maxMembers) {
      throw new ApiError(
        402,
        `This store has reached its member limit (${formatLimit(plan.maxMembers)} on the ${plan.id} plan). ` +
          'Existing members can still earn stamps. Ask the owner to upgrade to add new members.',
      );
    }
  }

  return adminDb.runTransaction(async (tx: Transaction) => {
    const [bSnap, mSnap, codeSnap] = await Promise.all([
      tx.get(bRef),
      tx.get(mRef),
      codeRef ? tx.get(codeRef) : Promise.resolve(null),
    ]);

    if (!bSnap.exists || bSnap.data()?.status !== 'active') {
      throw new ApiError(404, 'This store is not active on Loyalty Leap.');
    }
    if (codeRef) {
      if (!codeSnap?.exists) throw new ApiError(404, 'This code is not valid. Ask staff to show a new one.');
      const code = codeSnap.data()!;
      if (code.usedByMemberId) throw new ApiError(409, 'This code has already been used. Ask staff to show a new one.');
      if (code.expiresAt.toMillis() < Date.now()) throw new ApiError(410, 'This code has expired. Ask staff to show a new one.');
    }

    const program = programFrom(bSnap.data());
    const plan = planFor(bSnap.data()?.plan);
    const now = Timestamp.now();
    let member: FirebaseFirestore.DocumentData;

    if (mSnap.exists) {
      const existing = mSnap.data()!;
      if (linkUid && existing.uid && existing.uid !== linkUid) {
        throw new ApiError(409, 'This cellphone number belongs to another account. Ask staff for help.');
      }
      const last: Timestamp | undefined = existing.lastStampAt;
      if (last && program.cooldownHours > 0) {
        const nextAllowed = last.toMillis() + program.cooldownHours * 3600_000;
        if (nextAllowed > now.toMillis()) {
          const minutes = Math.ceil((nextAllowed - now.toMillis()) / 60_000);
          const wait = minutes >= 60 ? `${Math.ceil(minutes / 60)} hour(s)` : `${minutes} minute(s)`;
          throw new ApiError(429, `${existing.name} already got a stamp recently. Next stamp allowed in ${wait}.`);
        }
      }
      const linking = linkUid && !existing.uid;
      // App users who share their birthday fill it in on a till-created member.
      const addBirthday = !existing.birthday && newMember?.birthday;
      tx.update(mRef, {
        stamps: FieldValue.increment(1),
        lifetimeStamps: FieldValue.increment(1),
        lastStampAt: now,
        ...(linking ? { uid: linkUid } : {}),
        ...(addBirthday ? { birthday: newMember!.birthday, birthYear: newMember!.birthYear ?? null } : {}),
      });
      member = {
        ...existing,
        stamps: (existing.stamps ?? 0) + 1,
        lifetimeStamps: (existing.lifetimeStamps ?? 0) + 1,
        ...(addBirthday ? { birthday: newMember!.birthday } : {}),
      };
    } else {
      if (!newMember) throw new ApiError(404, 'No customer with this number yet.');
      member = {
        name: newMember.name,
        phone,
        uid: newMember.uid,
        stamps: 1,
        lifetimeStamps: 1,
        lastStampAt: now,
        createdAt: now,
        consentAt: now,
        addedBy: newMember.addedBy,
        birthday: newMember.birthday ?? null,
        birthYear: newMember.birthYear ?? null,
      };
      tx.set(mRef, member);
    }

    if (codeRef) {
      tx.update(codeRef, { usedByMemberId: phone, usedByName: member.name, usedStamps: member.stamps, usedAt: now });
    }
    tx.create(bRef.collection('stampLog').doc(), {
      memberId: phone,
      type: 'stamp',
      method,
      byUid,
      at: now,
    });

    return {
      businessName: bSnap.data()!.name as string,
      member: memberSummary(phone, member, program, plan),
    };
  });
}

export async function redeemReward(bid: string, phone: string, rewardId: string, byUid: string) {
  const bRef = businessRef(bid);
  const mRef = memberRef(bid, phone);
  const rRef = bRef.collection('rewards').doc(rewardId);

  return adminDb.runTransaction(async (tx) => {
    const [bSnap, mSnap, rSnap] = await Promise.all([tx.get(bRef), tx.get(mRef), tx.get(rRef)]);
    if (!mSnap.exists) throw new ApiError(404, 'No customer with this number.');
    if (!rSnap.exists || !rSnap.data()!.active) throw new ApiError(404, 'This reward is not available.');

    const member = mSnap.data()!;
    const reward = rewardFrom(rSnap);
    const stamps = member.stamps ?? 0;
    if (stamps < reward.stampsRequired) {
      throw new ApiError(409, `${member.name} needs ${reward.stampsRequired - stamps} more stamp(s) for ${reward.name}.`);
    }

    tx.update(mRef, { stamps: FieldValue.increment(-reward.stampsRequired) });
    tx.create(bRef.collection('stampLog').doc(), {
      memberId: phone,
      type: 'redeem',
      method: 'phone',
      rewardId,
      rewardName: reward.name,
      stampsUsed: reward.stampsRequired,
      // Recorded at redemption time so later edits to the reward don't
      // rewrite the programme's cost history.
      costRand: reward.costRand,
      birthday: false,
      byUid,
      at: Timestamp.now(),
    });

    return {
      member: memberSummary(
        mSnap.id,
        { ...member, stamps: stamps - reward.stampsRequired },
        programFrom(bSnap.data()),
        planFor(bSnap.data()?.plan),
      ),
      rewardName: reward.name,
    };
  });
}

// Redeems this year's birthday reward. It doesn't use stamps and can be
// claimed once, during the member's birthday week.
export async function redeemBirthdayReward(bid: string, phone: string, byUid: string) {
  const bRef = businessRef(bid);
  const mRef = memberRef(bid, phone);

  return adminDb.runTransaction(async (tx) => {
    const [bSnap, mSnap] = await Promise.all([tx.get(bRef), tx.get(mRef)]);
    if (!mSnap.exists) throw new ApiError(404, 'No customer with this number.');
    const program = programFrom(bSnap.data());
    const plan = planFor(bSnap.data()?.plan);
    if (!birthdayRewardOn(program, plan)) throw new ApiError(403, 'Birthday rewards are not switched on for this store.');

    const member = mSnap.data()!;
    const year = birthdayWeekYear(member.birthday);
    if (year === null) throw new ApiError(409, `It isn't ${member.name}'s birthday week.`);
    if (member.lastBirthdayRewardYear === year) {
      throw new ApiError(409, `${member.name} has already had this year's birthday reward.`);
    }

    tx.update(mRef, { lastBirthdayRewardYear: year });
    tx.create(bRef.collection('stampLog').doc(), {
      memberId: phone,
      type: 'redeem',
      method: 'phone',
      rewardId: null,
      rewardName: program.birthdayReward.name,
      stampsUsed: 0,
      costRand: program.birthdayReward.costRand,
      birthday: true,
      byUid,
      at: Timestamp.now(),
    });

    return {
      member: memberSummary(mSnap.id, { ...member, lastBirthdayRewardYear: year }, program, plan),
      rewardName: program.birthdayReward.name,
    };
  });
}

type RewardInput = { name: string; stampsRequired: number; costRand: number | null; active: boolean };

function activeRewardLimitError(plan: Plan) {
  return new ApiError(
    402,
    `The ${plan.id} plan allows ${formatLimit(plan.maxActiveRewards)} active rewards. ` +
      'Switch another reward off, or upgrade for unlimited rewards.',
  );
}

export async function createReward(bid: string, input: RewardInput) {
  const { plan } = await getBusiness(bid);
  if (input.active && plan.maxActiveRewards !== null && (await countActiveRewards(bid)) >= plan.maxActiveRewards) {
    throw activeRewardLimitError(plan);
  }
  const ref = await businessRef(bid).collection('rewards').add({ ...input, createdAt: FieldValue.serverTimestamp() });
  return ref.id;
}

export async function updateReward(bid: string, rewardId: string, input: Partial<RewardInput>) {
  const ref = businessRef(bid).collection('rewards').doc(rewardId);
  const snap = await ref.get();
  if (!snap.exists) throw new ApiError(404, 'Reward not found.');
  if (input.active === true && snap.data()!.active !== true) {
    const { plan } = await getBusiness(bid);
    if (plan.maxActiveRewards !== null && (await countActiveRewards(bid)) >= plan.maxActiveRewards) {
      throw activeRewardLimitError(plan);
    }
  }
  await ref.update(input);
}

export async function updateProgram(bid: string, program: LoyaltyProgram) {
  const { plan } = await getBusiness(bid);
  if (program.birthdayReward.enabled && !plan.birthdayRewards) {
    throw new ApiError(402, 'Birthday rewards are included in the Growth and Pro plans.');
  }
  await businessRef(bid).update({ program });
}
