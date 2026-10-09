import { errorResponse, requireUser } from '@/lib/firebase/admin';
import { getShops } from '@/lib/loyalty/customer';

// Active Loyalty Leap shops, marking the ones this customer has joined.
export async function GET(req: Request) {
  try {
    const user = await requireUser(req, ['customer']);
    return Response.json({ shops: await getShops(user.uid, user.phone) });
  } catch (error) {
    return errorResponse(error);
  }
}
