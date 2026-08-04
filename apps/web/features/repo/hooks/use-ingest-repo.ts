import type { CreateRepoResponse, IngestRepoInput } from "@repo/shared";
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { ingestRepoAction } from "../actions/ingest-repo-action";
import { repoKeys } from "../query-keys";

interface MutationError {
  message: string;
}

export function useIngestRepo(): UseMutationResult<
  CreateRepoResponse,
  MutationError,
  IngestRepoInput
> {
  const queryClient = useQueryClient();

  return useMutation<CreateRepoResponse, MutationError, IngestRepoInput>({
    mutationFn: async (
      values: IngestRepoInput
    ): Promise<CreateRepoResponse> => {
      const response = await ingestRepoAction(values);

      if (!response.success) {
        throw new Error(response.error.message);
      }

      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: repoKeys.lists(),
      });
    },
  });
}
