import { z } from "zod";

export const JOB_STATUS = {
  PENDING: "PENDING",
  RUNNING: "RUNNING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
} as const;

export const jobStatusSchema = z.enum([
  JOB_STATUS.PENDING,
  JOB_STATUS.RUNNING,
  JOB_STATUS.COMPLETED,
  JOB_STATUS.FAILED,
  JOB_STATUS.CANCELLED,
]);

export const repoIngestionJobDataSchema = z.object({
  jobId: z.uuid(),
  repositoryId: z.uuid(),
});

export const fileSummarizationJobDataSchema = z.object({
  fileId: z.uuid(),
  repositoryId: z.uuid(),
  jobId: z.uuid(),
  runId: z.number().int().nonnegative(),
});

export type JobStatus = z.infer<typeof jobStatusSchema>;

export type RepoIngestionJobData = z.infer<typeof repoIngestionJobDataSchema>;

export type FileSummarizationJobData = z.infer<
  typeof fileSummarizationJobDataSchema
>;
