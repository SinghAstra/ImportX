import { logError } from "@/lib/log-error";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/response-utils";
import { verifyResetCodeSchema } from "@/schema/auth";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult = verifyResetCodeSchema.safeParse(body);

    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues[0].message;
      return errorResponse(errorMessage, 400);
    }

    const { email, code } = validationResult.data;

    // Check if reset code exists and is not expired
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        email,
        code,
      },
    });

    if (!resetToken) {
      return errorResponse("Invalid or expired reset code", 400);
    }

    // Check if code has expired
    if (new Date() > resetToken.expiresAt) {
      // Delete expired token
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      });
      return errorResponse(
        "Reset code has expired. Please request a new one.",
        400
      );
    }

    return NextResponse.json(
      {
        message:
          "Reset code verified successfully. You can now reset your password.",
        resetTokenId: resetToken.id,
      },
      { status: 200 }
    );
  } catch (error) {
    logError(error);
    return errorResponse("An error occurred. Please try again later.", 500);
  }
}
