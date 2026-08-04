import {
  COMMON_ERROR_CODES,
  createApiResponseSchema,
  logError,
  type ApiResponse,
} from "@repo/shared";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "./auth";
import { env } from "./env";

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

async function request<T>(
  method: string,
  path: string,
  payloadSchema: z.ZodType<T>,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const baseUrl = env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  const url = `${baseUrl}${normalizedPath}`;

  const { body, ...restOptions } = options;

  let authorizationHeader: Record<string, string> = {};

  try {
    const session = await getServerSession(authOptions);

    if (session) {
      authorizationHeader = {
        Authorization: `Bearer ${session.accessToken}`,
      };
    }
  } catch (error) {
    logError(error);
  }

  try {
    const fetchOptions: RequestInit = {
      ...restOptions,
      method,
      headers: {
        "Content-Type": "application/json",
        ...authorizationHeader,
        ...restOptions.headers,
      },
    };

    if (body !== undefined) {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);

    let json: unknown;

    try {
      json = await response.json();
    } catch (error) {
      logError(error);

      return {
        success: false,
        error: {
          code: COMMON_ERROR_CODES.INVALID_JSON,
          message:
            "The server returned an unreadable response layout. Please try again.",
        },
      };
    }

    const responseEnvelopeSchema = createApiResponseSchema(payloadSchema);

    return responseEnvelopeSchema.parse(json);
  } catch (error) {
    if (error instanceof z.ZodError) {
      logError(error);

      return {
        success: false,
        error: {
          code: COMMON_ERROR_CODES.SCHEMA_MISMATCH,
          message:
            "The application encountered a contract mismatch. Please check for system updates.",
        },
      };
    }

    logError(error);

    return {
      success: false,
      error: {
        code: COMMON_ERROR_CODES.NETWORK_ERROR,
        message:
          "Unable to establish a secure connection to the network core. Check your connectivity.",
      },
    };
  }
}

export const apiClient = {
  get: <T>(path: string, schema: z.ZodType<T>, options?: RequestOptions) =>
    request<T>("GET", path, schema, options),

  post: <T>(
    path: string,
    body: unknown,
    schema: z.ZodType<T>,
    options?: RequestOptions
  ) => request<T>("POST", path, schema, { ...options, body }),

  put: <T>(
    path: string,
    body: unknown,
    schema: z.ZodType<T>,
    options?: RequestOptions
  ) => request<T>("PUT", path, schema, { ...options, body }),

  delete: <T>(path: string, schema: z.ZodType<T>, options?: RequestOptions) =>
    request<T>("DELETE", path, schema, options),
};
