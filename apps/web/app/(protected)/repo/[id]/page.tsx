import { RepoWorkspaceShell } from "@/features/repo/components/repo-workspace-shell";
import { repoQueryFn } from "@/features/repo/hooks/use-repo";
import { repoFilesQueryFn } from "@/features/repo/hooks/use-repo-files";
import { repoKeys } from "@/features/repo/query-keys";
import { GetRepositoryResponse, REPOSITORY_STATUS } from "@repo/shared";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { type Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Repository Workspace - SummaryX",
  description:
    "Interactive directory mapping and live AI summary generation workspace.",
};

interface RepositoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function RepositoryPage({ params }: RepositoryPageProps) {
  const { id } = await params;

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: repoKeys.detail(id),
    queryFn: () => repoQueryFn(id),
  });

  const repo = queryClient.getQueryData<GetRepositoryResponse>(
    repoKeys.detail(id)
  );

  if (repo?.status === REPOSITORY_STATUS.COMPLETED) {
    await queryClient.prefetchQuery({
      queryKey: repoKeys.files(id),
      queryFn: () => repoFilesQueryFn(id),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RepoWorkspaceShell repositoryId={id} />
    </HydrationBoundary>
  );
}
