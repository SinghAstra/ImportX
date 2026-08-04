import { z } from "zod";
import { repositoryTreeNodeSchema } from "../../schemas";

export const getRepositoryFilesResponseSchema = z.array(
  repositoryTreeNodeSchema
);

export type GetRepositoryFilesResponse = z.infer<
  typeof getRepositoryFilesResponseSchema
>;
