"use client";

import { analyzeKeywordAction } from "@/actions/seo";
import { ErrorDisplay } from "@/components/seo/error-display";
import { KeywordSearch } from "@/components/seo/keyword-search";
import { MetricsDisplay } from "@/components/seo/metrics-display";
import { MetricsSkeleton } from "@/components/seo/metrics-skeleton";
import type { KeywordMetrics } from "@/interfaces/seo";
import { logError } from "@/lib/log-error";
import { useState } from "react";

export default function SeoPage() {
  const [metrics, setMetrics] = useState<KeywordMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastKeyword, setLastKeyword] = useState<string>("");

  const handleSearch = async (keyword: string) => {
    setIsLoading(true);
    setError(null);
    setLastKeyword(keyword);

    try {
      // 1. Call the Server Action
      const result = await analyzeKeywordAction(keyword);

      if (result.success) {
        setMetrics(result.data);
      } else {
        setMetrics(null);
        handleError(result.error, result.statusCode || result.code);
      }
    } catch (err) {
      logError(err);
      setError("An unexpected network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Translates Backend Error Codes into User-Friendly UI Messages
   */
  const handleError = (msg: string, code?: number | string) => {
    // 1. Handle Auth Issues (401 or "UNAUTHORIZED")
    if (code === 401 || code === "UNAUTHORIZED") {
      setError("Your session has expired. Please sign in again.");
      return;
    }

    // 2. Handle Rate Limits (429 or "RATE_LIMIT")
    if (code === 429 || code === "RATE_LIMIT") {
      setError("You are searching too fast. Please wait a moment.");
      return;
    }

    // 3. Handle Payment/Quota Issues
    if (
      code === 402 ||
      code === "INSUFFICIENT_FUNDS" ||
      msg.includes("Insufficient")
    ) {
      setError("API usage limit reached. Please upgrade your plan.");
      return;
    }

    // 4. Default: Show the server message (or a fallback)
    setError(msg || "Something went wrong while fetching data.");
  };

  const handleRetry = () => {
    if (lastKeyword) {
      handleSearch(lastKeyword);
    }
  };

  return (
    <div className="h-full w-full overflow-auto">
      <div className="p-6 lg:p-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground text-balance">
            SEO Keyword Analysis
          </h1>
          <p className="text-muted-foreground text-pretty">
            Analyze search volume, competition, and cost per click for any
            keyword.
          </p>
        </div>

        <KeywordSearch onSearch={handleSearch} isLoading={isLoading} />

        <div className="min-h-[400px]">
          {/* State 1: Loading */}
          {isLoading && <MetricsSkeleton />}

          {/* State 2: Error */}
          {!isLoading && error && (
            <ErrorDisplay message={error} onRetry={handleRetry} />
          )}

          {/* State 3: Success Data */}
          {!isLoading && !error && metrics && <MetricsDisplay data={metrics} />}

          {/* State 4: Empty State (Initial) */}
          {!isLoading && !error && !metrics && (
            <div className="flex items-center justify-center h-[400px] border border-dashed border-border/50 rounded-lg bg-muted/5">
              <div className="text-center space-y-2">
                <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl">
                  🔍
                </div>
                <p className="text-muted-foreground">
                  Enter a keyword above to start analyzing
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
