import { RepositoryTreeNode } from "@repo/shared";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getRepositoryFilesAction } from "../actions/get-repo-files-action";
import { repoKeys } from "../query-keys";

export const repoFilesQueryFn = async (
  id: string
): Promise<RepositoryTreeNode[]> => {
  const response = await getRepositoryFilesAction(id);

  if (!response.success) {
    throw new Error(response.error.message);
  }

  return response.data;
};

export function useRepositoryFiles(
  id: string
): UseQueryResult<RepositoryTreeNode[], Error> {
  return useQuery({
    queryKey: repoKeys.files(id),
    queryFn: () => repoFilesQueryFn(id),
  });
}
