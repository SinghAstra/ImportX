import { z } from "zod";

export const sessionUserSchema = z.object({
  id: z.string({ error: "User ID identifier string is required" }),
  email: z.email({ error: "Must be a structurally valid email string" }),
  name: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
});

export type SessionUser = z.infer<typeof sessionUserSchema>;
