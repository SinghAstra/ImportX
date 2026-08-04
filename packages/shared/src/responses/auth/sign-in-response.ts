import { z } from "zod";
import { sessionUserSchema } from "./session-user.js";

export const signInResponseSchema = z.object({
  message: z.string(),
  accessToken: z.string({
    error: "Access token cryptographic string is required",
  }),
  user: sessionUserSchema,
});

export type SignInResponse = z.infer<typeof signInResponseSchema>;
