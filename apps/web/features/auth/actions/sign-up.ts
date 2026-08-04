"use server";

import type {
  ApiResponse,
  SignUpFormValues,
  SignUpResponse,
} from "@repo/shared";
import { authApi } from "../api/auth-api";

export async function signUpAction(
  data: SignUpFormValues
): Promise<ApiResponse<SignUpResponse>> {
  return authApi.signUp(data);
}
