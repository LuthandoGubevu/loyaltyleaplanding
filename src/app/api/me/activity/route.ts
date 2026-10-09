import { errorResponse, requireUser } from '@/lib/firebase/admin';
import { getCustomerActivity } from '@/lib/loyalty/customer';

// This customer's stamps and redemptions, optionally for one shop.
export async function GET(req: Request) {
  try {
    const user = await requireUser(req, ['customer']);
    const businessId = new URL(req.url).searchParams.get('businessId') ?? undefined;
    return Response.json({ activity: await getCustomerActivity(user.uid, user.phone, businessId) });
  } catch (error) {
    return errorResponse(error);
  }
}
