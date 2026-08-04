import { logError, QUEUE_NAMES, RepoIngestionJobData } from "@repo/shared";
import { redisConnection } from "@repo/shared/server";
import { Worker, type Job } from "bullmq";
import { ingestor } from "../services/ingestion/ingestor";

export const repositoryIngestionWorker = new Worker<RepoIngestionJobData>(
  QUEUE_NAMES.REPOSITORY_INGESTION,
  async (job: Job<RepoIngestionJobData>) => {
    const { jobId } = job.data;

    await ingestor.run(jobId);
  },
  {
    connection: redisConnection,
    concurrency: 4,
    lockDuration: 300000,
  }
);

repositoryIngestionWorker.on("failed", (job, error) => {
  logError(error);
});
