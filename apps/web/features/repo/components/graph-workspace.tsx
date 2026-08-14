"use client";

import { useGetGraph } from "@/features/repo/hooks/use-get-graph";
import { logError } from "@repo/shared";
import { useCallback } from "react";
import { toast } from "sonner";
import { GraphVisualizer } from "./graph-visualizer";
import { RepoHeader } from "./repo-header";

interface GraphWorkspaceProps {
  repo: {
    id: string;
  };
}

export function GraphWorkspace({ repo }: GraphWorkspaceProps) {
  const { data } = useGetGraph(repo.id);

  const handleCopyDependencies = useCallback(async () => {
    if (!data || data.edges.length === 0) {
      toast.error("No dependency data available to copy.");

      return;
    }

    try {
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

      let compiledText = "CODEBASE DEPENDENCY MAP\n=====================\n\n";

      for (const [filePath, imports] of dependencyMap.entries()) {
        compiledText += `File: ${filePath}\n`;

        imports.forEach((imp) => {
          compiledText += `  -> imports ${imp}\n`;
        });

        compiledText += "\n";
      }

      await navigator.clipboard.writeText(compiledText);

      toast.success(`Copied dependency graph mapping to clipboard!`);
    } catch (error) {
      logError(error);

      toast.error("Failed to copy dependencies to clipboard.");
    }
  }, [data]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full w-full">
      <RepoHeader
        onCopyDependencies={handleCopyDependencies}
        isCopyDisabled={!data || data.edges.length === 0}
      />

      <main className="flex-1 overflow-y-auto h-full p-1 md:p-2 lg:p-4 animate-in fade-in duration-300">
        <GraphVisualizer repositoryId={repo.id} />
      </main>
    </div>
  );
}
