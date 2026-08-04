import z from "zod";

export const resyncRepoResponseSchema = z.object({
  jobId: z.uuid(),
});

export type ResyncRepoResponse = z.infer<typeof resyncRepoResponseSchema>;
