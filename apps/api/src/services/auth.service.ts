import { prisma } from "@repo/db";
import {
  AUTH_ERROR_CODES,
  type ForgotPasswordFormValues,
  type ForgotPasswordResponse,
  type GoogleOauthInput,
  type OAuthLoginResponse,
  type ResendVerificationFormValues,
  type ResetPasswordFormValues,
  type ResetPasswordResponse,
  type SignInFormValues,
  type SignInResponse,
  type SignUpFormValues,
  type SignUpResponse,
  type VerifyEmailResponse,
} from "@repo/shared";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import {
  AppError,
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../errors/api-errors.js";
import { jwtTokenEngine } from "../lib/jwt.js";
import { mailService } from "./mail.service.js";

export const authService = {
  async signUpUser(
    signUpFormValues: SignUpFormValues
  ): Promise<SignUpResponse> {
    const { email, password } = signUpFormValues;

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      throw new ConflictError(
        AUTH_ERROR_CODES.EMAIL_ALREADY_EXISTS,
        "Email already registered."
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const transactionResult = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { email, passwordHash: hashedPassword },
      });

      const token = crypto.randomUUID();

      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await tx.verificationToken.create({
        data: { identifier: email, token, expires: expiresAt },
      });

      return { user, token, expiresAt };
    });

    await mailService.sendVerificationEmail({
      email: transactionResult.user.email,
      token: transactionResult.token,
    });

    return {
      message: "Account created! Check your inbox to verify.",
      expiresAt: transactionResult.expiresAt.toISOString(),
    };
  },

  async verifyEmailToken(token: string): Promise<VerifyEmailResponse> {
    const verificationRecord = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationRecord) {
      throw new AppError(
        404,
        AUTH_ERROR_CODES.TOKEN_NOT_FOUND,
        "Invalid or used verification link."
      );
    }

    if (verificationRecord.expires < new Date()) {
      await prisma.verificationToken.deleteMany({ where: { token } });

      throw new AppError(
        400,
        AUTH_ERROR_CODES.TOKEN_EXPIRED,
        "Verification link expired."
      );
    }

    const validatedUserInstance = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { email: verificationRecord.identifier },
        data: { emailVerified: new Date() },
      });

      await tx.verificationToken.deleteMany({
        where: { identifier: verificationRecord.identifier },
      });

      return user;
    });

    return {
      message: "Email verified! You can now log in.",
      userId: validatedUserInstance.id,
      verifiedAt: validatedUserInstance.emailVerified!.toISOString(),
    };
  },

  async resendVerificationToken(
    params: ResendVerificationFormValues
  ): Promise<{ message: string }> {
    const { email } = params;

    const user = await prisma.user.findUnique({ where: { email } });

    const secureSuccessResponse = { message: "Verification link sent." };

    if (!user) return secureSuccessResponse;

    if (user.emailVerified) {
      throw new ConflictError(
        AUTH_ERROR_CODES.EMAIL_ALREADY_VERIFIED,
        "Email already verified."
      );
    }

    const token = crypto.randomUUID();

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.$transaction(async (tx) => {
      await tx.verificationToken.deleteMany({ where: { identifier: email } });

      await tx.verificationToken.create({
        data: { identifier: email, token, expires: expiresAt },
      });
    });

    await mailService.sendVerificationEmail({ email, token });

    return secureSuccessResponse;
  },

  async signInUser(credentials: SignInFormValues): Promise<SignInResponse> {
    const { email, password } = credentials;

    const user = await prisma.user.findUnique({ where: { email } });

    const invalidCredentialsError = new AppError(
      401,
      AUTH_ERROR_CODES.INVALID_CREDENTIALS,
      "Invalid email or password."
    );

    if (!user || !user.passwordHash) throw invalidCredentialsError;

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) throw invalidCredentialsError;

    if (!user.emailVerified) {
      throw new AppError(
        403,
        AUTH_ERROR_CODES.EMAIL_NOT_VERIFIED,
        "Please verify your email first."
      );
    }

    const accessToken = jwtTokenEngine.generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    return {
      message: "Welcome back!",
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        image: user.image || undefined,
      },
    };
  },

  async oauthGoogleLogin(
    payload: GoogleOauthInput
  ): Promise<OAuthLoginResponse> {
    const { email, name, image } = payload;

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: { email, name, image, emailVerified: new Date() },
      });
    } else if (!user.name || !user.image) {
      user = await prisma.user.update({
        where: { email },
        data: { name: user.name || name, image: user.image || image },
      });
    }

    const accessToken = jwtTokenEngine.generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    return {
      message: "Signed in with Google.",
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      },
    };
  },

  async requestPasswordReset(
    payload: ForgotPasswordFormValues
  ): Promise<ForgotPasswordResponse> {
    const { email } = payload;

    const genericSuccessResponse = { message: "Password reset link sent." };

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return genericSuccessResponse;

    if (!user.passwordHash) {
      throw new AppError(
        400,
        AUTH_ERROR_CODES.PASSWORD_RESET_NOT_ALLOWED,
        "Please sign in with Google."
      );
    }

    const token = crypto.randomUUID();

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.$transaction(async (tx) => {
      await tx.passwordResetToken.deleteMany({ where: { identifier: email } });

      await tx.passwordResetToken.create({
        data: { identifier: email, token, expires: expiresAt },
      });
    });

    await mailService.sendPasswordResetEmail({ email, token });

    return genericSuccessResponse;
  },

  async resetPassword(
    payload: ResetPasswordFormValues
  ): Promise<ResetPasswordResponse> {
    const { token, password } = payload;

    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetRecord) {
      throw new NotFoundError(
        AUTH_ERROR_CODES.PASSWORD_RESET_TOKEN_NOT_FOUND,
        "Invalid or used reset link."
      );
    }

    if (resetRecord.expires < new Date()) {
      await prisma.passwordResetToken.deleteMany({ where: { token } });

      throw new BadRequestError(
        AUTH_ERROR_CODES.PASSWORD_RESET_TOKEN_EXPIRED,
        "Reset link expired."
      );
    }

    const newHashedPassword = await bcrypt.hash(password, 10);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { email: resetRecord.identifier },
        data: { passwordHash: newHashedPassword },
      });

      await tx.passwordResetToken.deleteMany({
        where: { identifier: resetRecord.identifier },
      });
    });

    return { message: "Password updated!" };
  },
};
