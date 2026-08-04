"use client";

import { useRepository } from "@/features/repo/hooks/use-repo";
import { REPOSITORY_STATUS } from "@repo/shared";
import { notFound } from "next/navigation";
import { ProcessingWorkspace } from "./processing-workspace";
import { RepositoryWorkspace } from "./repo-workspace";

interface RepoWorkspaceShellProps {
  repositoryId: string;
}

export function RepoWorkspaceShell({ repositoryId }: RepoWorkspaceShellProps) {
  const { data: repo } = useRepository(repositoryId);

  if (!repo) {
    return notFound();
  }

  if (repo.status !== REPOSITORY_STATUS.COMPLETED) {
    return <ProcessingWorkspace repo={repo} />;
  }

  return <RepositoryWorkspace repo={repo} />;
}
