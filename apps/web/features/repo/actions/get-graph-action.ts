"use server";

import { type ApiResponse, type GetGraphResponse } from "@repo/shared";
import { repoApi } from "../api/repo-api";

export async function getGraphAction(
  id: string
): Promise<ApiResponse<GetGraphResponse>> {
  return repoApi.getGraph(id);
}
