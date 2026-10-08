import { z } from 'zod';
import { ApiError, errorResponse, requireAdminBusiness } from '@/lib/firebase/admin';
import { addStamp, getActiveRewards, withProgress } from '@/lib/loyalty/server';
import { normalizeZaPhone } from '@/lib/phone';

const bodySchema = z.object({
  phone: z.string(),
  name: z.string().trim().min(2).max(80).optional(),
  consent: z.boolean().optional(),
});

// Adds a stamp for a customer identified by cellphone number, creating them
// on their first visit (name + consent required).
export async function POST(req: Request) {
  try {
    const user = await requireAdminBusiness(req);
    const body = bodySchema.safeParse(await req.json().catch(() => null));
    if (!body.success) throw new ApiError(400, 'Invalid request.');

    const phone = normalizeZaPhone(body.data.phone);
    if (!phone) throw new ApiError(400, 'Enter a valid South African cellphone number.');
    if (body.data.name && !body.data.consent) {
      throw new ApiError(400, 'The customer must agree to join before you add them.');
    }

    const result = await addStamp({
      bid: user.businessId,
      phone,
      method: 'phone',
      byUid: user.uid,
      newMember: body.data.name ? { name: body.data.name, uid: null, addedBy: 'till' } : undefined,
    });
    const rewards = await getActiveRewards(user.businessId);
    return Response.json({ member: result.member, rewards: withProgress(rewards, result.member.stamps) });
  } catch (error) {
    return errorResponse(error);
  }
}
