import { z } from 'zod';
import { ApiError, errorResponse, requireAdminBusiness } from '@/lib/firebase/admin';
import { getActiveRewards, redeemBirthdayReward, redeemReward, withProgress } from '@/lib/loyalty/server';
import { normalizeZaPhone } from '@/lib/phone';

// Either a stamp reward (rewardId) or this year's birthday reward (birthday: true).
const bodySchema = z.union([
  z.object({ phone: z.string(), rewardId: z.string().min(1) }),
  z.object({ phone: z.string(), birthday: z.literal(true) }),
]);

export async function POST(req: Request) {
  try {
    const user = await requireAdminBusiness(req);
    const body = bodySchema.safeParse(await req.json().catch(() => null));
    if (!body.success) throw new ApiError(400, 'Invalid request.');

    const phone = normalizeZaPhone(body.data.phone);
    if (!phone) throw new ApiError(400, 'Enter a valid South African cellphone number.');

    const result = 'rewardId' in body.data
      ? await redeemReward(user.businessId, phone, body.data.rewardId, user.uid)
      : await redeemBirthdayReward(user.businessId, phone, user.uid);
    const rewards = await getActiveRewards(user.businessId);
    return Response.json({ ...result, rewards: withProgress(rewards, result.member.stamps) });
  } catch (error) {
    return errorResponse(error);
  }
}
