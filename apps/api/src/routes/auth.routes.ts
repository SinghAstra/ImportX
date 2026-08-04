import {
  forgotPasswordSchema,
  googleOauthSchema,
  resendVerificationSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  verifyEmailSchema,
} from "@repo/shared";
import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import {
  validateBody,
  validateQuery,
} from "../middlewares/validation.middleware.js";

export const authRouter: Router = Router();

authRouter.post("/sign-up", validateBody(signUpSchema), authController.signUp);

authRouter.get(
  "/verify-email",
  validateQuery(verifyEmailSchema),
  authController.verifyEmail
);

authRouter.post(
  "/resend-verification",
  validateBody(resendVerificationSchema),
  authController.resendVerification
);

authRouter.post("/sign-in", validateBody(signInSchema), authController.signIn);

authRouter.post(
  "/oauth/google",
  validateBody(googleOauthSchema),
  authController.oauthGoogle
);

authRouter.post(
  "/forgot-password",
  validateBody(forgotPasswordSchema),
  authController.forgotPassword
);

authRouter.post(
  "/reset-password",
  validateBody(resetPasswordSchema),
  authController.resetPassword
);
