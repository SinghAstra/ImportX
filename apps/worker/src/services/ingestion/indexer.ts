import { prisma } from "@repo/db";
import { FILE_SUMMARY_STATUS, REPOSITORY_STATUS } from "@repo/shared";
import { ScanStats } from "./types";

const chunkArray = <T>(array: T[], size: number): T[][] => {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size)
  );
};

export async function syncFileIndex(repoId: string, stats: ScanStats) {
  console.log(`\n🔄 [Indexer] Starting synchronization for repo: ${repoId}`);

  const existingDBFiles = await prisma.repositoryFile.findMany({
    where: { repositoryId: repoId },
  });

  console.log(`📊 [Indexer] Found ${existingDBFiles.length} existing files.`);

  const dbFileMap = new Map(
    existingDBFiles.map((f) => [f.relativePath.replace(/\\/g, "/"), f])
  );

  const scannedFiles = stats.collectedFiles.map((f) => ({
    ...f,
    normalizedPath: f.relativePath.replace(/\\/g, "/"),
  }));

  const fsPaths = new Set(scannedFiles.map((f) => f.normalizedPath));

  const addedFiles = scannedFiles.filter(
    (f) => !dbFileMap.has(f.normalizedPath)
  );

  const modifiedFiles = scannedFiles.filter((f) => {
    const match = dbFileMap.get(f.normalizedPath);

    return match && match.hash !== f.hash;
  });

  const deletedFiles = existingDBFiles.filter(
    (f) => !fsPaths.has(f.relativePath.replace(/\\/g, "/"))
  );

  console.log(
    `🧮 [Indexer] Diff: ➕ ${addedFiles.length} | 📝 ${modifiedFiles.length} | ❌ ${deletedFiles.length}`
  );

  await prisma.repository.update({
    where: { id: repoId },
    data: {
      status: REPOSITORY_STATUS.PROCESSING,
      totalFiles: stats.totalFiles,
      supportedFiles: stats.supportedFiles,
      ignoredFiles: stats.ignoredFiles,
      totalFolders: stats.totalFolders,
      totalSize: stats.totalSize,
    },
  });

  if (deletedFiles.length > 0) {
    console.log(`🗑️ [Indexer] Deleting ${deletedFiles.length} stale files...`);

    const deleteChunks = chunkArray(
      deletedFiles.map((f) => f.id),
      500
    );

    for (const chunk of deleteChunks) {
      await prisma.repositoryFile.deleteMany({
        where: { id: { in: chunk } },
      });
    }
  }

  if (addedFiles.length > 0) {
    console.log(`📥 [Indexer] Inserting ${addedFiles.length} new files...`);

    const addChunks = chunkArray(addedFiles, 500);

    for (const chunk of addChunks) {
      await prisma.repositoryFile.createMany({
        data: chunk.map((file) => ({
          repositoryId: repoId,
          relativePath: file.relativePath,
          extension: file.extension,
          size: file.size,
          hash: file.hash,
          summaryStatus: FILE_SUMMARY_STATUS.PENDING,
        })),
        skipDuplicates: true,
      });
    }
  }

  if (modifiedFiles.length > 0) {
    console.log(
      `🔄 [Indexer] Updating ${modifiedFiles.length} modified files...`
    );

    const updateChunks = chunkArray(modifiedFiles, 50);

    for (const chunk of updateChunks) {
      await Promise.all(
        chunk.map((file) =>
          prisma.repositoryFile.updateMany({
            where: { repositoryId: repoId, relativePath: file.relativePath },
            data: {
              hash: file.hash,
              size: file.size,
              summary: null,
              summaryStatus: FILE_SUMMARY_STATUS.PENDING,
            },
          })
        )
      );
    }
  }

  console.log(`✅ [Indexer] Synchronization completed successfully.`);

  // 1.Auto-recover previously failed files
  // If a file failed in a previous run (e.g., API timeout), reset it so we try again.
  const resetResult = await prisma.repositoryFile.updateMany({
    where: {
      repositoryId: repoId,
      summaryStatus: FILE_SUMMARY_STATUS.FAILED,
    },
    data: {
      summaryStatus: FILE_SUMMARY_STATUS.PENDING,
    },
  });

  if (resetResult.count > 0) {
    console.log(
      `♻️ [Indexer] Auto-recovered ${resetResult.count} previously FAILED files back to PENDING for retry.`
    );
  }

  // 2. Grab EVERYTHING that is pending (new additions, modified files, and auto-recovered files)
  const targetsToQueue = await prisma.repositoryFile.findMany({
    where: {
      repositoryId: repoId,
      summaryStatus: FILE_SUMMARY_STATUS.PENDING,
    },
    select: { id: true },
  });

  console.log(
    `🎯 [Indexer] Found ${targetsToQueue.length} total files requiring AI analysis.`
  );

  return {
    addedCount: addedFiles.length,
    modifiedCount: modifiedFiles.length,
    deletedCount: deletedFiles.length,
    targetsToQueue,
  };
}
