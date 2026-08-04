"use client";

import { ErrorFallback } from "@/components/reusable/error-fallback";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  return (
    <ErrorFallback
      pageName="Dashboard"
      error={error}
      reset={reset}
      fallbackHref="/dashboard"
    />
  );
}
