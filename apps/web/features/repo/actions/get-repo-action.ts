"use server";

import { type ApiResponse, type GetRepositoryResponse } from "@repo/shared";
import { repoApi } from "../api/repo-api";

export async function getRepositoryAction(
  id: string
): Promise<ApiResponse<GetRepositoryResponse>> {
  return repoApi.getRepository(id);
}
