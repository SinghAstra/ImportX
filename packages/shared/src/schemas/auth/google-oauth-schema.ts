import { z } from "zod";

export const googleOauthSchema = z.object({
  email: z
    .string()
    .email({ error: "Invalid Google account email address structure" }),
  name: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
});

export type GoogleOauthInput = z.infer<typeof googleOauthSchema>;
