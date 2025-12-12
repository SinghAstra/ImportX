"use client";

export function MetricsSkeleton() {
  return (
    <div className="w-full space-y-4 animate-pulse">
      {/* Keyword Header Skeleton */}
      <div className="border-l-4 border-muted pl-4">
        <div className="h-8 w-64 bg-muted rounded" />
        <div className="h-4 w-48 bg-muted rounded mt-2" />
      </div>

      {/* Metrics Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="border border-border/40 rounded-lg p-6 bg-muted/5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-md bg-muted" />
              <div className="h-4 w-24 bg-muted rounded" />
            </div>
            <div className="h-9 w-32 bg-muted rounded" />
            <div className="h-3 w-24 bg-muted rounded mt-2" />
          </div>
        ))}
      </div>

      {/* Bid Range Skeleton */}
      <div className="border border-border/40 rounded-lg p-6 bg-muted/5">
        <div className="h-4 w-40 bg-muted rounded mb-4" />
        <div className="flex items-center justify-between">
          <div>
            <div className="h-3 w-16 bg-muted rounded" />
            <div className="h-8 w-20 bg-muted rounded mt-2" />
          </div>
          <div className="flex-1 mx-8">
            <div className="h-2 bg-muted rounded-full" />
          </div>
          <div>
            <div className="h-3 w-16 bg-muted rounded ml-auto" />
            <div className="h-8 w-20 bg-muted rounded mt-2" />
          </div>
        </div>
      </div>
    </div>
  );
}
