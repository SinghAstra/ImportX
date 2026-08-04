import { type ApiResponse } from "@repo/shared";

export function successResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
  };
}
