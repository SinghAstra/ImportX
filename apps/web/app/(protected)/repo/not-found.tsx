"use client";

import { NotFoundFallback } from "@/components/reusable/not-found-fallback";

export default function RepoNotFound() {
  return (
    <NotFoundFallback
      title="Page Not Found"
      description="The page you're looking for doesn't exist or has been removed. It may have been deleted or the link might be incorrect."
      actionHref="/dashboard"
      actionLabel="Back to Dashboard"
    />
  );
}
