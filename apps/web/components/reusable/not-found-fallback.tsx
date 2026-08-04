"use client";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface NotFoundFallbackProps {
  title?: string;
  description?: string;
  pageName?: string;
  actionHref: string;
  actionLabel?: string;
}

export function NotFoundFallback({
  title = "Page not found",
  description = "We couldn't find the page you're looking for.",
  actionHref,
  actionLabel = "Back to home",
}: NotFoundFallbackProps) {
  return (
    <main className="relative w-full min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 border border-sidebar-border/40 p-8 rounded-lg shadow-sm bg-card/80 backdrop-blur-sm z-10">
        <div className="flex justify-center">
          <span className="text-5xl font-bold select-none">404</span>
        </div>

        <div className="space-y-3 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

        <div className="flex flex-col gap-2.5 pt-2">
          <Link
            href={actionHref}
            className={cn(
              buttonVariants({ size: "sm" }),
              "group gap-2 w-full cursor-pointer"
            )}
          >
            {actionLabel}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </main>
  );
}
