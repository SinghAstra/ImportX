import { ValueProposition } from "@/features/auth/components/value-proposition";
import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

async function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="h-screen w-full flex overflow-hidden">
      {children}

      <div className="flex-1 hidden md:flex md:flex-col md:justify-center md:items-center md:px-12 lg:px-24 border-l border-border/50 relative overflow-hidden bg-background">
        <div className="absolute bottom-0 right-0 p-8 flex items-center justify-center pointer-events-none z-0 select-none overflow-hidden">
          <h1 className="text-[300px] font-bold text-transparent [-webkit-text-stroke:2px_var(--muted-foreground)] opacity-10 tracking-tighter whitespace-nowrap">
            X
          </h1>
        </div>
        <ValueProposition />
      </div>
    </div>
  );
}

export default AuthLayout;
