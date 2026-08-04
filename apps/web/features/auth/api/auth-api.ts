import { apiClient } from "@/lib/api-client";
import {
  ApiResponse,
  ForgotPasswordFormValues,
  ForgotPasswordResponse,
  forgotPasswordResponseSchema,
  GoogleOauthInput,
  OAuthLoginResponse,
  oauthLoginResponseSchema,
  ResendVerificationFormValues,
  ResendVerificationResponse,
  resendVerificationResponseSchema,
  ResetPasswordFormValues,
  ResetPasswordResponse,
  resetPasswordResponseSchema,
  SignInFormValues,
  SignInResponse,
  signInResponseSchema,
  SignUpFormValues,
  SignUpResponse,
  signUpResponseSchema,
  VerifyEmailResponse,
  verifyEmailResponseSchema,
} from "@repo/shared";

export const authApi = {
  signUp: (data: SignUpFormValues): Promise<ApiResponse<SignUpResponse>> => {
    return apiClient.post("/api/auth/sign-up", data, signUpResponseSchema);
  },
  signIn: (data: SignInFormValues): Promise<ApiResponse<SignInResponse>> => {
    return apiClient.post("/api/auth/sign-in", data, signInResponseSchema);
  },
  verifyEmail: (token: string): Promise<ApiResponse<VerifyEmailResponse>> => {
    return apiClient.get(
      `/api/auth/verify-email?token=${encodeURIComponent(token)}`,
      verifyEmailResponseSchema
    );
  },
  resendVerification: (
    data: ResendVerificationFormValues
  ): Promise<ApiResponse<ResendVerificationResponse>> => {
    return apiClient.post(
      "/api/auth/resend-verification",
      data,
      resendVerificationResponseSchema
    );
  },
  googleLogin: (
    data: GoogleOauthInput
  ): Promise<ApiResponse<OAuthLoginResponse>> => {
    return apiClient.post(
      "/api/auth/oauth/google",
      data,
      oauthLoginResponseSchema
    );
  },
  forgotPassword: (
    data: ForgotPasswordFormValues
  ): Promise<ApiResponse<ForgotPasswordResponse>> => {
    return apiClient.post(
      "/api/auth/forgot-password",
      data,
      forgotPasswordResponseSchema
    );
  },
  resetPassword: (
    data: ResetPasswordFormValues
  ): Promise<ApiResponse<ResetPasswordResponse>> => {
    return apiClient.post(
      "/api/auth/reset-password",
      data,
      resetPasswordResponseSchema
    );
  },
};
