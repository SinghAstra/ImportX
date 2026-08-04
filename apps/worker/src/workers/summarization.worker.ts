import { FileSummarizationJobData, logError, QUEUE_NAMES } from "@repo/shared";
import { redisConnection } from "@repo/shared/server";
import { Worker, type Job } from "bullmq";
import { summarizer } from "../services/summarization/summarizer";

export const fileSummarizationWorker = new Worker<FileSummarizationJobData>(
  QUEUE_NAMES.FILE_SUMMARIZATION,
  async (job: Job<FileSummarizationJobData>) => {
    const { fileId, repositoryId, jobId, runId } = job.data;

    await summarizer.summarizeFile(fileId, repositoryId, jobId, runId);
  },
  {
    connection: redisConnection,
    concurrency: 5,
    lockDuration: 300000,
  }
);

fileSummarizationWorker.on("failed", (job, error) => {
  logError(error);
});
