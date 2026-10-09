import { errorResponse, requireAdminBusiness } from '@/lib/firebase/admin';
import { loadMembers } from '@/lib/loyalty/analytics';
import { countActiveRewards, getBusiness } from '@/lib/loyalty/server';

// The business's member list plus plan usage. Available on every plan.
export async function GET(req: Request) {
  try {
    const user = await requireAdminBusiness(req);
    const [{ plan }, members, activeRewards] = await Promise.all([
      getBusiness(user.businessId),
      loadMembers(user.businessId),
      countActiveRewards(user.businessId),
    ]);
    members.sort((a, b) => (b.lastStampAt ?? 0) - (a.lastStampAt ?? 0));
    return Response.json({
      plan,
      usage: {
        members: members.length,
        maxMembers: plan.maxMembers,
        activeRewards,
        maxActiveRewards: plan.maxActiveRewards,
      },
      members: members.map((m) => ({
        name: m.name,
        phone: m.phone,
        stamps: m.stamps,
        lifetimeStamps: m.lifetimeStamps,
        joined: m.createdAt,
        lastVisit: m.lastStampAt,
        birthday: m.birthday,
      })),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
