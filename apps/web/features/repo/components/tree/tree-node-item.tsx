"use client";

import { cn } from "@/lib/utils";
import { type RepositoryTreeNode } from "@repo/shared";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Folder,
  FolderOpen,
} from "lucide-react";
import React from "react";

interface TreeNodeItemProps {
  node: RepositoryTreeNode;
  expandedFolders: Set<string>;
  expandedSummaries: Set<string>;
  onToggleFolder: (path: string) => void;
  onToggleSummary: (path: string) => void;
}

export function TreeNodeItem({
  node,
  expandedFolders,
  onToggleFolder,
  expandedSummaries,
  onToggleSummary,
}: TreeNodeItemProps) {
  const isFolder = node.type === "folder";

  const isFolderOpen = expandedFolders.has(node.relativePath);

  const isSummaryOpen = expandedSummaries.has(node.relativePath);

  const handleClick = (e: React.MouseEvent): void => {
    e.stopPropagation();

    if (isFolder) {
      onToggleFolder(node.relativePath);
    } else if (node.summaryStatus === "COMPLETED") {
      onToggleSummary(node.relativePath);
    }
  };

  return (
    <li className="list-none">
      <div
        onClick={handleClick}
        className={cn(
          "flex items-center gap-2 px-2 py-1.5 rounded-md transition-all duration-150 cursor-pointer group select-none relative",
          isSummaryOpen
            ? "bg-muted/60 text-foreground"
            : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
        )}
      >
        <div className="size-4 flex items-center justify-center shrink-0">
          {isFolder &&
            (isFolderOpen ? (
              <ChevronDown className="size-3.5 text-muted-foreground/60" />
            ) : (
              <ChevronRight className="size-3.5 text-muted-foreground/60" />
            ))}
        </div>

        {isFolder ? (
          isFolderOpen ? (
            <FolderOpen className="size-4 text-primary/70 fill-primary/5 shrink-0" />
          ) : (
            <Folder className="size-4 text-primary/70 fill-primary/5 shrink-0" />
          )
        ) : (
          <FileText className="size-4 shrink-0 text-muted-foreground/40 group-hover:text-muted-foreground/70" />
        )}

        <span className="truncate font-medium text-foreground/80">
          {node.name}
        </span>

        {!isFolder && (
          <div className="ml-auto flex items-center gap-1.5 shrink-0">
            {node.summaryStatus === "PENDING" && (
              <span className="text-[10px] bg-muted text-muted-foreground/70 px-1.5 py-0.5 rounded border border-border/40 select-none">
                Waiting...
              </span>
            )}

            {node.summaryStatus === "PROCESSING" && (
              <span className="text-[10px] bg-muted text-muted-foreground/70 px-1.5 py-0.5 rounded border border-border/40 select-none">
                Analyzing...
              </span>
            )}

            {node.summaryStatus === "FAILED" && (
              <span className="text-[10px] bg-muted text-muted-foreground/70 px-1.5 py-0.5 rounded border border-border/40 select-none">
                Failed
              </span>
            )}
          </div>
        )}
      </div>

      {!isFolder && node.summaryStatus === "COMPLETED" && isSummaryOpen && (
        <div className="pl-4 pr-3 py-2.5 my-1 ml-6 bg-muted/30 border border-border/40 rounded text-xs text-muted-foreground/90 font-sans whitespace-pre-wrap leading-relaxed shadow-inner animate-in fade-in slide-in-from-top-1 duration-150">
          {node.summary || "No summary available for this file."}
        </div>
      )}

      {isFolder && isFolderOpen && node.children.length > 0 && (
        <div className="pl-3.5 ml-2 border-l border-border/40 mt-0.5 space-y-0.5">
          <ul className="space-y-0.5">
            {node.children.map((child) => (
              <TreeNodeItem
                key={child.relativePath}
                node={child}
                expandedFolders={expandedFolders}
                onToggleFolder={onToggleFolder}
                expandedSummaries={expandedSummaries}
                onToggleSummary={onToggleSummary}
              />
            ))}
          </ul>
        </div>
      )}

      {isFolder && isFolderOpen && node.children.length === 0 && (
        <div className="pl-8 py-1 text-[11px] text-muted-foreground/30 font-sans italic select-none">
          Empty directory
        </div>
      )}
    </li>
  );
}
