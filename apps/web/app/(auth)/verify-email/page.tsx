import { verifyEmailAction } from "@/features/auth/actions/verify-email";
import AuthNavbar from "@/features/auth/components/auth-navbar";
import { VerifyEmailError } from "@/features/auth/components/verify-email-error";
import { VerifyEmailSuccess } from "@/features/auth/components/verify-email-success";
import { ROUTES } from "@/lib/routes";
import { AUTH_ERROR_CODES } from "@repo/shared";
import { redirect } from "next/navigation";

interface VerifyEmailPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const { token } = await searchParams;

  if (!token) {
    redirect(ROUTES.SIGN_IN);
  }

  const result = await verifyEmailAction(token);

  const isSuccess = result.success;

  const isAlreadyVerified =
    !result.success &&
    (result.error.code === AUTH_ERROR_CODES.EMAIL_ALREADY_VERIFIED ||
      result.error.code === AUTH_ERROR_CODES.TOKEN_NOT_FOUND);

  const isError = !result.success && !isAlreadyVerified;

  return (
    <div className="h-screen w-full flex overflow-hidden">
      <div className="flex flex-col gap-8 p-8 w-full max-w-lg bg-muted/30 h-screen overflow-y-auto">
        <AuthNavbar />

        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-medium tracking-tight text-foreground text-balance">
            {isSuccess && "Email verified"}
            {isAlreadyVerified && "Account Active / Already Verified"}
            {isError && "Verification failed"}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {isSuccess && "Your account is now active and ready to use."}
            {isAlreadyVerified &&
              "This link may have already been used. Try to sign-in."}
            {isError &&
              (result.error?.message ||
                "We were unable to verify your email address.")}
          </p>
        </div>

        {isSuccess && <VerifyEmailSuccess />}
        {isAlreadyVerified && <VerifyEmailSuccess alreadyVerified />}
        {isError && <VerifyEmailError message={result.error.message} />}
      </div>

      <div className="hidden lg:flex flex-1 border-l border-border/50 relative overflow-hidden items-center justify-center">
        <div
          className="select-none pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden="true"
        >
          <span
            className="text-[28vw] font-bold leading-none text-transparent"
            style={{
              WebkitTextStroke: "1px oklch(1 0 0 / 8%)",
            }}
          >
            ✉
          </span>
        </div>

        <div className="relative z-10 flex flex-col gap-3 max-w-xs px-8 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
            Email verification
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Confirming your identity keeps your account secure and unlocks full
            access.
          </p>
        </div>

        <div
          className="absolute bottom-0 right-0 w-48 h-48 opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, oklch(1 0 0) 0px, oklch(1 0 0) 1px, transparent 1px, transparent 24px), repeating-linear-gradient(90deg, oklch(1 0 0) 0px, oklch(1 0 0) 1px, transparent 1px, transparent 24px)",
          }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
