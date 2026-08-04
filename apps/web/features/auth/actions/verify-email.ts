"use server";

import type { ApiResponse, VerifyEmailResponse } from "@repo/shared";
import { authApi } from "../api/auth-api";

export async function verifyEmailAction(
  token: string
): Promise<ApiResponse<VerifyEmailResponse>> {
  return authApi.verifyEmail(token);
}
