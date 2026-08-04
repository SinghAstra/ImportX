"use server";

import { type ApiResponse, type GetRepositoriesResponse } from "@repo/shared";
import { repoApi } from "../api/repo-api";

export async function getRepositoriesAction(): Promise<
  ApiResponse<GetRepositoriesResponse>
> {
  return repoApi.getRepositories();
}
