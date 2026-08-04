import z from "zod";

export const deleteRepoResponseSchema = z.object({
  message: z.string(),
});

export type DeleteRepoResponse = z.infer<typeof deleteRepoResponseSchema>;
