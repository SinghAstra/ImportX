import { GetRepositoryResponse } from "@repo/shared";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getRepositoryAction } from "../actions/get-repo-action";
import { repoKeys } from "../query-keys";

export const repoQueryFn = async (
  id: string
): Promise<GetRepositoryResponse> => {
  const response = await getRepositoryAction(id);

  if (!response.success) {
    throw new Error(response.error.message);
  }

  return response.data;
};

export function useRepository(
  id: string
): UseQueryResult<GetRepositoryResponse, Error> {
  return useQuery({
    queryKey: repoKeys.detail(id),
    queryFn: () => repoQueryFn(id),
  });
}
