export type Role = 'staff' | 'admin' | 'customer';

// Platform staff (super-admin) access is restricted to these two accounts.
// Role resolution self-heals to 'staff' for these emails regardless of what
// is stored in Firestore, so no manual database edits are ever required.
const STAFF_EMAILS = ['timlasive@gmail.com', 'lgubevu@gmail.com'];

export function isStaffEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return STAFF_EMAILS.includes(email.toLowerCase());
}
