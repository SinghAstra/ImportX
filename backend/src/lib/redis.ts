import { env } from "@/config/env";
import Redis from "ioredis";

// Create a single instance
export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3, // Fail fast if Redis is down
});

// global listeners for debugging
redis.on("connect", () => console.log("🔌 Redis Connected"));
redis.on("error", (err) => console.error("❌ Redis Error:", err));
