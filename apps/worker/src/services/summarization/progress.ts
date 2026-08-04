import { prisma } from "@repo/db";
import {
  FILE_SUMMARY_STATUS,
  JOB_STATUS,
  REPOSITORY_STATUS,
} from "@repo/shared";
import { trackProgress } from "@repo/shared/server";

export async function syncProgress(repositoryId: string, jobId: string) {
  console.log(
    `⚙️ [Summarizer DB] Fetching total file count for repo ${repositoryId}...`
  );

  const totalCount = await prisma.repositoryFile.count({
    where: { repositoryId },
  });

  console.log(
    `⚙️ [Summarizer DB] Fetching completed file count for repo ${repositoryId}...`
  );

  const completedCount = await prisma.repositoryFile.count({
    where: { repositoryId, summaryStatus: FILE_SUMMARY_STATUS.COMPLETED },
  });

  console.log(
    `⚙️ [Summarizer DB] Fetching failed file count for repo ${repositoryId}...`
  );

  const failedCount = await prisma.repositoryFile.count({
    where: { repositoryId, summaryStatus: FILE_SUMMARY_STATUS.FAILED },
  });

  const processedCount = completedCount + failedCount;

  console.log(
    `📊 [Progress] Repo ${repositoryId}: ${processedCount}/${totalCount} processed (${completedCount} passed, ${failedCount} failed)`
  );

  await trackProgress({
    jobId,
    repositoryId,
    status: JOB_STATUS.RUNNING,
    message: `Analyzing files... (${completedCount}/${totalCount})`,
  });

  if (completedCount === totalCount) {
    console.log(
      `⚙️ [Summarizer DB] All files processed. Updating repo ${repositoryId} status to SUCCESS...`
    );

    await prisma.repository.update({
      where: { id: repositoryId },
      data: { status: REPOSITORY_STATUS.COMPLETED },
    });

    console.log(
      `⚙️ [Summarizer DB] Updating job ${jobId} status to COMPLETED...`
    );

    await prisma.job.update({
      where: { id: jobId },
      data: { status: JOB_STATUS.COMPLETED, completedAt: new Date() },
    });

    await trackProgress({
      jobId,
      repositoryId,
      status: JOB_STATUS.COMPLETED,
      message: "All done! Your project overview is completely ready.",
    });

    console.log(`✅ [Summarizer DB] Repo & Job successfully finalized.`);
  }
}
