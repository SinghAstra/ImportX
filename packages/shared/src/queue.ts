import { Queue, QueueOptions } from "bullmq";
import { redisConnection } from "./config/redis";
import { QUEUE_NAMES } from "./constants";
import { FileSummarizationJobData, RepoIngestionJobData } from "./schemas";

const queueOptions: QueueOptions = {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
};

export const repositoryIngestionQueue = new Queue<RepoIngestionJobData>(
  QUEUE_NAMES.REPOSITORY_INGESTION,
  queueOptions
);

export const fileSummarizationQueue = new Queue<FileSummarizationJobData>(
  QUEUE_NAMES.FILE_SUMMARIZATION,
  queueOptions
);

export async function deleteAllJobsInQueue(queue: Queue) {
  try {
    console.log(`⏸️ Pausing queue ${queue.name} for cleanup...`);

    await queue.pause();

    await queue.obliterate({ force: true });

    await queue.resume();

    console.log(`🧹 Successfully obliterated all jobs in queue: ${queue.name}`);
  } catch (error) {
    console.error(`🚨 Failed to clear queue ${queue.name}:`, error);
  }
}

export async function wipeAllQueues() {
  console.log("🔥 Initiating full queue wipe...");

  await Promise.all([
    deleteAllJobsInQueue(repositoryIngestionQueue),
    deleteAllJobsInQueue(fileSummarizationQueue),
  ]);

  console.log("✨ All queues have been completely cleared.");
}
