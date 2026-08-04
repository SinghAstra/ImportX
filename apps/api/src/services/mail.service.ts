import { logError } from "@repo/shared";
import { env } from "../config/env.js";
import { PRODUCT_NAME } from "../constants/product.js";
import { getResetPasswordMailTemplate } from "../mail/templates/reset-password-mail.js";
import { getVerificationEmailTemplate } from "../mail/templates/verification-mail.js";

interface SendVerificationProps {
  readonly email: string;
  readonly token: string;
}

export const mailService = {
  async sendVerificationEmail({
    email,
    token,
  }: SendVerificationProps): Promise<void> {
    const verificationLink = `${env.FRONTEND_URL}/verify-email?token=${token}`;

    const htmlContent = getVerificationEmailTemplate({
      productName: PRODUCT_NAME,
      verificationLink,
    });

    try {
      const response = await fetch(`${env.FRONTEND_URL}/api/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: email,
          subject: `Verify your email address for ${PRODUCT_NAME}`,
          html: htmlContent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
          `VERCEL_API_EMAIL_FAILURE: ${JSON.stringify(errorData)}`
        );
      }

      console.log(
        `[Vercel Route Sync] Verification link delegated to Next.js successfully for -> ${email}`
      );
    } catch (error) {
      logError(error);
    }
  },

  async sendPasswordResetEmail(params: {
    readonly email: string;
    readonly token: string;
  }): Promise<void> {
    const { email, token } = params;

    const resetLink = `${env.FRONTEND_URL}/reset-password?token=${token}`;

    const htmlContent = getResetPasswordMailTemplate({
      productName: PRODUCT_NAME,
      resetLink,
    });

    try {
      const response = await fetch(`${env.FRONTEND_URL}/api/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: email,
          subject: `Reset your account password for ${PRODUCT_NAME}`,
          html: htmlContent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
          `VERCEL_API_EMAIL_FAILURE: ${JSON.stringify(errorData)}`
        );
      }

      console.log(
        `[Vercel Route Sync] Password reset link delegated to Next.js successfully for -> ${email}`
      );
    } catch (error) {
      logError(error);
    }
  },
};
