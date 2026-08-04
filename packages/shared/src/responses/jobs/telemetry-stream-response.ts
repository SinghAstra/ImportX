import { z } from "zod";
import { jobStatusSchema } from "../../schemas/index.js";

export const telemetryEventSchema = z.object({
  repositoryId: z.uuid(),
  status: jobStatusSchema,
  message: z.string(),
  timestamp: z.string(),
});

export type TelemetryEvent = z.infer<typeof telemetryEventSchema>;
