"use client";

import { ErrorFallback } from "@/components/reusable/error-fallback";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ProtectedPageError({ error, reset }: ErrorProps) {
  return (
    <ErrorFallback
      pageName="Protected Page"
      error={error}
      reset={reset}
      fallbackHref="/dashboard"
    />
  );
}
