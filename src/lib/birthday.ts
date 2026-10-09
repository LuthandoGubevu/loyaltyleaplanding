// Birthdays are stored as "MM-DD" (plus an optional birth year), and all date
// maths uses South African time so "today" matches the shop's calendar.

const SAST_OFFSET_MS = 2 * 3600_000;
const DAY_MS = 86_400_000;
export const BIRTHDAY_WINDOW_DAYS = 7;

// Midnight (as a UTC timestamp) of the current South African calendar day.
export function sastToday(now = Date.now()): number {
  const shifted = now + SAST_OFFSET_MS;
  return shifted - (shifted % DAY_MS);
}

export function isValidBirthday(mmdd: string): boolean {
  const m = /^(\d{2})-(\d{2})$/.exec(mmdd);
  if (!m) return false;
  const month = Number(m[1]);
  const day = Number(m[2]);
  if (month < 1 || month > 12 || day < 1) return false;
  return day <= new Date(Date.UTC(2000, month, 0)).getUTCDate(); // 2000 is a leap year
}

function birthdayInYear(mmdd: string, year: number): number {
  const month = Number(mmdd.slice(0, 2));
  let day = Number(mmdd.slice(3, 5));
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (day > daysInMonth) day = daysInMonth; // 29 Feb -> 28 Feb in non-leap years
  return Date.UTC(year, month - 1, day);
}

// The year whose birthday week contains today (birthday + 6 days), or null.
export function birthdayWeekYear(mmdd: string | null | undefined, now = Date.now()): number | null {
  if (!mmdd || !isValidBirthday(mmdd)) return null;
  const today = sastToday(now);
  const year = new Date(today).getUTCFullYear();
  for (const y of [year, year - 1]) {
    const start = birthdayInYear(mmdd, y);
    if (today >= start && today < start + BIRTHDAY_WINDOW_DAYS * DAY_MS) return y;
  }
  return null;
}

// Days from today until the next birthday (0 = today).
export function daysUntilBirthday(mmdd: string, now = Date.now()): number {
  const today = sastToday(now);
  const year = new Date(today).getUTCFullYear();
  let next = birthdayInYear(mmdd, year);
  if (next < today) next = birthdayInYear(mmdd, year + 1);
  return Math.round((next - today) / DAY_MS);
}

export function birthdayFromDate(date: Date): { birthday: string; birthYear: number } {
  const shifted = new Date(date.getTime() + SAST_OFFSET_MS);
  const mm = String(shifted.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(shifted.getUTCDate()).padStart(2, '0');
  return { birthday: `${mm}-${dd}`, birthYear: shifted.getUTCFullYear() };
}
