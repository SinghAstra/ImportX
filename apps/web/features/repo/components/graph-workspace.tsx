"use client";

import { useGetGraph } from "@/features/repo/hooks/use-get-graph";
import { logError } from "@repo/shared";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { GraphVisualizer } from "./graph-visualizer";
import { RepoHeader } from "./repo-header";

interface GraphWorkspaceProps {
  repo: {
    id: string;
  };
}

interface TreeNode {
  name: string;
  fullPath: string;
  isDirectory: boolean;
  children: TreeNode[];
}

export function GraphWorkspace({ repo }: GraphWorkspaceProps) {
  const { data } = useGetGraph(repo.id);

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );

  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());

  // Compute folder and file lists for expand-all calculations
  const { allFolderPaths, allFilePaths } = useMemo(() => {
    if (!data) return { allFolderPaths: [], allFilePaths: [] };

    const localNodes = data.nodes.filter((n) => !n.isExternal);

    const root: { children: TreeNode[] } = { children: [] };

    localNodes.forEach((node) => {
      const parts = node.filePath.split("/").filter(Boolean);

      let curr = root;

      parts.forEach((part, index) => {
        const isFile = index === parts.length - 1;

        const fullPath = parts.slice(0, index + 1).join("/");

        let existing = curr.children.find((c) => c.name === part);

        if (!existing) {
          existing = {
            name: part,
            fullPath,
            isDirectory: !isFile,
            children: [],
          };

          curr.children.push(existing);
        }

        curr = existing;
      });
    });

    const folders: string[] = [];

    const files: string[] = [];

    const collect = (nodes: TreeNode[]) => {
      nodes.forEach((n) => {
        if (n.isDirectory) {
          folders.push(n.fullPath);

          collect(n.children);
        } else {
          files.push(n.fullPath);
        }
      });
    };

    collect(root.children);

    return { allFolderPaths: folders, allFilePaths: files };
  }, [data]);

  const isExpandedAll =
    allFolderPaths.length > 0 &&
    expandedFolders.size === allFolderPaths.length &&
    expandedFiles.size === allFilePaths.length;

  const handleToggleExpandAll = useCallback(() => {
    if (isExpandedAll) {
      setExpandedFolders(new Set());

      setExpandedFiles(new Set());
    } else {
      setExpandedFolders(new Set(allFolderPaths));

      setExpandedFiles(new Set(allFilePaths));
    }
  }, [isExpandedAll, allFolderPaths, allFilePaths]);

  const handleToggleFolder = useCallback((path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);

      if (next.has(path)) next.delete(path);
      else next.add(path);

      return next;
    });
  }, []);

  const handleToggleFile = useCallback((path: string) => {
    setExpandedFiles((prev) => {
      const next = new Set(prev);

      if (next.has(path)) next.delete(path);
      else next.add(path);

      return next;
    });
  }, []);

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
        isExpandedAll={isExpandedAll}
        onToggleExpandAll={handleToggleExpandAll}
        isExpandDisabled={allFolderPaths.length === 0}
      />

      <main className="flex-1 overflow-y-auto h-full p-1 md:p-2 lg:p-4 animate-in fade-in duration-300">
        <GraphVisualizer
          repositoryId={repo.id}
          expandedFolders={expandedFolders}
          expandedFiles={expandedFiles}
          onToggleFolder={handleToggleFolder}
          onToggleFile={handleToggleFile}
        />
      </main>
    </div>
  );
}
