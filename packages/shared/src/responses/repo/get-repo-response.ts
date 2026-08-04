import z from "zod";
import { repositoryDataSchema } from "../../schemas";

export const getRepositoryResponseSchema = repositoryDataSchema.extend({
  latestJobId: z.uuid().nullable(),
});

export type GetRepositoryResponse = z.infer<typeof getRepositoryResponseSchema>;
