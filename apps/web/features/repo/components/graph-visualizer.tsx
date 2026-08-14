"use client";

import { useGetGraph } from "../hooks/use-get-graph";

interface GraphVisualizerProps {
  repositoryId: string;
}

export function GraphVisualizer({ repositoryId }: GraphVisualizerProps) {
  const { data, isLoading, error } = useGetGraph(repositoryId);

  if (isLoading) {
    return (
      <div className="h-150 w-full flex items-center justify-center border rounded-lg text-muted-foreground">
        Loading dependencies...
      </div>
    );
  }

  if (error || !data) {
    return <div className="text-destructive">Failed to load dependencies.</div>;
  }

  const dependencyMap = new Map<string, string[]>();

  data.edges.forEach((edge) => {
    const sourceNode = data.nodes.find((n) => n.id === edge.sourceId);

    const targetNode = data.nodes.find((n) => n.id === edge.targetId);

    if (sourceNode && targetNode) {
      const existing = dependencyMap.get(sourceNode.filePath) || [];

      dependencyMap.set(sourceNode.filePath, [
        ...existing,
        targetNode.filePath,
      ]);
    }
  });

  return (
    <div className="h-full w-full border rounded-lg overflow-y-auto bg-card p-4">
      <div className="space-y-4">
        {Array.from(dependencyMap.entries()).map(([filePath, imports]) => (
          <div key={filePath} className="p-3 border rounded bg-background">
            <span className="font-mono text-sm font-medium text-primary">
              📄 {filePath}
            </span>
            <ul className="mt-2 pl-4 border-l-2 border-muted space-y-1">
              {imports.map((importedFile, idx) => (
                <li
                  key={idx}
                  className="font-mono text-xs text-muted-foreground truncate"
                >
                  ↳ imports {importedFile}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
