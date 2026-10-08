import { z } from 'zod';
import { ApiError, errorResponse, requireAdminBusiness } from '@/lib/firebase/admin';
import { getActiveRewards, redeemReward, withProgress } from '@/lib/loyalty/server';
import { normalizeZaPhone } from '@/lib/phone';

const bodySchema = z.object({ phone: z.string(), rewardId: z.string().min(1) });

export async function POST(req: Request) {
  try {
    const user = await requireAdminBusiness(req);
    const body = bodySchema.safeParse(await req.json().catch(() => null));
    if (!body.success) throw new ApiError(400, 'Invalid request.');

    const phone = normalizeZaPhone(body.data.phone);
    if (!phone) throw new ApiError(400, 'Enter a valid South African cellphone number.');

    const result = await redeemReward(user.businessId, phone, body.data.rewardId, user.uid);
    const rewards = await getActiveRewards(user.businessId);
    return Response.json({ ...result, rewards: withProgress(rewards, result.member.stamps) });
  } catch (error) {
    return errorResponse(error);
  }
}
