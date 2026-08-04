import { z } from "zod";

export const REPOSITORY_STATUS = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
} as const;

export const FILE_SUMMARY_STATUS = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  RETRYING: "RETRYING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
} as const;

export const repositoryStatusSchema = z.enum([
  REPOSITORY_STATUS.PENDING,
  REPOSITORY_STATUS.PROCESSING,
  REPOSITORY_STATUS.COMPLETED,
  REPOSITORY_STATUS.FAILED,
]);

export const fileSummaryStatusSchema = z.enum([
  FILE_SUMMARY_STATUS.PENDING,
  FILE_SUMMARY_STATUS.PROCESSING,
  FILE_SUMMARY_STATUS.RETRYING,
  FILE_SUMMARY_STATUS.COMPLETED,
  FILE_SUMMARY_STATUS.FAILED,
]);

export const repositoryDataSchema = z.object({
  id: z.uuid(),
  userId: z.string(),
  githubUrl: z.url(),
  name: z.string(),
  owner: z.string(),
  avatar: z.url(),
  status: repositoryStatusSchema,
  readme: z.string().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const repositoryFileDataSchema = z.object({
  id: z.uuid(),
  repositoryId: z.uuid(),
  relativePath: z.string(),
  extension: z.string(),
  size: z.number().int().nonnegative(),
  hash: z.string(),
  summaryStatus: fileSummaryStatusSchema,
  summary: z.string().nullable(),
  retryCount: z.number().int().nonnegative(),
  lastError: z.string().nullable(),
  completedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
});

export interface RepositoryTreeNode {
  name: string;
  relativePath: string;
  type: "file" | "folder";
  fileId?: string;
  extension?: string;
  size?: number;
  summaryStatus?: z.infer<typeof fileSummaryStatusSchema>;
  summary?: string | null;
  children: RepositoryTreeNode[];
}

export const repositoryTreeNodeSchema: z.ZodType<RepositoryTreeNode> = z.lazy(
  () =>
    z.object({
      name: z.string(),
      relativePath: z.string(),
      type: z.enum(["file", "folder"]),
      fileId: z.uuid().optional(),
      extension: z.string().optional(),
      size: z.number().int().nonnegative().optional(),
      summaryStatus: fileSummaryStatusSchema.optional(),
      summary: z.string().nullable().optional(),
      children: z.array(repositoryTreeNodeSchema),
    })
);

export type RepositoryStatus = z.infer<typeof repositoryStatusSchema>;

export type FileSummaryStatus = z.infer<typeof fileSummaryStatusSchema>;

export type RepositoryFileData = z.infer<typeof repositoryFileDataSchema>;

const GITHUB_URL_REGEX =
  /^https?:\/\/(?:www\.)?github\.com\/([^/]+)\/([^/.]+)(?:\.git)?\/?$/;

export const ingestRepoSchema = z.object({
  githubUrl: z
    .string()
    .min(1, "GitHub repository link is required.")
    .url("Please provide a valid absolute web URL.")
    .regex(
      GITHUB_URL_REGEX,
      "Input must follow a standard public GitHub URL structure (e.g., https://github.com/owner/repo)."
    ),
});

export type IngestRepoInput = z.infer<typeof ingestRepoSchema>;

export function parseGitHubUrl(url: string): { owner: string; name: string } {
  const match = url.match(GITHUB_URL_REGEX);

  if (!match || !match[1] || !match[2]) {
    throw new Error(
      "INVALID_GITHUB_SIGNATURE: Failed to extract structural parameters."
    );
  }

  return { owner: match[1], name: match[2] };
}

export const deleteRepoInputSchema = z.object({
  id: z.uuid("Invalid repository identification format"),
});

export const deleteMultipleReposInputSchema = z.object({
  ids: z
    .array(z.uuid("Invalid repository identification format"))
    .min(1, "You must select at least one repository to delete"),
});

export type DeleteRepoInput = z.infer<typeof deleteRepoInputSchema>;

export type DeleteMultipleReposInput = z.infer<
  typeof deleteMultipleReposInputSchema
>;
