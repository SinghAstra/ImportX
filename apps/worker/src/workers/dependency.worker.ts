import { logError, QUEUE_NAMES, DependencyAnalysisJobData } from "@repo/shared";
import { redisConnection } from "@repo/shared/server";
import { Worker, type Job } from "bullmq";
import { dependencyAnalyzer } from "../services/dependency/analyzer";

export const dependencyAnalysisWorker = new Worker<DependencyAnalysisJobData>(
  QUEUE_NAMES.DEPENDENCY_ANALYSIS,
  async (job: Job<DependencyAnalysisJobData>) => {
    const { jobId, repositoryId } = job.data;

    await dependencyAnalyzer.run(jobId, repositoryId);
  },
  {
    connection: redisConnection,
    concurrency: 2,
    lockDuration: 300000,
  }
);

dependencyAnalysisWorker.on("failed", (job, error) => {
  logError(error);
});
