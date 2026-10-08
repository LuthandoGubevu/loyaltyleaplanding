import { FieldValue, Timestamp, type Transaction } from 'firebase-admin/firestore';
import { randomBytes } from 'crypto';
import { adminDb, ApiError } from '@/lib/firebase/admin';
import {
  DEFAULT_PROGRAM,
  TILL_CODE_TTL_SECONDS,
  type LoyaltyProgram,
  type MemberSummary,
  type Reward,
  type RewardProgress,
} from './types';

const businessRef = (bid: string) => adminDb.collection('businesses').doc(bid);
const memberRef = (bid: string, phone: string) => businessRef(bid).collection('members').doc(phone);

export function programFrom(data: FirebaseFirestore.DocumentData | undefined): LoyaltyProgram {
  const program = data?.program ?? {};
  return {
    earnRule: program.earnRule || DEFAULT_PROGRAM.earnRule,
    minSpend: typeof program.minSpend === 'number' ? program.minSpend : null,
    cooldownHours: typeof program.cooldownHours === 'number' ? program.cooldownHours : DEFAULT_PROGRAM.cooldownHours,
  };
}

function memberSummary(id: string, data: FirebaseFirestore.DocumentData): MemberSummary {
  return {
    id,
    name: data.name,
    phone: data.phone,
    stamps: data.stamps ?? 0,
    lifetimeStamps: data.lifetimeStamps ?? 0,
  };
}

export async function getActiveRewards(bid: string): Promise<Reward[]> {
  const snap = await businessRef(bid).collection('rewards').where('active', '==', true).get();
  return snap.docs
    .map((d) => ({ id: d.id, name: d.data().name, stampsRequired: d.data().stampsRequired, active: true }))
    .sort((a, b) => a.stampsRequired - b.stampsRequired);
}

export function withProgress(rewards: Reward[], stamps: number): RewardProgress[] {
  return rewards.map((r) => ({ ...r, eligible: stamps >= r.stampsRequired }));
}

export async function getMember(bid: string, phone: string): Promise<MemberSummary | null> {
  const snap = await memberRef(bid, phone).get();
  return snap.exists ? memberSummary(snap.id, snap.data()!) : null;
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

type NewMember = { name: string; uid: string | null; addedBy: 'till' | 'app' };

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
// enforcing the business's cooldown. When tillCode is given, the code is
// validated and consumed in the same transaction so it can only be used once.
export async function addStamp(input: StampInput) {
  const { bid, phone, method, byUid, newMember, linkUid, tillCode } = input;
  const bRef = businessRef(bid);
  const mRef = memberRef(bid, phone);
  const codeRef = tillCode ? bRef.collection('tillCodes').doc(tillCode) : null;

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
    const now = Timestamp.now();
    let name: string;
    let stamps: number;

    if (mSnap.exists) {
      const member = mSnap.data()!;
      if (linkUid && member.uid && member.uid !== linkUid) {
        throw new ApiError(409, 'This cellphone number belongs to another account. Ask staff for help.');
      }
      const last: Timestamp | undefined = member.lastStampAt;
      if (last && program.cooldownHours > 0) {
        const nextAllowed = last.toMillis() + program.cooldownHours * 3600_000;
        if (nextAllowed > now.toMillis()) {
          const minutes = Math.ceil((nextAllowed - now.toMillis()) / 60_000);
          const wait = minutes >= 60 ? `${Math.ceil(minutes / 60)} hour(s)` : `${minutes} minute(s)`;
          throw new ApiError(429, `${member.name} already got a stamp recently. Next stamp allowed in ${wait}.`);
        }
      }
      name = member.name;
      stamps = (member.stamps ?? 0) + 1;
      tx.update(mRef, {
        stamps: FieldValue.increment(1),
        lifetimeStamps: FieldValue.increment(1),
        lastStampAt: now,
        ...(linkUid && !member.uid ? { uid: linkUid } : {}),
      });
    } else {
      if (!newMember) throw new ApiError(404, 'No customer with this number yet.');
      name = newMember.name;
      stamps = 1;
      tx.set(mRef, {
        name: newMember.name,
        phone,
        uid: newMember.uid,
        stamps: 1,
        lifetimeStamps: 1,
        lastStampAt: now,
        createdAt: now,
        consentAt: now,
        addedBy: newMember.addedBy,
      });
    }

    if (codeRef) {
      tx.update(codeRef, { usedByMemberId: phone, usedByName: name, usedStamps: stamps, usedAt: now });
    }
    tx.create(bRef.collection('stampLog').doc(), {
      memberId: phone,
      type: 'stamp',
      method,
      byUid,
      at: now,
    });

    return { businessName: bSnap.data()!.name as string, member: { id: phone, name, phone, stamps } };
  });
}

export async function redeemReward(bid: string, phone: string, rewardId: string, byUid: string) {
  const mRef = memberRef(bid, phone);
  const rRef = businessRef(bid).collection('rewards').doc(rewardId);

  return adminDb.runTransaction(async (tx) => {
    const [mSnap, rSnap] = await Promise.all([tx.get(mRef), tx.get(rRef)]);
    if (!mSnap.exists) throw new ApiError(404, 'No customer with this number.');
    if (!rSnap.exists || !rSnap.data()!.active) throw new ApiError(404, 'This reward is not available.');

    const member = mSnap.data()!;
    const reward = rSnap.data()!;
    const stamps = member.stamps ?? 0;
    if (stamps < reward.stampsRequired) {
      throw new ApiError(409, `${member.name} needs ${reward.stampsRequired - stamps} more stamp(s) for ${reward.name}.`);
    }

    tx.update(mRef, { stamps: FieldValue.increment(-reward.stampsRequired) });
    tx.create(businessRef(bid).collection('stampLog').doc(), {
      memberId: phone,
      type: 'redeem',
      method: 'phone',
      rewardId,
      rewardName: reward.name,
      stampsUsed: reward.stampsRequired,
      byUid,
      at: Timestamp.now(),
    });

    return {
      member: memberSummary(mSnap.id, { ...member, stamps: stamps - reward.stampsRequired }),
      rewardName: reward.name as string,
    };
  });
}
