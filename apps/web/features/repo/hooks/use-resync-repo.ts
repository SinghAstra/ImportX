import { logError, REPOSITORY_STATUS, ResyncRepoResponse } from "@repo/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resyncRepositoryAction } from "../actions/resync-repo-action";
import { repoKeys } from "../query-keys";

export function useResyncRepository(repositoryId: string) {
  const queryClient = useQueryClient();

  return useMutation<ResyncRepoResponse, Error>({
    mutationFn: async () => {
      const response = await resyncRepositoryAction(repositoryId);

      if (!response.success) {
        throw new Error(response.error.message);
      }

      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        repoKeys.detail(repositoryId),
        (oldRepo: unknown) => {
          if (!oldRepo) return oldRepo;

          return {
            ...oldRepo,
            status: REPOSITORY_STATUS.PROCESSING,
            latestJobId: data.jobId,
          };
        }
      );

      queryClient.invalidateQueries({
        queryKey: repoKeys.lists(),
      });
    },
    onError: (error) => {
      logError(error);
    },
  });
}
