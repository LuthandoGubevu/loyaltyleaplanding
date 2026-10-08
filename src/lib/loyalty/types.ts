// Shared shapes for the stamp-based loyalty programme. Firestore layout:
//   businesses/{bid}.program            -> LoyaltyProgram
//   businesses/{bid}/rewards/{rid}      -> Reward
//   businesses/{bid}/members/{phone}    -> Member (doc id = normalised phone)
//   businesses/{bid}/stampLog/{id}      -> StampLogEntry
//   businesses/{bid}/tillCodes/{code}   -> TillCode
// Members, stamp log entries and till codes are only ever written by the
// server (src/app/api), never by the browser.

export type LoyaltyProgram = {
  earnRule: string;
  minSpend: number | null;
  cooldownHours: number;
};

export const DEFAULT_PROGRAM: LoyaltyProgram = {
  earnRule: '1 stamp per visit',
  minSpend: null,
  cooldownHours: 2,
};

export type Reward = {
  id: string;
  name: string;
  stampsRequired: number;
  active: boolean;
};

export type MemberSummary = {
  id: string;
  name: string;
  phone: string;
  stamps: number;
  lifetimeStamps: number;
};

export type RewardProgress = Reward & { eligible: boolean };

export const TILL_CODE_TTL_SECONDS = 60;
export const TILL_QR_PREFIX = 'll';

export function buildTillPayload(businessId: string, code: string): string {
  return `${TILL_QR_PREFIX}:${businessId}:${code}`;
}

export function parseTillPayload(payload: string): { businessId: string; code: string } | null {
  const parts = payload.trim().split(':');
  if (parts.length !== 3 || parts[0] !== TILL_QR_PREFIX || !parts[1] || !parts[2]) return null;
  return { businessId: parts[1], code: parts[2] };
}
