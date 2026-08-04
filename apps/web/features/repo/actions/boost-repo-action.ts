"use server";

import { type ApiResponse, type BoostRepoResponse } from "@repo/shared";
import { repoApi } from "../api/repo-api";

export async function boostRepositoryAction(
  id: string
): Promise<ApiResponse<BoostRepoResponse>> {
  return repoApi.boostRepository(id);
}
