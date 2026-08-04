"use server";

import { type ApiResponse, type ResyncRepoResponse } from "@repo/shared";
import { repoApi } from "../api/repo-api";

export async function resyncRepositoryAction(
  id: string
): Promise<ApiResponse<ResyncRepoResponse>> {
  return repoApi.resyncRepository(id);
}
