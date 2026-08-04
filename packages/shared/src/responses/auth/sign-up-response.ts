import { z } from "zod";

export const signUpResponseSchema = z.object({
  message: z.string(),
  expiresAt: z.string(),
});

export type SignUpResponse = z.infer<typeof signUpResponseSchema>;
