"use client";

import { useRepository } from "@/features/repo/hooks/use-repo";
import { REPOSITORY_STATUS } from "@repo/shared";
import { notFound } from "next/navigation";
import { ProcessingWorkspace } from "./processing-workspace";
import { GraphVisualizer } from "./graph-visualizer";

interface RepoWorkspaceShellProps {
  repositoryId: string;
}

export function RepoWorkspaceShell({ repositoryId }: RepoWorkspaceShellProps) {
  const { data: repo, isLoading } = useRepository(repositoryId);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <p className="text-sm muted">Loading workspace...</p>
      </div>
    );
  }

  if (!repo) {
    return notFound();
  }

  if (repo.status !== REPOSITORY_STATUS.COMPLETED) {
    return <ProcessingWorkspace key={repositoryId} repo={repo} />;
  }

  return <GraphVisualizer key={repositoryId} repositoryId={repositoryId} />;
}
