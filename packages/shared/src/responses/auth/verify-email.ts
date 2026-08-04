import { z } from "zod";

export const verifyEmailResponseSchema = z.object({
  message: z.string(),
  userId: z.string({
    error: "userId must be a valid database identifier string",
  }),
  verifiedAt: z.iso.datetime({
    error: "verifiedAt must be a valid ISO 8601 timestamp string",
  }),
});

export type VerifyEmailResponse = z.infer<typeof verifyEmailResponseSchema>;
