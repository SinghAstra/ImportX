import { apiClient } from "@/lib/api-client";
import {
  type ApiResponse,
  BoostRepoResponse,
  boostRepoResponseSchema,
  type CreateRepoResponse,
  createRepoResponseSchema,
  DeleteRepoResponse,
  deleteRepoResponseSchema,
  type GetRepositoriesResponse,
  getRepositoriesResponseSchema,
  type GetRepositoryFilesResponse,
  getRepositoryFilesResponseSchema,
  type GetRepositoryResponse,
  getRepositoryResponseSchema,
  type IngestRepoInput,
  ResyncRepoResponse,
  resyncRepoResponseSchema,
} from "@repo/shared";

export const repoApi = {
  ingestRepository: (
    data: IngestRepoInput
  ): Promise<ApiResponse<CreateRepoResponse>> => {
    return apiClient.post("/api/repo", data, createRepoResponseSchema);
  },

  getRepository: (id: string): Promise<ApiResponse<GetRepositoryResponse>> => {
    return apiClient.get(`/api/repo/${id}`, getRepositoryResponseSchema);
  },

  getRepositories: (): Promise<ApiResponse<GetRepositoriesResponse>> => {
    return apiClient.get("/api/repo", getRepositoriesResponseSchema);
  },

  getRepositoryFiles: (
    id: string
  ): Promise<ApiResponse<GetRepositoryFilesResponse>> => {
    return apiClient.get(
      `/api/repo/${id}/files`,
      getRepositoryFilesResponseSchema
    );
  },

  resyncRepository: (id: string): Promise<ApiResponse<ResyncRepoResponse>> => {
    return apiClient.post(
      `/api/repo/${id}/resync`,
      {},
      resyncRepoResponseSchema
    );
  },

  boostRepository: (id: string): Promise<ApiResponse<BoostRepoResponse>> => {
    return apiClient.post(`/api/repo/${id}/boost`, {}, boostRepoResponseSchema);
  },

  deleteRepository: (id: string): Promise<ApiResponse<DeleteRepoResponse>> => {
    return apiClient.delete(`/api/repo/${id}`, deleteRepoResponseSchema);
  },

  deleteMultipleRepositories: (
    ids: string[]
  ): Promise<ApiResponse<DeleteRepoResponse>> => {
    return apiClient.delete("/api/repo/bulk", deleteRepoResponseSchema, {
      body: { ids },
    });
  },
};
