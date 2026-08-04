import { z } from "zod";

export const resetPasswordSchema = z
  .object({
    token: z.string({
      error: "Secure verification token is required.",
    }),
    password: z
      .string({ error: "Please enter a new password." })
      .min(8, { message: "Password must be at least 8 characters long." }),
    confirmPassword: z.string({
      error: "Please confirm your new password.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match. Please ensure both fields are identical.",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
