import { env } from "@/config/env";
import { redis } from "@/lib/redis";
import { logError } from "@/utils/error";
import axios, { AxiosInstance } from "axios";
import Redis from "ioredis";
import { DataForSeoResponse, KeywordMetrics } from "./types";

export class SeoService {
  private client: AxiosInstance;
  private redis: Redis;
  private readonly CACHE_TTL = 60 * 60 * 24; // 24 Hours in seconds

  constructor() {
    // 1. Use the global singleton
    this.redis = redis;

    // 2. Initialize DataForSEO Client
    // We use the 'google_ads' endpoint
    this.client = axios.create({
      baseURL: "https://api.dataforseo.com/v3",
      auth: {
        username: env.DATAFORSEO_LOGIN,
        password: env.DATAFORSEO_PASSWORD,
      },
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * Fetches keyword data with a "Cache-First" strategy.
   */
  async getKeywordAnalysis(keyword: string): Promise<KeywordMetrics | null> {
    const cleanKeyword = keyword.trim().toLowerCase();
    const cacheKey = `seo:keyword:${cleanKeyword}`;

    // A. Check Cache (The Wallet Saver)
    const cachedData = await this.redis.get(cacheKey);
    if (cachedData) {
      console.log(`🟢 Cache HIT for: ${cleanKeyword}`);
      return JSON.parse(cachedData);
    }

    console.log(`🟡 Cache MISS for: ${cleanKeyword}. Calling DataForSEO...`);

    try {
      // B. Call API (The Eyes)
      // Endpoint: Google Ads Search Volume Live
      const payload = [
        {
          location_code: 2840, // US
          language_code: "en", // English
          keywords: [cleanKeyword],
          include_adult_keywords: false,
        },
      ];

      const response = await this.client.post<DataForSeoResponse>(
        "/keywords_data/google_ads/search_volume/live",
        payload
      );

      // C. Parse & Validate Response
      // DataForSEO nests data deep inside 'tasks' -> 'result'
      const task = response.data.tasks[0];

      if (!task || !task.result || task.result.length === 0) {
        console.warn(`⚠️ No data found for keyword: ${cleanKeyword}`);
        return null;
      }

      const rawResult = task.result[0];

      // Map to our clean interface
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
      // Handle API Errors gracefully
      logError(error);
      throw new Error("Failed to fetch keyword data.");
    }
  }
}

// Export a singleton instance
export const seoService = new SeoService();
