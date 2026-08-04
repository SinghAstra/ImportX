// import { wipeAllQueues } from "@repo/shared/server";
import { initializeDistributedQueue } from "./ai/queue.js";

async function bootstrap() {
  await initializeDistributedQueue();

  console.log(
    "🚀 Custom concurrency queue tracking systems initialized cleanly."
  );
}

void bootstrap();

// await wipeAllQueues();

export * from "./workers/ingestion.worker.js";

export * from "./workers/summarization.worker.js";
