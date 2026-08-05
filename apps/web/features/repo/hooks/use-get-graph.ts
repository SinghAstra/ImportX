import { useQuery } from "@tanstack/react-query";
import { getGraphAction } from "../actions/get-graph-action";
import { repoKeys } from "@/features/repo/query-keys";

export async function repoGraphQueryFn(id: string) {
  const response = await getGraphAction(id);

  if (!response.success) {
    throw new Error(response.error.message);
  }

  return response.data;
}

export function useGetGraph(id: string) {
  return useQuery({
    queryKey: repoKeys.graph(id),
    queryFn: () => repoGraphQueryFn(id),
    enabled: !!id,
  });
}
