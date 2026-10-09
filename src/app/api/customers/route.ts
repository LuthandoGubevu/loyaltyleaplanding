import { z } from 'zod';
import { ApiError, errorResponse, requireAdminBusiness } from '@/lib/firebase/admin';
import { loadMembers } from '@/lib/loyalty/analytics';
import { addStamp, countActiveRewards, createMember, getBusiness } from '@/lib/loyalty/server';
import { normalizeZaPhone } from '@/lib/phone';

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
        email: m.email,
        hasApp: m.hasApp,
      })),
    });
  } catch (error) {
    return errorResponse(error);
  }
}

const newCustomerSchema = z.object({
  firstName: z.string().trim().min(2).max(60),
  lastName: z.string().trim().min(2).max(60),
  phone: z.string(),
  email: z.string().trim().email().max(120).optional().or(z.literal('')),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')), // from <input type="date">
  marketingOptIn: z.boolean().default(false),
  consent: z.literal(true),
  stampNow: z.boolean().default(false),
});

// A manager adds a customer (e.g. at the counter) before the customer has
// the app. Optionally gives the first stamp for today's purchase.
export async function POST(req: Request) {
  try {
    const user = await requireAdminBusiness(req);
    const body = newCustomerSchema.safeParse(await req.json().catch(() => null));
    if (!body.success) {
      const consentMissing = body.error.issues.some((i) => i.path[0] === 'consent');
      throw new ApiError(400, consentMissing ? 'The customer must agree to join before you add them.' : 'Check the customer details and try again.');
    }
    const phone = normalizeZaPhone(body.data.phone);
    if (!phone) throw new ApiError(400, 'Enter a valid South African cellphone number.');

    let birthday: string | null = null;
    let birthYear: number | null = null;
    if (body.data.dob) {
      const [y, m, d] = body.data.dob.split('-').map(Number);
      const date = new Date(Date.UTC(y, m - 1, d));
      if (date.getUTCMonth() !== m - 1 || y < 1900 || date.getTime() > Date.now()) {
        throw new ApiError(400, 'Enter a valid date of birth.');
      }
      birthday = body.data.dob.slice(5);
      birthYear = y;
    }

    await createMember(user.businessId, {
      firstName: body.data.firstName,
      lastName: body.data.lastName,
      phone,
      email: body.data.email ? body.data.email.toLowerCase() : null,
      birthday,
      birthYear,
      marketingOptIn: body.data.marketingOptIn,
    }, user.uid);

    let stamps = 0;
    if (body.data.stampNow) {
      const result = await addStamp({ bid: user.businessId, phone, method: 'phone', byUid: user.uid });
      stamps = result.member.stamps;
    }
    return Response.json({ phone, stamps });
  } catch (error) {
    return errorResponse(error);
  }
}
