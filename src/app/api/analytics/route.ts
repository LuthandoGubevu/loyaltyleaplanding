import { ApiError, errorResponse, requireAdminBusiness } from '@/lib/firebase/admin';
import { computeAnalytics } from '@/lib/loyalty/analytics';
import { getBusiness } from '@/lib/loyalty/server';

export async function GET(req: Request) {
  try {
    const user = await requireAdminBusiness(req);
    const { plan } = await getBusiness(user.businessId);
    if (plan.analytics === 'none') {
      throw new ApiError(403, 'Analytics is included in the Growth and Pro plans.');
    }
    return Response.json(await computeAnalytics(user.businessId, plan));
  } catch (error) {
    return errorResponse(error);
  }
}
