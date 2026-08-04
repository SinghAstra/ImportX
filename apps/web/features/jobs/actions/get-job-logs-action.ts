"use server";

import { apiClient } from "@/lib/api-client";
import {
  GetJobLogsResponse,
  getJobLogsResponseSchema,
  type ApiResponse,
} from "@repo/shared";

export const getJobLogsAction = async (
  jobId: string
): Promise<ApiResponse<GetJobLogsResponse>> => {
  return apiClient.get<GetJobLogsResponse>(
    `/api/jobs/${jobId}/logs`,
    getJobLogsResponseSchema
  );
};
