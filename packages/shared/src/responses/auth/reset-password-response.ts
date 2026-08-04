import { z } from "zod";

export const resetPasswordResponseSchema = z.object({
  message: z.string(),
});

export type ResetPasswordResponse = z.infer<typeof resetPasswordResponseSchema>;
