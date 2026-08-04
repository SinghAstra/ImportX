import { repoKeys } from "@/features/repo/query-keys";
import { useQuery } from "@tanstack/react-query";
import { getJobLogsAction } from "../actions/get-job-logs-action";

export const getJobLogsQueryFn = async (jobId: string) => {
  const response = await getJobLogsAction(jobId);

  if (!response.success) throw new Error(response.error.message);

  return response.data;
};

export function useJobLogs(repositoryId: string, jobId: string) {
  return useQuery({
    queryKey: repoKeys.jobLogs(repositoryId, jobId),
    queryFn: () => getJobLogsQueryFn(jobId),
    enabled: !!jobId && !!repositoryId,
  });
}
