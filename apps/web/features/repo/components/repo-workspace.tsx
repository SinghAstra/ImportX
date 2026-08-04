"use client";

import { RepositoryExplorer } from "@/features/repo/components/repo-explorer";
import { RepoHeader } from "@/features/repo/components/repo-header";
import { useRepositoryFiles } from "@/features/repo/hooks/use-repo-files";
import {
  compileProjectSummaryText,
  extractAllCompletedFilePaths,
  extractAllFolderPaths,
} from "@/features/repo/utils/tree-utils";
import { logError } from "@repo/shared";
import { useCallback, useState } from "react";
import { toast } from "sonner";

interface RepositoryWorkspaceProps {
  repo: {
    id: string;
  };
}

export function RepositoryWorkspace({ repo }: RepositoryWorkspaceProps) {
  const { data: treeNodes = [] } = useRepositoryFiles(repo.id);

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );

  const [expandedSummaries, setExpandedSummaries] = useState<Set<string>>(
    new Set()
  );

  const [prevCompletedCount, setPrevCompletedCount] = useState(0);

  const allFolderPaths = extractAllFolderPaths(treeNodes);

  const allCompletedFilePaths = extractAllCompletedFilePaths(treeNodes);

  if (allCompletedFilePaths.length !== prevCompletedCount) {
    setPrevCompletedCount(allCompletedFilePaths.length);

    if (
      allFolderPaths.length > 0 &&
      expandedFolders.size === allFolderPaths.length
    ) {
      setExpandedSummaries(new Set(allCompletedFilePaths));
    }
  }

  const isExpandedAll =
    allFolderPaths.length > 0 &&
    expandedFolders.size === allFolderPaths.length &&
    expandedSummaries.size === allCompletedFilePaths.length;

  const handleToggleFolder = useCallback((path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);

      if (next.has(path)) next.delete(path);
      else next.add(path);

      return next;
    });
  }, []);

  const handleToggleSummary = useCallback((fileId: string) => {
    setExpandedSummaries((prev) => {
      const next = new Set(prev);

      if (next.has(fileId)) next.delete(fileId);
      else next.add(fileId);

      return next;
    });
  }, []);

  const handleToggleExpandAll = (): void => {
    if (isExpandedAll) {
      setExpandedFolders(new Set());

      setExpandedSummaries(new Set());
    } else {
      setExpandedFolders(new Set(allFolderPaths));

      setExpandedSummaries(new Set(allCompletedFilePaths));
    }
  };

  const handleCopySummaryAll = async () => {
    if (treeNodes.length === 0) return;

    const compiledText = compileProjectSummaryText(treeNodes);

    if (!compiledText) {
      toast.error("No file summaries are ready to copy yet.");

      return;
    }

    try {
      await navigator.clipboard.writeText(compiledText);

      toast.success(
        `Copied ${allCompletedFilePaths.length} file summaries to clipboard!`
      );
    } catch (error) {
      logError(error);

      toast.error("Failed to copy summaries to clipboard.");
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full w-full">
      <RepoHeader
        isExpandedAll={isExpandedAll}
        onToggleExpandAll={handleToggleExpandAll}
        onCopySummaryAll={handleCopySummaryAll}
      />

      <main className="flex-1 overflow-y-auto h-full p-1 md:p-2 lg:p-4 animate-in fade-in duration-300">
        <RepositoryExplorer
          repositoryId={repo.id}
          expandedFolders={expandedFolders}
          expandedSummaries={expandedSummaries}
          onToggleFolder={handleToggleFolder}
          onToggleSummary={handleToggleSummary}
        />
      </main>
    </div>
  );
}
