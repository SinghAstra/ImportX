import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import { ROUTES } from "@/lib/routes";
import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-600 flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-medium tracking-tight text-foreground text-balance">
          Forgot your password?
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Enter your email and we&apos;ll send you a link to reset your
          password.
        </p>
      </div>

      <ForgotPasswordForm />

      <p className="text-sm text-muted-foreground text-center">
        Remembered it?{" "}
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
