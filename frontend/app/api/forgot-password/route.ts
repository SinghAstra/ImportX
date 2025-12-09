import { siteConfig } from "@/config/site";
import {
  generateResetCode,
  getExpirationTime,
} from "@/lib/generate-reset-code";
import { logError } from "@/lib/log-error";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/response-utils";
import { transporter } from "@/lib/transporter";
import { type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return errorResponse("Email is required", 400);
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return successResponse(
        "If an account exists with this email, a reset code has been sent."
      );
    }

    const resetCode = generateResetCode();
    const expiresAt = getExpirationTime();

    await prisma.passwordResetToken.deleteMany({
      where: { email },
    });

    await prisma.passwordResetToken.create({
      data: {
        email,
        code: resetCode,
        expiresAt,
      },
    });

    await transporter.sendMail({
      from: `${siteConfig.name} <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Your Password Reset Code",
      html: `
        <h2>Password Reset Code</h2>
        <p>You requested a password reset. Use the code below to reset your password:</p>
        <h1 style="color: #007bff; font-size: 32px; letter-spacing: 4px;">${resetCode}</h1>
        <p>This code expires in 10 minutes.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
    });

    return successResponse(
      "Reset code has been sent to your email. Please check your inbox."
    );
  } catch (error) {
    logError(error);
    return errorResponse("An error occurred. Please try again later.", 500);
  }
}
