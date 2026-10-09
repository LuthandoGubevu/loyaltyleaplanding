import { ApiError, errorResponse, requireAdminBusiness } from '@/lib/firebase/admin';
import { updateReward } from '@/lib/loyalty/server';
import { rewardSchema } from '@/lib/loyalty/schemas';

export async function PATCH(req: Request, { params }: { params: Promise<{ rewardId: string }> }) {
  try {
    const user = await requireAdminBusiness(req);
    const body = rewardSchema.partial().safeParse(await req.json().catch(() => null));
    if (!body.success) throw new ApiError(400, 'Check the reward details and try again.');
    const { rewardId } = await params;
    await updateReward(user.businessId, rewardId, body.data);
    return Response.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
