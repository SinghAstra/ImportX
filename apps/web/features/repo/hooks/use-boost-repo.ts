import { GetRepositoryResponse, REPOSITORY_STATUS } from "@repo/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { boostRepositoryAction } from "../actions/boost-repo-action";
import { repoKeys } from "../query-keys";

export function useBoostRepository(repositoryId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await boostRepositoryAction(repositoryId);

      if (!response.success) throw new Error(response.error.message);

      return response.data;
    },
    onSuccess: (data) => {
      const oldRepoData = queryClient.getQueryData<GetRepositoryResponse>(
        repoKeys.detail(repositoryId)
      );

      if (oldRepoData?.latestJobId) {
        queryClient.removeQueries({
          queryKey: repoKeys.jobLogs(repositoryId, oldRepoData.latestJobId),
        });
      }

      queryClient.setQueryData(repoKeys.detail(repositoryId), (oldData) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          latestJobId: data.jobId,
          status: REPOSITORY_STATUS.PROCESSING,
        };
      });

      void Promise.all([
        queryClient.invalidateQueries({
          queryKey: repoKeys.detail(repositoryId),
        }),
        queryClient.invalidateQueries({
          queryKey: repoKeys.files(repositoryId),
        }),
        queryClient.invalidateQueries({ queryKey: repoKeys.lists() }),
      ]);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
