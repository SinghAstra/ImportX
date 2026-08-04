import { prisma } from "@repo/db";
import {
  JOB_NAMES,
  JOB_STATUS,
  REPOSITORY_STATUS,
  logError,
} from "@repo/shared";
import { dependencyAnalysisQueue, trackProgress } from "@repo/shared/server";
import { getWorkspacePath } from "../../utils/workspace";

import { cloneRepository } from "./git";
import { scanWorkspace } from "./scanner";
import { syncFileIndex } from "./indexer";
import { ScanStats } from "./types";

export const ingestor = {
  async run(jobId: string) {
    console.log(`\n🚀 [Ingestor] Starting pipeline for Job: ${jobId}`);

    // 1. Fetch Job
    console.log(`⚙️ [Ingestor DB] Fetching job ${jobId}...`);

    const job = await prisma.job.findUnique({ where: { id: jobId } });

    if (!job) {
      console.log(`❌ [Ingestor DB] Job ${jobId} not found. Aborting.`);

      return;
    }

    // ✨ KILL-SWITCH 1: Check if cancelled before we even start
    if (job.status === JOB_STATUS.CANCELLED) {
      console.log(
        `🛑 [Ingestor] Job ${jobId} was already CANCELLED. Aborting before clone.`
      );

      return;
    }

    // 2. Fetch Repository
    console.log(`⚙️ [Ingestor DB] Fetching repository ${job.repositoryId}...`);

    const repo = await prisma.repository.findUnique({
      where: { id: job.repositoryId },
    });

    if (!repo) {
      console.log(
        `❌ [Ingestor DB] Repository ${job.repositoryId} not found. Aborting.`
      );

      return;
    }

    const workspacePath = getWorkspacePath(repo.id);

    try {
      // 3. Mark Job as Running
      console.log(
        `⚙️ [Ingestor DB] Updating job ${jobId} status to RUNNING...`
      );

      await prisma.job.update({
        where: { id: jobId },
        data: { status: JOB_STATUS.RUNNING, startedAt: new Date() },
      });

      console.log(`✅ [Ingestor DB] Job status updated.`);

      await trackProgress({
        jobId,
        repositoryId: repo.id,
        status: JOB_STATUS.RUNNING,
        message: "Synchronizing workspace...",
      });

      // 4. Pull Code
      await cloneRepository(workspacePath, repo.githubUrl);

      await trackProgress({
        jobId,
        repositoryId: repo.id,
        status: JOB_STATUS.RUNNING,
        message: "Scanning files...",
      });

      // 5. Scan Filesystem
      const stats: ScanStats = {
        totalFiles: 0,
        supportedFiles: 0,
        ignoredFiles: 0,
        totalFolders: 0,
        totalSize: BigInt(0),
        collectedFiles: [],
      };

      await scanWorkspace(workspacePath, workspacePath, stats);

      // 6. Sync File State to DB
      const { addedCount, modifiedCount, deletedCount } = await syncFileIndex(
        repo.id,
        stats
      );

      // ✨ KILL-SWITCH 2: Check if cancelled during the clone/scan phase
      console.log(
        `⚙️ [Ingestor DB] Verifying job ${jobId} wasn't cancelled during processing...`
      );

      const currentJobState = await prisma.job.findUnique({
        where: { id: jobId },
        select: { status: true },
      });

      if (currentJobState?.status === JOB_STATUS.CANCELLED) {
        console.log(
          `🛑 [Ingestor] Job ${jobId} was CANCELLED while processing. Aborting dispatch.`
        );

        return;
      }

      await trackProgress({
        jobId,
        repositoryId: repo.id,
        status: JOB_STATUS.RUNNING,
        message: `Updated index (${addedCount} added, ${modifiedCount} modified, ${deletedCount} deleted)...`,
      });

      // 7. Dispatch or Complete

      // ✨ IMPORTX FAST-TRACK: We are commenting out the AI summarization dispatch
      // and forcing the pipeline to immediately complete after indexing the files.

      /* 
      if (targetsToQueue.length > 0) {
        await dispatchSummaryJobs(repo.id, jobId, targetsToQueue);

        await trackProgress({
          jobId,
          repositoryId: repo.id,
          status: JOB_STATUS.RUNNING,
          message: `Initializing AI analysis for ${targetsToQueue.length} files...`,
        });
      } else { 
      */
      // 7. Dispatch Dependency Analysis
      console.log(
        `⚙️ [Ingestor DB] Bypassing AI summaries. Triggering Dependency Analysis...`
      );

      await dependencyAnalysisQueue.add(JOB_NAMES.ANALYZE_DEPENDENCIES, {
        repositoryId: repo.id,
        jobId: jobId,
      });

      await trackProgress({
        jobId,
        repositoryId: repo.id,
        status: JOB_STATUS.RUNNING,
        message: "File indexing complete. Starting AST dependency analysis...",
      });

      // }
    } catch (error) {
      logError(error);

      console.log(`⚙️ [Ingestor DB] Updating job ${jobId} to FAILED...`);

      await prisma.job.update({
        where: { id: jobId },
        data: { status: JOB_STATUS.FAILED },
      });

      console.log(`⚙️ [Ingestor DB] Updating repo ${repo.id} to FAILED...`);

      await prisma.repository.update({
        where: { id: repo.id },
        data: { status: REPOSITORY_STATUS.FAILED },
      });

      console.log(`✅ [Ingestor DB] Failure states saved.`);

      await trackProgress({
        jobId,
        repositoryId: repo.id,
        status: JOB_STATUS.FAILED,
        message: "Process failed. Please try again.",
      });

      throw error;
    }
  },
};
