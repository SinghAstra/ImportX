import { apiClient } from "@/lib/api-client";
import {
  type ApiResponse,
  type GetJobLogsResponse,
  getJobLogsResponseSchema,
} from "@repo/shared";

export const jobApi = {
  getJobLogs: (id: string): Promise<ApiResponse<GetJobLogsResponse>> => {
    return apiClient.get(`/api/jobs/${id}/logs`, getJobLogsResponseSchema);
  },
};
