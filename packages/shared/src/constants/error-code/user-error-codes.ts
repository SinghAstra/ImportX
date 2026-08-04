export const USER_ERROR_CODES = {
  USER_NOT_FOUND: "USER_NOT_FOUND",
  PROFILE_UPDATE_FAILED: "PROFILE_UPDATE_FAILED",
} as const;

export type UserErrorCode = keyof typeof USER_ERROR_CODES;
