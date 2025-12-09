import { logError } from "@/lib/log-error";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/response-utils";
import bcrypt from "bcryptjs";
import { type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("body is ", body);

    const { tokenId, password } = body;

    // Basic validation
    if (!tokenId || !password) {
      return errorResponse("Missing token or password", 400);
    }

    // 1. Find the reset token in the database
    // The Prisma model uses 'code' as the unique identifier for the token string
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: {
        id: tokenId,
      },
    });

    if (!resetToken) {
      return errorResponse("Invalid reset token", 400);
    }

    // 2. Check if the token has expired
    if (new Date() > resetToken.expiresAt) {
      // Cleanup: Delete the expired token to keep DB clean
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      });

      return errorResponse(
        "This reset link has expired. Please request a new one.",
        400
      );
    }

    // 3. Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Atomic Transaction: Update User Password & Delete Used Token
    // We use a transaction to ensure we don't delete the token unless the password update succeeds
    await prisma.$transaction([
      prisma.user.update({
        where: { email: resetToken.email },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      }),
    ]);

    return successResponse("Password reset successfully. You can now log in.");
  } catch (error) {
    logError(error);
    return errorResponse("Failed to reset password. Please try again.", 500);
  }
}
