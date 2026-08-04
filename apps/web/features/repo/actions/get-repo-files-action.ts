"use server";

import {
  type ApiResponse,
  type GetRepositoryFilesResponse,
} from "@repo/shared";
import { repoApi } from "../api/repo-api";

export async function getRepositoryFilesAction(
  id: string
): Promise<ApiResponse<GetRepositoryFilesResponse>> {
  return repoApi.getRepositoryFiles(id);
}
