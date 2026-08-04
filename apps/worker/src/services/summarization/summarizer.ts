import { prisma } from "@repo/db";
import { FILE_SUMMARY_STATUS, JOB_STATUS, logError } from "@repo/shared";
import fs from "node:fs/promises";
import path from "node:path";
import { estimateTokenCount, MODEL_CONFIG } from "../../ai/model-config";
import { classifyByPath, classifyByContent } from "../../utils/file-classifier";
import { getWorkspacePath } from "../../utils/workspace";

import { summarizeChunked, summarizeDirectly } from "./generator";
import { syncProgress } from "./progress";

export const summarizer = {
  async summarizeFile(
    fileId: string,
    repositoryId: string,
    jobId: string,
    runId: number
  ) {
    console.log(
      `\n📄 [Summarizer] [Run ${runId}] Processing File ID: ${fileId}`
    );

    // ✨ KILL-SWITCH: Verifying parent job status before doing ANY expensive work
    console.log(
      `⚙️ [Summarizer DB] [Run ${runId}] Verifying parent job ${jobId} status...`
    );

    const activeJob = await prisma.job.findUnique({
      where: { id: jobId },
      select: { status: true },
    });

    if (!activeJob || activeJob.status === JOB_STATUS.CANCELLED) {
      console.log(
        `🛑 [Summarizer] [Run ${runId}] Job ${jobId} was CANCELLED. Bailing out instantly.`
      );

      return;
    }

    const file = await prisma.repositoryFile.findUnique({
      where: { id: fileId },
    });

    const repo = await prisma.repository.findUnique({
      where: { id: repositoryId },
    });

    if (!file || !repo) {
      console.error(
        `❌ [Summarizer DB] Missing records for File: ${fileId} or Repo: ${repositoryId}`
      );

      throw new Error(
        `SUMMARIZATION_ERROR: Missing records for File: ${fileId} or Repo: ${repositoryId}`
      );
    }

    console.log(
      `⚙️ [Summarizer DB] [Run ${runId}] Setting status to PROCESSING for ${file.relativePath}...`
    );

    await prisma.repositoryFile.update({
      where: { id: fileId },
      data: { summaryStatus: FILE_SUMMARY_STATUS.PROCESSING },
    });

    try {
      const fileName = path.basename(file.relativePath);

      const pathClassification = classifyByPath(file.relativePath, fileName);

      if (!pathClassification.shouldSummarizeWithAI) {
        console.log(
          `⚡ [Summarizer] [Run ${runId}] FAST-TRACK | Bypassed read & AI for ${pathClassification.category}: ${file.relativePath}`
        );

        await prisma.repositoryFile.update({
          where: { id: fileId },
          data: {
            summary: pathClassification.staticSummary,
            summaryStatus: FILE_SUMMARY_STATUS.COMPLETED,
          },
        });

        await syncProgress(repositoryId, jobId);

        return;
      }

      const workspacePath = getWorkspacePath(repositoryId);

      const absoluteFilePath = path.join(workspacePath, file.relativePath);

      const fileContent = await fs.readFile(absoluteFilePath, "utf8");

      const contentClassification = classifyByContent(fileName, fileContent);

      if (!contentClassification.shouldSummarizeWithAI) {
        console.log(
          `⚡ [Summarizer] [Run ${runId}] FAST-TRACK | Bypassed AI overhead for ${contentClassification.category}: ${file.relativePath}`
        );

        await prisma.repositoryFile.update({
          where: { id: fileId },
          data: {
            summary: contentClassification.staticSummary,
            summaryStatus: FILE_SUMMARY_STATUS.COMPLETED,
          },
        });

        await syncProgress(repositoryId, jobId);

        return;
      }

      const contentTokens = estimateTokenCount(fileContent);

      const promptTokens = 350;

      const totalEstimatedTokens = contentTokens + promptTokens;

      let summaryText = "";

      if (totalEstimatedTokens > MODEL_CONFIG.maxInputTokens) {
        summaryText = await summarizeChunked(
          runId,
          file.relativePath,
          fileContent
        );
      } else {
        summaryText = await summarizeDirectly(
          runId,
          file.relativePath,
          fileContent
        );
      }

      console.log(
        `⚙️ [Summarizer DB] [Run ${runId}] Saving COMPLETED summary for ${file.relativePath}...`
      );

      await prisma.repositoryFile.update({
        where: { id: fileId },
        data: {
          summary: summaryText,
          summaryStatus: FILE_SUMMARY_STATUS.COMPLETED,
        },
      });

      console.log(
        `✅ [Summarizer DB] Summary successfully saved for ${file.relativePath}`
      );

      await syncProgress(repositoryId, jobId);
    } catch (error) {
      console.error(
        `💥 [Summarizer] Failed processing file ${file.relativePath}:`,
        error
      );

      logError(error);

      console.log(
        `⚙️ [Summarizer DB] [Run ${runId}] Setting status to FAILED for ${file.relativePath}...`
      );

      await prisma.repositoryFile.update({
        where: { id: fileId },
        data: { summaryStatus: FILE_SUMMARY_STATUS.FAILED },
      });

      await syncProgress(repositoryId, jobId);

      throw error;
    }
  },
};
