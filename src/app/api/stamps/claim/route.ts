import { z } from 'zod';
import { ApiError, adminDb, errorResponse, requireUser } from '@/lib/firebase/admin';
import { addStamp, getActiveRewards, withProgress } from '@/lib/loyalty/server';
import { parseTillPayload } from '@/lib/loyalty/types';
import { normalizeZaPhone } from '@/lib/phone';
import { birthdayFromDate } from '@/lib/birthday';

const bodySchema = z.object({ payload: z.string(), phone: z.string().optional() });

// A customer scans the one-time QR code shown on a store's till screen.
export async function POST(req: Request) {
  try {
    const user = await requireUser(req, ['customer']);
    const body = bodySchema.safeParse(await req.json().catch(() => null));
    if (!body.success) throw new ApiError(400, 'Invalid request.');

    const parsed = parseTillPayload(body.data.payload);
    if (!parsed) throw new ApiError(400, 'This is not a Loyalty Leap till code.');

    // Customers who signed up before phone numbers were required add one on
    // their first scan; it links them to any stamps the till already gave them.
    let phone = user.phone;
    if (!phone) {
      phone = normalizeZaPhone(body.data.phone ?? '');
      if (!phone) {
        return Response.json({ error: 'Add your cellphone number to collect stamps.', needsPhone: true }, { status: 400 });
      }
      await adminDb.collection('users').doc(user.uid).update({ phone });
    }

    const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Customer';
    const profile = (await adminDb.collection('users').doc(user.uid).get()).data();
    const dob: Date | null = profile?.dob?.toDate ? profile.dob.toDate() : null;
    const birthday = dob ? birthdayFromDate(dob) : { birthday: null, birthYear: null };
    const result = await addStamp({
      bid: parsed.businessId,
      phone,
      method: 'qr',
      byUid: user.uid,
      tillCode: parsed.code,
      newMember: { name, uid: user.uid, addedBy: 'app', ...birthday },
      linkUid: user.uid,
    });
    const rewards = await getActiveRewards(parsed.businessId);
    return Response.json({
      businessName: result.businessName,
      member: result.member,
      rewards: withProgress(rewards, result.member.stamps),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
