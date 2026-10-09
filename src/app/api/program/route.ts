import { z } from 'zod';
import { ApiError, errorResponse, requireAdminBusiness } from '@/lib/firebase/admin';
import { getBusiness, updateProgram } from '@/lib/loyalty/server';

const programSchema = z.object({
  earnRule: z.string().trim().min(3).max(120),
  minSpend: z.number().min(0).nullable(),
  cooldownHours: z.number().min(0).max(168),
  birthdayReward: z.object({
    enabled: z.boolean(),
    name: z.string().trim().min(2).max(80),
    costRand: z.number().min(0).max(100000).nullable(),
  }),
});

export async function GET(req: Request) {
  try {
    const user = await requireAdminBusiness(req);
    const { program, plan } = await getBusiness(user.businessId);
    return Response.json({ program, plan });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireAdminBusiness(req);
    const body = programSchema.safeParse(await req.json().catch(() => null));
    if (!body.success) throw new ApiError(400, 'Check the programme rules and try again.');
    await updateProgram(user.businessId, body.data);
    return Response.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
