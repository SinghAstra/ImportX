"use client";

import { useMemo } from "react";
import { useGetGraph } from "../hooks/use-get-graph";
import { ChevronRight, Folder, FolderOpen, FileCode2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface GraphVisualizerProps {
  repositoryId: string;
  expandedFolders: Set<string>;
  expandedFiles: Set<string>;
  onToggleFolder: (path: string) => void;
  onToggleFile: (path: string) => void;
}

interface TreeNode {
  name: string;
  fullPath: string;
  isDirectory: boolean;
  children: TreeNode[];
  imports?: string[];
}

export function GraphVisualizer({
  repositoryId,
  expandedFolders,
  expandedFiles,
  onToggleFolder,
  onToggleFile,
}: GraphVisualizerProps) {
  const { data, isLoading, error } = useGetGraph(repositoryId);

  const dependencyMap = useMemo(() => {
    if (!data) return new Map<string, string[]>();

    const map = new Map<string, string[]>();

    data.edges.forEach((edge) => {
      const sourceNode = data.nodes.find((n) => n.id === edge.sourceId);

      const targetNode = data.nodes.find((n) => n.id === edge.targetId);

      if (sourceNode && targetNode) {
        const existing = map.get(sourceNode.filePath) || [];

        map.set(sourceNode.filePath, [...existing, targetNode.filePath]);
      }
    });

    return map;
  }, [data]);

  const fileTree = useMemo(() => {
    if (!data) return { children: [] };

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
            imports: isFile
              ? dependencyMap.get(node.filePath) || []
              : undefined,
          };

          curr.children.push(existing);
        }

        curr = existing;
      });
    });

    const sortNodes = (nodes: TreeNode[]) => {
      nodes.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;

        if (!a.isDirectory && b.isDirectory) return 1;

        return a.name.localeCompare(b.name);
      });

      nodes.forEach((n) => {
        if (n.children.length > 0) sortNodes(n.children);
      });
    };

    sortNodes(root.children);

    return root;
  }, [data, dependencyMap]);

  const totalFilesCount = useMemo(() => {
    let count = 0;

    const countFiles = (nodes: TreeNode[]) => {
      nodes.forEach((n) => {
        if (!n.isDirectory) count++;

        if (n.children.length > 0) countFiles(n.children);
      });
    };

    countFiles(fileTree.children);

    return count;
  }, [fileTree]);

  if (isLoading) {
    return (
      <div className="border bg-card/50 rounded flex items-center justify-center text-xs text-muted-foreground font-sans select-none py-12 backdrop-blur-sm h-full w-full">
        Loading dependencies workspace tree...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-destructive p-4">
        Failed to load dependencies graph.
      </div>
    );
  }

  const renderTree = (nodes: TreeNode[], depth = 0) => {
    return nodes.map((node) => {
      const isFolder = node.isDirectory;

      const isFolderExpanded = expandedFolders.has(node.fullPath);

      const isFileExpanded = expandedFiles.has(node.fullPath);

      const imports = node.imports || [];

      if (isFolder) {
        return (
          <div key={node.fullPath} className="space-y-1">
            <button
              onClick={() => onToggleFolder(node.fullPath)}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-secondary/60 transition-colors text-left cursor-pointer group"
              style={{ paddingLeft: `${depth * 16 + 8}px` }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <ChevronRight
                  className={cn(
                    "size-4 text-muted-foreground transition-transform duration-200 shrink-0",
                    isFolderExpanded && "rotate-90 text-primary"
                  )}
                />
                {isFolderExpanded ? (
                  <FolderOpen className="size-4 text-primary shrink-0" />
                ) : (
                  <Folder className="size-4 text-muted-foreground shrink-0" />
                )}
                <span className="font-mono text-xs sm:text-sm font-medium text-foreground truncate">
                  {node.name}
                </span>
              </div>
            </button>

            {isFolderExpanded && node.children.length > 0 && (
              <div className="space-y-1 border-l border-muted/50 ml-3 pl-1">
                {renderTree(node.children, depth + 1)}
              </div>
            )}
          </div>
        );
      }

      return (
        <div
          key={node.fullPath}
          className="border rounded-lg bg-background/40 hover:bg-background/80 transition-colors overflow-hidden"
          style={{ marginLeft: `${depth * 12}px` }}
        >
          <button
            onClick={() => onToggleFile(node.fullPath)}
            className="w-full flex items-center justify-between p-2.5 text-left cursor-pointer group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <ChevronRight
                className={cn(
                  "size-3.5 text-muted-foreground transition-transform duration-200 shrink-0",
                  isFileExpanded && "rotate-90 text-primary"
                )}
              />
              <FileCode2 className="size-4 text-primary shrink-0" />
              <span className="font-mono text-xs sm:text-sm font-medium text-foreground truncate">
                {node.name}
              </span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground shrink-0 ml-2">
              {imports.length} imports
            </span>
          </button>

          {isFileExpanded && imports.length > 0 && (
            <div className="px-4 pb-2.5 pt-1 border-t bg-card/30 space-y-1 animate-in fade-in duration-200">
              <p className="text-[10px] font-mono text-muted-foreground/70 mb-1">
                Linked Dependencies:
              </p>
              {imports.map((importedFile, idx) => {
                const isExternal = !importedFile.includes(".");

                return (
                  <div
                    key={idx}
                    className="flex items-center gap-2 font-mono text-xs text-muted-foreground py-1 px-2 rounded hover:bg-secondary/50 transition-colors"
                  >
                    <span className="text-primary/60">↳</span>
                    <span className="truncate flex-1">{importedFile}</span>
                    {isExternal && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary shrink-0">
                        external
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="border bg-card/50 rounded flex flex-col shadow-sm h-full overflow-hidden w-full backdrop-blur-sm flex-1 overflow-y-auto p-3 space-y-1.5">
      {fileTree.children.length === 0 ? (
        <div className="text-center py-8 text-xs text-muted-foreground italic">
          No directory tree available.
        </div>
      ) : (
        renderTree(fileTree.children)
      )}
    </div>
  );
}
