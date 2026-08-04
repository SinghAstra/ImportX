import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteRepositoryAction } from "../actions/delete-repo-action";
import { repoKeys } from "../query-keys";

export function useDeleteRepository() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteRepositoryAction(id);

      if (!response.success) {
        throw new Error(response.error.message);
      }

      return response.data;
    },
    onSuccess: (data, id) => {
      toast.success("Repository removed successfully");

      queryClient.removeQueries({ queryKey: repoKeys.detail(id) });

      queryClient.invalidateQueries({ queryKey: repoKeys.lists() });
    },
  });
}
