import { z } from "zod";
import { jobStatusSchema } from "../../schemas";

export const logItemSchema = z.object({
  id: z.uuid(),
  jobId: z.uuid(),
  message: z.string(),
  createdAt: z.string(),
});

export type LogItem = z.infer<typeof logItemSchema>;

export const getJobLogsResponseSchema = z.object({
  status: jobStatusSchema,
  logs: z.array(logItemSchema),
});

export type GetJobLogsResponse = z.infer<typeof getJobLogsResponseSchema>;
