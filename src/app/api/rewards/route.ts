import { ApiError, errorResponse, requireAdminBusiness } from '@/lib/firebase/admin';
import { createReward, getAllRewards } from '@/lib/loyalty/server';
import { rewardSchema } from '@/lib/loyalty/schemas';


export async function GET(req: Request) {
  try {
    const user = await requireAdminBusiness(req);
    return Response.json({ rewards: await getAllRewards(user.businessId) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAdminBusiness(req);
    const body = rewardSchema.safeParse(await req.json().catch(() => null));
    if (!body.success) throw new ApiError(400, 'Check the reward details and try again.');
    const id = await createReward(user.businessId, body.data);
    return Response.json({ id });
  } catch (error) {
    return errorResponse(error);
  }
}
