import AuthNavbar from "@/features/auth/components/auth-navbar";
import { LockKeyhole } from "lucide-react";
import type { ReactNode } from "react";

interface PasswordResetLayoutProps {
  children: ReactNode;
}

export default function PasswordResetLayout({
  children,
}: PasswordResetLayoutProps) {
  return (
    <div className="h-screen w-full flex overflow-hidden">
      <div className="flex flex-col gap-8 p-8 w-full max-w-lg bg-muted/30 overflow-y-auto">
        <AuthNavbar />
        {children}
      </div>

      <div className="flex-1 hidden md:flex md:flex-col md:justify-center md:items-center md:px-12 lg:px-24 border-l border-border/50 relative overflow-hidden bg-background">
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          aria-hidden="true"
        >
          <LockKeyhole
            strokeWidth={0.75}
            className="w-[55%] h-[55%] text-foreground opacity-[0.04]"
          />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-4 max-w-xs text-center">
          <div className="flex items-center justify-center w-10 h-10 rounded-md border border-border/60 bg-card">
            <LockKeyhole className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
              Secure reset
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Links are single-use and expire after 15 minutes to keep your
              account safe.
            </p>
          </div>
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
