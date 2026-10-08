import { ApiError, errorResponse, requireAdminBusiness } from '@/lib/firebase/admin';
import { getActiveRewards, getMember, withProgress } from '@/lib/loyalty/server';
import { normalizeZaPhone } from '@/lib/phone';

// Looks up a customer at the till by cellphone number.
export async function GET(req: Request) {
  try {
    const user = await requireAdminBusiness(req);
    const phone = normalizeZaPhone(new URL(req.url).searchParams.get('phone') ?? '');
    if (!phone) throw new ApiError(400, 'Enter a valid South African cellphone number.');

    const [member, rewards] = await Promise.all([
      getMember(user.businessId, phone),
      getActiveRewards(user.businessId),
    ]);
    return Response.json({
      phone,
      member,
      rewards: withProgress(rewards, member?.stamps ?? 0),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
