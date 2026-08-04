import { z } from "zod";

export const resendVerificationSchema = z.object({
  email: z.email({ message: "Please enter a valid email address" }),
});

export type ResendVerificationFormValues = z.infer<
  typeof resendVerificationSchema
>;
