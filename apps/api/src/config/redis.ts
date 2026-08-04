import { Redis } from "ioredis";
import { env } from "./env.js";

export const redisConnection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

redisConnection.on("connect", () => {
  console.log("🔌 Redis primary connection link established.");
});

redisConnection.on("ready", () => {
  console.log("✅ Redis primary cluster status: READY");
});

redisConnection.on("error", (error) => {
  console.error("🚨 Redis primary connection fault detected:", {
    message: error.message,
  });
});
