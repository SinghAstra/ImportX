"use server";

import type {
  ApiResponse,
  ResetPasswordFormValues,
  ResetPasswordResponse,
} from "@repo/shared";
import { authApi } from "../api/auth-api";

export async function resetPasswordAction(
  data: ResetPasswordFormValues
): Promise<ApiResponse<ResetPasswordResponse>> {
  return authApi.resetPassword(data);
}
