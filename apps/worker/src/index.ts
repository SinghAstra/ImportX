import { wipeAllQueues } from "@repo/shared/server";
import { initializeDistributedQueue } from "./ai/queue";

async function bootstrap() {
  await initializeDistributedQueue();

  console.log(
    "🚀 Custom concurrency queue tracking systems initialized cleanly."
  );
}

void bootstrap();

await wipeAllQueues();

export * from "./workers/ingestion.worker";

// export * from "./workers/summarization.worker";

export * from "./workers/dependency.worker";
