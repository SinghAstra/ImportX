import { z } from "zod";
import { AUTH_ERROR_CODES } from "../constants/error-code/auth-error-codes.js";
import { COMMON_ERROR_CODES } from "../constants/error-code/common-error-codes.js";
import { USER_ERROR_CODES } from "../constants/error-code/user-error-codes.js";
import { REPO_ERROR_CODES } from "../constants/index.js";

const ALL_ERROR_CODES = [
  ...Object.values(AUTH_ERROR_CODES),
  ...Object.values(COMMON_ERROR_CODES),
  ...Object.values(USER_ERROR_CODES),
  ...Object.values(REPO_ERROR_CODES),
] as [string, ...string[]];

export const errorCodeSchema = z.enum(ALL_ERROR_CODES);

export type ErrorCode = z.infer<typeof errorCodeSchema>;

export const apiErrorSchema = z.object({
  code: errorCodeSchema,
  message: z.string(),
});

export type ApiError = z.infer<typeof apiErrorSchema>;

export function createApiResponseSchema<T extends z.ZodTypeAny>(
  payloadSchema: T
) {
  return z.discriminatedUnion("success", [
    z.object({
      success: z.literal(true),
      data: payloadSchema,
    }),
    z.object({
      success: z.literal(false),
      error: apiErrorSchema,
    }),
  ]);
}

export type ApiResponse<T> =
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: ApiError };
