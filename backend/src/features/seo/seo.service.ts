import { env } from "@/config/env";
import { redis } from "@/lib/redis";
import { AppError } from "@/utils/AppError";
import { logError } from "@/utils/error";
import axios, { AxiosInstance } from "axios";
import Redis from "ioredis";
import { DataForSeoResponse, KeywordMetrics } from "./types";

export class SeoService {
  private client: AxiosInstance;
  private redis: Redis;
  private readonly CACHE_TTL = 60 * 60 * 24;

  constructor() {
    this.redis = redis;

    this.client = axios.create({
      baseURL: "https://api.dataforseo.com/v3",
      auth: {
        username: env.DATAFORSEO_LOGIN,
        password: env.DATAFORSEO_PASSWORD,
      },
      headers: { "Content-Type": "application/json" },
    });
  }

  async getKeywordAnalysis(keyword: string): Promise<KeywordMetrics | null> {
    const cleanKeyword = keyword.trim().toLowerCase();
    const cacheKey = `seo:keyword:${cleanKeyword}`;

    // A. Check Cache
    const cachedData = await this.redis.get(cacheKey);
    if (cachedData) {
      console.log(`🟢 Cache HIT for: ${cleanKeyword}`);
      return JSON.parse(cachedData);
    }

    console.log(`🟡 Cache MISS for: ${cleanKeyword}. Calling DataForSEO...`);

    try {
      // B. Call API
      const payload = [
        {
          location_code: 2840,
          language_code: "en",
          keywords: [cleanKeyword],
          include_adult_keywords: false,
        },
      ];

      const response = await this.client.post<DataForSeoResponse>(
        "/keywords_data/google_ads/search_volume/live",
        payload
      );

      // C. Validate Response Logic
      const task = response.data.tasks?.[0];

      if (!task) {
        throw new AppError(`DataForSEO Error`, 502, "EXTERNAL_API_ERROR");
      }

      if (!task.result || task.result.length === 0) {
        console.warn(`⚠️ No data found for keyword: ${cleanKeyword}`);
        return null;
      }

      const rawResult = task.result[0];

      const metrics: KeywordMetrics = {
        keyword: rawResult.keyword,
        search_volume: rawResult.search_volume || 0,
        cpc: rawResult.cpc || 0,
        competition: rawResult.competition,
        competition_index: rawResult.competition_index,
        low_top_of_page_bid: rawResult.low_top_of_page_bid,
        high_top_of_page_bid: rawResult.high_top_of_page_bid,
      };

      // D. Save to Cache
      await this.redis.set(
        cacheKey,
        JSON.stringify(metrics),
        "EX",
        this.CACHE_TTL
      );

      return metrics;
    } catch (error) {
      logError(error);

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const apiMsg = error.response?.statusText || "Provider Error";

        // 1. Handle "Out of Money" (DataForSEO returns 402)
        if (status === 402) {
          throw new AppError(
            "SEO Provider Quota Exceeded. Please contact support.",
            402,
            "INSUFFICIENT_FUNDS"
          );
        }

        // 2. Handle "Unauthorized" (Bad API Key in .env)
        // We throw 500 because this is a Server Config error, not the User's fault.
        if (status === 401) {
          throw new AppError(
            "Internal Configuration Error (SEO Provider)",
            500,
            "CONFIG_ERROR"
          );
        }

        // 3. Handle Rate Limits
        if (status === 429) {
          throw new AppError(
            "Too many requests, please try again later",
            429,
            "RATE_LIMIT"
          );
        }

        // 4. Generic External API Fail
        throw new AppError(
          `External API Error: ${apiMsg}`,
          502,
          "EXTERNAL_API_ERROR"
        );
      }

      // Fallback for non-axios errors
      throw new AppError(
        "Failed to process keyword data",
        500,
        "INTERNAL_ERROR"
      );
    }
  }
}

export const seoService = new SeoService();
