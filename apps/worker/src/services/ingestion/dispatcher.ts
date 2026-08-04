import { JOB_NAMES } from "@repo/shared";
import { fileSummarizationQueue } from "@repo/shared/server";

export async function dispatchSummaryJobs(
  repoId: string,
  jobId: string,
  fileIds: Array<{ id: string }>
) {
  if (fileIds.length === 0) return;

  const BATCH_SIZE = 50;

  let runIdCounter = 1;

  console.log(
    `🚂 [Dispatcher] Batching ${fileIds.length} jobs (Max ${BATCH_SIZE} per batch)...`
  );

  for (let i = 0; i < fileIds.length; i += BATCH_SIZE) {
    const chunk = fileIds.slice(i, i + BATCH_SIZE);

    await Promise.all(
      chunk.map((file) => {
        const currentRunId = runIdCounter++;

        return fileSummarizationQueue.add(JOB_NAMES.SUMMARIZE_FILE, {
          fileId: file.id,
          repositoryId: repoId,
          jobId: jobId,
          runId: currentRunId,
        });
      })
    );

    if (i + BATCH_SIZE < fileIds.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  console.log(`✅ [Dispatcher] Successfully queued ${fileIds.length} files.`);
}
