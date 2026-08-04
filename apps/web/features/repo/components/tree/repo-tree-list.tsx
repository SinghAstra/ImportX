"use client";

import { type RepositoryTreeNode } from "@repo/shared";
import { TreeNodeItem } from "./tree-node-item";

interface RepoTreeListProps {
  nodes: RepositoryTreeNode[];
  expandedFolders: Set<string>;
  expandedSummaries: Set<string>;
  onToggleFolder: (path: string) => void;
  onToggleSummary: (path: string) => void;
}

export function RepoTreeList({
  nodes,
  expandedFolders,
  expandedSummaries,
  onToggleFolder,
  onToggleSummary,
}: RepoTreeListProps) {
  return (
    <ul className="space-y-0.5 font-mono text-xs md:text-sm tracking-tight text-foreground/80">
      {nodes.map((node) => (
        <TreeNodeItem
          key={node.relativePath}
          node={node}
          expandedFolders={expandedFolders}
          expandedSummaries={expandedSummaries}
          onToggleFolder={onToggleFolder}
          onToggleSummary={onToggleSummary}
        />
      ))}
    </ul>
  );
}
