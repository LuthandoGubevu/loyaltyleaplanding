import { errorResponse, requireUser } from '@/lib/firebase/admin';
import { getCustomerStores } from '@/lib/loyalty/customer';

// The shops this customer collects stamps at, with their progress.
export async function GET(req: Request) {
  try {
    const user = await requireUser(req, ['customer']);
    return Response.json({ phone: user.phone, stores: await getCustomerStores(user.uid, user.phone) });
  } catch (error) {
    return errorResponse(error);
  }
}
