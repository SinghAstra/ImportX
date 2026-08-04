import { type GetRepositoriesResponse } from "@repo/shared";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getRepositoriesAction } from "../actions/get-repos-action";
import { repoKeys } from "../query-keys";

export const repoListQueryFn = async (): Promise<GetRepositoriesResponse> => {
  const response = await getRepositoriesAction();

  if (!response.success) {
    throw new Error(response.error.message);
  }

  return response.data;
};

export function useUserRepositories(): UseQueryResult<
  GetRepositoriesResponse,
  Error
> {
  return useQuery({
    queryKey: repoKeys.lists(),
    queryFn: repoListQueryFn,
  });
}
