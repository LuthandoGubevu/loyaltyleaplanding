import { z } from 'zod';

export const rewardSchema = z.object({
  name: z.string().trim().min(2).max(80),
  stampsRequired: z.number().int().min(1).max(100),
  costRand: z.number().min(0).max(100000).nullable(),
  active: z.boolean(),
});
