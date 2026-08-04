"use server";

import type {
  ApiResponse,
  ResendVerificationFormValues,
  ResendVerificationResponse,
} from "@repo/shared";
import { authApi } from "../api/auth-api";

export async function resendVerificationAction(
  data: ResendVerificationFormValues
): Promise<ApiResponse<ResendVerificationResponse>> {
  return authApi.resendVerification(data);
}
