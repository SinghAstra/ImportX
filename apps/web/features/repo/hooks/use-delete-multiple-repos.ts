import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteMultipleRepositoriesAction } from "../actions/delete-repo-action";
import { repoKeys } from "../query-keys";

export function useDeleteMultipleRepositories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await deleteMultipleRepositoriesAction(ids);

      if (!response.success) {
        throw new Error(response.error.message);
      }

      return response.data;
    },
    onSuccess: (data, ids) => {
      toast.success(data.message);

      ids.forEach((id) => {
        queryClient.removeQueries({ queryKey: repoKeys.detail(id) });
      });

      queryClient.invalidateQueries({ queryKey: repoKeys.lists() });
    },
  });
}
