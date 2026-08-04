import { z } from "zod";

export const boostRepoResponseSchema = z.object({
  jobId: z.string().uuid(),
});

export type BoostRepoResponse = z.infer<typeof boostRepoResponseSchema>;
