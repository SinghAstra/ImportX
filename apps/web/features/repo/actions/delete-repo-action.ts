"use server";

import { type ApiResponse, type DeleteRepoResponse } from "@repo/shared";
import { repoApi } from "../api/repo-api";

export async function deleteRepositoryAction(
  id: string
): Promise<ApiResponse<DeleteRepoResponse>> {
  return repoApi.deleteRepository(id);
}

export async function deleteMultipleRepositoriesAction(
  ids: string[]
): Promise<ApiResponse<DeleteRepoResponse>> {
  return repoApi.deleteMultipleRepositories(ids);
}
