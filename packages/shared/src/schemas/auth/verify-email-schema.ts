import { z } from "zod";

export const verifyEmailSchema = z.object({
  token: z
    .string()
    .min(1, { message: "Verification token parameter is required" }),
});

export type VerifyEmailFormValues = z.infer<typeof verifyEmailSchema>;
