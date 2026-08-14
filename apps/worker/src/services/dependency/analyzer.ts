import { prisma } from "@repo/db";
import { JOB_STATUS, REPOSITORY_STATUS, logError } from "@repo/shared";
import { trackProgress } from "@repo/shared/server";
import { getWorkspacePath } from "../../utils/workspace";
import { extractAndStoreGraph } from "./cruiser";

export const dependencyAnalyzer = {
  async run(jobId: string, repositoryId: string) {
    console.log(
      `\n🚀 [Analyzer] Starting Dependency Analysis for Job: ${jobId}`
    );

    const currentJobState = await prisma.job.findUnique({
      where: { id: jobId },
      select: { status: true },
    });

    if (currentJobState?.status === JOB_STATUS.CANCELLED) {
      console.log(
        `🛑 [Analyzer] Job ${jobId} was CANCELLED. Aborting analysis.`
      );

      return;
    }

    const workspacePath = getWorkspacePath(repositoryId);

    try {
      await extractAndStoreGraph(workspacePath, repositoryId, jobId);

      console.log(
        `⚙️ [Analyzer DB] Updating repo ${repositoryId} to COMPLETED...`
      );

      await prisma.repository.update({
        where: { id: repositoryId },
        data: { status: REPOSITORY_STATUS.COMPLETED },
      });

      console.log(`⚙️ [Analyzer DB] Updating job ${jobId} to COMPLETED...`);

      await prisma.job.update({
        where: { id: jobId },
        data: { status: JOB_STATUS.COMPLETED, completedAt: new Date() },
      });

      console.log(`✅ [Analyzer DB] Pipeline successfully completed.`);

      await trackProgress({
        jobId,
        repositoryId,
        status: JOB_STATUS.COMPLETED,
        message: "Dependency analysis complete. Graph is ready.",
      });
    } catch (error) {
      logError(error);

      console.log(`⚙️ [Analyzer DB] Updating job ${jobId} to FAILED...`);

      await prisma.job.update({
        where: { id: jobId },
        data: { status: JOB_STATUS.FAILED },
      });

      console.log(
        `⚙️ [Analyzer DB] Updating repo ${repositoryId} to FAILED...`
      );

      await prisma.repository.update({
        where: { id: repositoryId },
        data: { status: REPOSITORY_STATUS.FAILED },
      });

      console.log(`✅ [Analyzer DB] Failure states saved.`);

      await trackProgress({
        jobId,
        repositoryId,
        status: JOB_STATUS.FAILED,
        message: "Dependency analysis failed. Please try again.",
      });

      throw error;
    }
  },
};
