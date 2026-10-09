import { adminDb, errorResponse, requireUser } from '@/lib/firebase/admin';
import { birthdayFromDate } from '@/lib/birthday';
import { linkMemberships } from '@/lib/loyalty/server';

// Connects the signed-in customer's account to the shops that registered
// their cellphone number before they signed up (at the till or by a
// manager). Safe to call repeatedly.
export async function POST(req: Request) {
  try {
    const user = await requireUser(req, ['customer']);
    if (!user.phone) return Response.json({ linked: [], newlyLinked: [] });
    const profile = (await adminDb.collection('users').doc(user.uid).get()).data();
    const dob: Date | null = profile?.dob?.toDate ? profile.dob.toDate() : null;
    return Response.json(await linkMemberships(user.uid, user.phone, dob ? birthdayFromDate(dob) : null));
  } catch (error) {
    return errorResponse(error);
  }
}
