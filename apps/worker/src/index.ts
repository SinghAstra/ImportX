import "dotenv/config";
import { wipeAllQueues } from "@repo/shared/server";
import { initializeDistributedQueue } from "./ai/queue";

async function bootstrap() {
  try {
    console.log("\n----------------------------------------");

    console.log("⚙️  Worker of import-x is starting...");

    console.log("----------------------------------------");

    await wipeAllQueues();

    console.log("✅ Redis queues wiped cleanly.");

    await initializeDistributedQueue();

    console.log("🚀 Custom concurrency queue tracking initialized.");

    await import("./workers/ingestion.worker");

    await import("./workers/dependency.worker");

    console.log(
      "✅ All Background Workers are now actively listening for jobs.\n"
    );
  } catch (error) {
    console.error("🚨 Worker FATAL ERROR during startup:", error);

    process.exit(1);
  }
}

bootstrap();
