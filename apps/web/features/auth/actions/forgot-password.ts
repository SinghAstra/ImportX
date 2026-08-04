"use server";

import type {
  ApiResponse,
  ForgotPasswordFormValues,
  ForgotPasswordResponse,
} from "@repo/shared";
import { authApi } from "../api/auth-api";

export async function forgotPasswordAction(
  data: ForgotPasswordFormValues
): Promise<ApiResponse<ForgotPasswordResponse>> {
  return authApi.forgotPassword(data);
}
