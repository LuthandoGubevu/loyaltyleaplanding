// South African cellphone numbers, normalised to international digits
// without the plus sign (e.g. "082 123 4567" -> "27821234567"), so the same
// number always maps to the same member record.
export function normalizeZaPhone(input: string): string | null {
  const digits = input.replace(/[^\d]/g, '');
  let national: string;
  if (digits.startsWith('27') && digits.length === 11) {
    national = digits.slice(2);
  } else if (digits.startsWith('0') && digits.length === 10) {
    national = digits.slice(1);
  } else {
    return null;
  }
  if (!/^[6-8]\d{8}$/.test(national)) return null;
  return `27${national}`;
}

export function formatZaPhone(normalized: string): string {
  const national = `0${normalized.slice(2)}`;
  return `${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6)}`;
}
