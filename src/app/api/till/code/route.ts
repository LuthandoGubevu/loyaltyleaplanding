import { errorResponse, requireAdminBusiness } from '@/lib/firebase/admin';
import { createTillCode } from '@/lib/loyalty/server';

// Creates a one-time QR code for the till screen.
export async function POST(req: Request) {
  try {
    const user = await requireAdminBusiness(req);
    const result = await createTillCode(user.businessId, user.uid);
    return Response.json({ ...result, businessId: user.businessId });
  } catch (error) {
    return errorResponse(error);
  }
}
