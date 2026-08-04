import { XCircle } from "lucide-react";
import { ResendVerificationForm } from "./resend-verification-form";

interface VerifyEmailErrorProps {
  message: string;
}

export function VerifyEmailError({ message }: VerifyEmailErrorProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-600 w-full flex flex-col gap-6">
      <div className="bg-card border border-border rounded-lg p-6 flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="bg-destructive/10 p-2 rounded-md">
            <XCircle className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <h2 className="text-base font-medium text-foreground">
              Verification failed
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              We couldn&apos;t verify your email address
            </p>
          </div>
        </div>

        <div className="h-px bg-border" />

        <p className="text-sm text-muted-foreground leading-relaxed">
          {message}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            Request a new link
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <ResendVerificationForm />
      </div>
    </div>
  );
}
