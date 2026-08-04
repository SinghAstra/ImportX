import { z } from "zod";

export const forgotPasswordResponseSchema = z.object({
  message: z.string(),
});

export type ForgotPasswordResponse = z.infer<
  typeof forgotPasswordResponseSchema
>;
