import { z } from "zod";

/**
 * 1. Base configuration fields used by everything
 */
const baseSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

/**
 * 3. API Schema
 */
export const apiEnvSchema = baseSchema.extend({
  PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default(5001),
  FRONTEND_URL: z.url("FRONTEND_URL must be a valid absolute URI"),
  REDIS_URL: z.url("REDIS_URL is required for queues"),
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters long"),
  SMTP_HOST: z.string().default("smtp.gmail.com"),
  SMTP_PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default(587),
  SMTP_SECURE: z.enum(["true", "false"]).default("false"),
  SMTP_USER: z
    .string()
    .min(1, "SMTP_USER credential authentication token is required"),
  SMTP_PASS: z
    .string()
    .min(1, "SMTP_PASS credential authentication token is required"),
  SMTP_FROM_EMAIL: z
    .email("SMTP_FROM_EMAIL must be a valid email structure")
    .optional(),
});

/**
 * 4. Worker Schema
 */
export const workerEnvSchema = baseSchema.extend({
  REDIS_URL: z.url("REDIS_URL is required for worker operations"),
  GROQ_API_KEYS: z
    .string()
    .min(1, "GROQ_API_KEYS is required for AI summarization tasks"),
});

/**
 * 5. Web Schema
 */
export const webEnvSchema = baseSchema.extend({
  NEXT_PUBLIC_API_URL: z.url({
    error: "NEXT_PUBLIC_API_URL must be a valid absolute URI",
  }),
  NEXTAUTH_SECRET: z
    .string()
    .min(32, "NEXTAUTH_SECRET must be at least 32 characters long"),
  NEXTAUTH_URL: z.url("NEXTAUTH_URL must be a valid absolute URI"),
  GOOGLE_CLIENT_ID: z.string().min(1, "Google Client ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "Google Client Secret is required"),
  SMTP_USER: z.email("SMTP_USER must be a valid email account"),
  SMTP_PASS: z.string().min(1, "SMTP_PASS app credential token is required"),
});

// --- Validation Core Processing Engine ---

function validate<T>(
  schema: z.Schema<T>,
  envData: unknown,
  appName: string
): T {
  const result = schema.safeParse(envData);

  if (!result.success) {
    console.error(
      `\n❌ [${appName.toUpperCase()}] CRITICAL: Invalid environment configuration:`
    );

    const formattedErrors = result.error.format();

    for (const [key, value] of Object.entries(formattedErrors)) {
      if (key !== "_errors" && value && "_errors" in value) {
        console.error(`   👉 ${key}: ${value._errors.join(", ")}`);
      }
    }

    console.error("\nApplication startup aborted.\n");

    process.exit(1);
  }

  return result.data;
}

export function validateApiEnv(): z.infer<typeof apiEnvSchema> {
  return validate(apiEnvSchema, process.env, "api");
}

export function validateWorkerEnv(): z.infer<typeof workerEnvSchema> {
  return validate(workerEnvSchema, process.env, "worker");
}

export function validateWebEnv(): z.infer<typeof webEnvSchema> {
  return validate(webEnvSchema, process.env, "web");
}
