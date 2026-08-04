"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { logError } from "@repo/shared";
import { AlertTriangle, ArrowRight, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

interface ErrorFallbackProps {
  error: Error & { digest?: string };
  reset: () => void;
  pageName: string;
  fallbackHref: string;
}

export function ErrorFallback({
  error,
  reset,
  pageName,
  fallbackHref,
}: ErrorFallbackProps) {
  useEffect(() => {
    logError(error);
  }, [error]);

  return (
    <main className="relative w-full my-auto">
      <div className="w-full max-w-md space-y-6 border p-6 rounded shadow-xs z-10 mx-auto">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-linear-to-br from-sidebar-primary/20 to-sidebar-primary/5 rounded-full blur-2xl" />
            <div className="relative rounded-full bg-card p-5 ring-1 ring-sidebar-border">
              <AlertTriangle className="h-10 w-10 text-destructive animate-pulse" />
            </div>
          </div>
        </div>

        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Something went wrong
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We encountered an unexpected error while loading your{" "}
            <span className="font-medium text-foreground">{pageName}</span>{" "}
            page.
            {error.message && (
              <span className="block mt-3 text-3xs font-mono px-2.5 py-1 rounded border overflow-x-auto text-center">
                {error.message}
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-col gap-2.5 pt-2">
          <Button
            onClick={reset}
            size="sm"
            className="group gap-2 w-full cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5 transition-transform group-active:rotate-180" />
            Try again
          </Button>

          <Link
            href={fallbackHref}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "group gap-2 w-full"
            )}
          >
            Back to {pageName} page
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </main>
  );
}
