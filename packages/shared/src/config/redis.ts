import dotenv from "dotenv";
import { Redis } from "ioredis";

dotenv.config();

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error(
    "🚨 [REDIS ENGINE FAULT] process.env.REDIS_URL is completely undefined.\n" +
      "   Ensure your application entry point calls 'dotenv.config()' and runs its " +
      "   validation layers BEFORE importing any components from the shared library bundle."
  );
}

export const redisConnection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  family: 4,
  tls: {
    rejectUnauthorized: false,
  },
});

export const queueSubscriber = redisConnection.duplicate();

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

queueSubscriber.on("connect", () => {
  console.log("🔌 Redis subscriber connection link established.");
});

queueSubscriber.on("error", (error) => {
  console.error("🚨 Redis subscriber connection fault detected:", {
    message: error.message,
  });
});
