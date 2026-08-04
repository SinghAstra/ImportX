import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { ROUTES } from "@/lib/routes";
import Link from "next/link";
import { Suspense } from "react";

export default function ResetPasswordPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-600 flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-medium tracking-tight text-foreground text-balance">
          Set a new password
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Choose a strong password. You&apos;ll use it to sign in going forward.
        </p>
      </div>

      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>

      <p className="text-sm text-muted-foreground text-center">
        Remember your password?{" "}
        <Link
          href={ROUTES.SIGN_IN}
          className="text-foreground hover:underline underline-offset-4 transition-all"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
