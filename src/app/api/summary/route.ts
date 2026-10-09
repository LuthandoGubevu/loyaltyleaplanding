import { errorResponse, requireAdminBusiness } from '@/lib/firebase/admin';
import { computeSummary } from '@/lib/loyalty/analytics';
import { getBusiness } from '@/lib/loyalty/server';

// Dashboard headline numbers, available on every plan.
export async function GET(req: Request) {
  try {
    const user = await requireAdminBusiness(req);
    const [{ plan }, summary] = await Promise.all([getBusiness(user.businessId), computeSummary(user.businessId)]);
    return Response.json({ plan, ...summary });
  } catch (error) {
    return errorResponse(error);
  }
}
