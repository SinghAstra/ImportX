export function RepositoryLoadingSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <SkeletonTreeItem level={0} />
          {i % 3 === 0 && (
            <>
              <SkeletonTreeItem level={1} />
              <SkeletonTreeItem level={1} />
            </>
          )}
        </div>
      ))}
    </div>
  );
}

function SkeletonTreeItem({ level }: { level: number }) {
  const paddingLeft = level * 1.5;

  return (
    <div
      style={{ paddingLeft: `${paddingLeft}rem` }}
      className="flex items-center gap-2 py-1.5 px-2"
    >
      <div className="size-4 flex items-center justify-center shrink-0">
        <div className="size-3 rounded bg-muted/60 animate-pulse" />
      </div>

      <div className="size-4 rounded bg-muted/50 animate-pulse shrink-0" />

      <div className="flex-1 space-y-1">
        <div className="h-3 bg-muted/50 rounded w-32 animate-pulse" />
      </div>
    </div>
  );
}
