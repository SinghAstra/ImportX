import { z } from "zod";

export const resendVerificationResponseSchema = z.object({
  message: z.string(),
});

export type ResendVerificationResponse = z.infer<
  typeof resendVerificationResponseSchema
>;
