import { ROUTES } from "@/lib/routes";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

interface VerifyEmailSuccessProps {
  alreadyVerified?: boolean;
}

export function VerifyEmailSuccess({
  alreadyVerified = false,
}: VerifyEmailSuccessProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-600 w-full">
      <div className="group bg-card border border-border rounded-lg p-6 flex flex-col gap-5 transition-all duration-300 hover:shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-md">
            <CheckCircle className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-medium text-foreground">
              {alreadyVerified ? "Already verified" : "Email verified"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {alreadyVerified
                ? "Your email address was already confirmed"
                : "Your email address has been confirmed"}
            </p>
          </div>
        </div>

        <div className="h-px bg-border" />

        <p className="text-sm text-muted-foreground leading-relaxed">
          {alreadyVerified
            ? "This verification link has already been used. Your account is active and ready to use."
            : "You\u2019re all set. Your account is now active and you can sign in to get started."}
        </p>

        <Link
          href={ROUTES.SIGN_IN}
          className="w-full inline-flex items-center justify-center rounded bg-primary text-primary-foreground text-sm font-medium px-4 py-2.5 transition-all duration-300 ease-in-out hover:opacity-90 active:scale-[0.98]"
        >
          Continue to sign in
        </Link>
      </div>
    </div>
  );
}
