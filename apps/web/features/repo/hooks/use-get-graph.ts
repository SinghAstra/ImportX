import { useQuery } from "@tanstack/react-query";
import { getGraphAction } from "../actions/get-graph-action";

export function useGetGraph(id: string) {
  return useQuery({
    queryKey: ["repo-graph", id],
    queryFn: async () => {
      const response = await getGraphAction(id);

      if (!response.success) {
        throw new Error(response.error.message);
      }

      return response.data;
    },
    enabled: !!id,
  });
}
