import { prisma } from "@/lib/prisma";
import { ROUTES } from "@/lib/routes";
import { redirect } from "next/navigation";

interface VerifyEmailPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const awaitParams = await searchParams;
  const token = awaitParams.token as string;

  // Helper to construct the redirect URL with Hash params
  const returnToLogin = (type: "error" | "success", message: string) => {
    const params = new URLSearchParams();

    if (type === "error") {
      params.set("error", "verification_failed");
      params.set("error_description", message);
    } else {
      params.set("message", message);
    }

    // Redirects to /auth/sign-in#error=...
    return redirect(`${ROUTES.AUTH.SIGN_IN}#${params.toString()}`);
  };

  // 1. Validation: Missing Token
  if (!token) {
    return returnToLogin("error", "Missing verification token.");
  }

  // 2. Database: Find Token
  const verifyToken = await prisma.verificationToken.findFirst({
    where: { token },
  });

  // 3. Validation: Invalid Token
  if (!verifyToken) {
    return returnToLogin("error", "Invalid or expired confirmation url.");
  }

  // 4. Validation: Expired Token
  if (new Date() > verifyToken.expires) {
    return returnToLogin("error", "Invalid or expired confirmation url.");
  }

  // 5. Database: Find User
  const existingUser = await prisma.user.findUnique({
    where: { email: verifyToken.identifier },
  });

  if (!existingUser) {
    return returnToLogin("error", "User associated with this token not found.");
  }

  // 6. Success: Update User
  await prisma.user.update({
    where: { email: existingUser.email },
    data: {
      emailVerified: new Date(),
    },
  });

  // 7. Cleanup: Delete used token
  await prisma.verificationToken.delete({
    where: { token: verifyToken.token },
  });

  // 8. Redirect with Success Hash
  return returnToLogin(
    "success",
    "Email verified successfully! Please sign in."
  );
}
