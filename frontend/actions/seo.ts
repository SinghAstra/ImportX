"use server";

import { KeywordMetrics } from "@/interfaces/seo";
import { authOptions } from "@/lib/auth-options";
import { generateAuthToken } from "@/lib/auth-token";
import { logError } from "@/lib/log-error";
import { getServerSession } from "next-auth";

// 1. Define the Expected Response Type
export type ActionResponse =
  | { success: true; data: KeywordMetrics }
  | {
      success: false;
      error: string;
      statusCode: number;
      code?: string | number;
    };

export async function analyzeKeywordAction(
  keyword: string
): Promise<ActionResponse> {
  // 1. Auth Check (NextAuth)
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      success: false,
      error: "Unauthorized: Please log in first.",
      statusCode: 401,
      code: "UNAUTHORIZED",
    };
  }

  try {
    // 2. Generate Secure HMAC Token
    const token = generateAuthToken(session.user.id);
    const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";

    // 3. Call Express Backend
    const res = await fetch(
      `${backendUrl}/api/seo/analyze?keyword=${encodeURIComponent(keyword)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    const payload = await res.json();

    // 4. Handle API Errors (HTTP 4xx/5xx)
    if (!payload.success || !res.ok) {
      return {
        success: false,
        error:
          payload.error?.message || "An error occurred while fetching data.",
        statusCode: res.status,
        code: payload.error?.code,
      };
    }

    // 5. Success
    return { success: true, data: payload.data };
  } catch (error) {
    logError(error);
    return {
      success: false,
      error: "Network error: Unable to connect to the backend server.",
      statusCode: 500,
      code: "NETWORK_ERROR",
    };
  }
}
