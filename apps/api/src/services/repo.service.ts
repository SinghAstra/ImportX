import crypto from "node:crypto";
import { prisma } from "@repo/db";
import {
  COMMON_ERROR_CODES,
  FILE_SUMMARY_STATUS,
  GetRepositoriesResponse,
  GetRepositoryResponse,
  JOB_NAMES,
  JOB_STATUS,
  parseGitHubUrl,
  REPO_ERROR_CODES,
  REPOSITORY_STATUS,
  RepositoryTreeNode,
} from "@repo/shared";
import { repositoryIngestionQueue, trackProgress } from "@repo/shared/server";
import { BadRequestError, NotFoundError } from "../errors/api-errors.js";
import { buildRepositoryTree } from "../lib/build-tree.js";

interface IngestParams {
  readonly userId: string;
  readonly githubUrl: string;
}

const chunkArray = <T>(array: T[], size: number): T[][] => {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size)
  );
};

export const repositoryService = {
  async createRepository(params: IngestParams) {
    const { userId, githubUrl: rawGithubUrl } = params;

    let owner: string;

    let name: string;

    let normalizedGithubUrl: string;

    try {
      const parsed = parseGitHubUrl(rawGithubUrl);

      owner = parsed.owner.toLowerCase();

      name = parsed.name.toLowerCase();

      normalizedGithubUrl = `https://github.com/${owner}/${name}`;
    } catch {
      throw new BadRequestError(
        COMMON_ERROR_CODES.SCHEMA_MISMATCH,
        "Invalid GitHub URL format."
      );
    }

    console.log(
      `⚙️ [Repository Service DB] Checking duplicate repo for user ${userId}...`
    );

    const existingRepo = await prisma.repository.findFirst({
      where: {
        userId,
        githubUrl: normalizedGithubUrl,
      },
    });

    if (existingRepo) {
      console.log(
        `ℹ️ [Repository Service] Found existing repository: ${existingRepo.id}`
      );

      return { repositoryId: existingRepo.id, isDuplicate: true };
    }

    try {
      const pingResponse = await fetch(normalizedGithubUrl, {
        method: "HEAD",
        redirect: "follow",
      });

      if (!pingResponse.ok) throw new Error();
    } catch {
      throw new BadRequestError(
        REPO_ERROR_CODES.REPOSITORY_UNREACHABLE,
        "Repository unreachable or private."
      );
    }

    const repositoryId = crypto.randomUUID();

    const repositoryAvatarUrl = `https://github.com/${owner}.png`;

    console.log(
      `⚙️ [Repository Service DB] Creating repository record ${repositoryId}...`
    );

    const newRepo = await prisma.repository.create({
      data: {
        id: repositoryId,
        userId,
        githubUrl: normalizedGithubUrl,
        name,
        owner,
        avatar: repositoryAvatarUrl,
        status: REPOSITORY_STATUS.PENDING,
      },
    });

    console.log(`⚙️ [Repository Service DB] Creating initial job record...`);

    const job = await prisma.job.create({
      data: {
        repositoryId: newRepo.id,
        status: JOB_STATUS.PENDING,
      },
    });

    await repositoryIngestionQueue.add(JOB_NAMES.ANALYZE_REPO, {
      jobId: job.id,
      repositoryId: newRepo.id,
    });

    console.log(
      `✅ [Repository Service] Enqueued repo analysis job: ${job.id}`
    );

    return { repositoryId: newRepo.id, isDuplicate: false };
  },

  async getRepositoryFiles(
    id: string,
    userId: string
  ): Promise<RepositoryTreeNode[]> {
    console.log(
      `⚙️ [Repository Service DB] Validating access for repo ${id}...`
    );

    const repo = await prisma.repository.findFirst({
      where: { id, userId },
    });

    if (!repo) {
      throw new NotFoundError(
        COMMON_ERROR_CODES.ROUTE_NOT_FOUND,
        "Repository not found."
      );
    }

    console.log(`⚙️ [Repository Service DB] Fetching files for repo ${id}...`);

    const flatFiles = await prisma.repositoryFile.findMany({
      where: { repositoryId: id },
      orderBy: { relativePath: "asc" },
    });

    const incompleteFiles = flatFiles.filter(
      (file) => file.summaryStatus !== FILE_SUMMARY_STATUS.COMPLETED
    );

    if (incompleteFiles.length > 0) {
      console.log(
        `⚙️ [DB-Explorer Debug] ${incompleteFiles.length} incomplete files remaining for repo ${id}. Sample:`
      );

      incompleteFiles.slice(0, 5).forEach((file) => {
        console.log(
          `  ↳ 📄 Path: ${file.relativePath} | Status: [${file.summaryStatus}]`
        );
      });
    } else {
      console.log(
        `⚙️ [DB-Explorer Debug] All file summaries for repository ${id} are completed.`
      );
    }

    return buildRepositoryTree(flatFiles);
  },

  async getRepositoryDetail(
    id: string,
    userId: string
  ): Promise<GetRepositoryResponse> {
    console.log(
      `⚙️ [Repository Service DB] Fetching details for repo ${id}...`
    );

    const repo = await prisma.repository.findFirst({
      where: { id, userId },
      include: {
        jobs: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { id: true },
        },
      },
    });

    if (!repo) {
      throw new NotFoundError(
        COMMON_ERROR_CODES.ROUTE_NOT_FOUND,
        "Repository not found or access denied."
      );
    }

    return {
      id: repo.id,
      userId: repo.userId,
      githubUrl: repo.githubUrl,
      name: repo.name,
      owner: repo.owner,
      avatar: repo.avatar,
      status: repo.status,
      readme: repo.readme,
      latestJobId: repo.jobs[0]?.id || null,
      createdAt: repo.createdAt.toISOString(),
      updatedAt: repo.updatedAt.toISOString(),
    };
  },

  async getRepositoriesByUserId(
    userId: string
  ): Promise<GetRepositoriesResponse> {
    console.log(
      `⚙️ [Repository Service DB] Fetching all repos for user ${userId}...`
    );

    const records = await prisma.repository.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return records.map((repo) => ({
      id: repo.id,
      userId: repo.userId,
      githubUrl: repo.githubUrl,
      name: repo.name,
      owner: repo.owner,
      avatar: repo.avatar,
      status: repo.status,
      readme: repo.readme,
      latestJobId: null,
      createdAt: repo.createdAt.toISOString(),
      updatedAt: repo.updatedAt.toISOString(),
    }));
  },

  async resyncRepository(
    id: string,
    userId: string
  ): Promise<{ jobId: string }> {
    console.log(
      `⚙️ [Repository Service DB] Validating access for repo ${id}...`
    );

    const repo = await prisma.repository.findFirst({
      where: { id, userId },
      include: {
        jobs: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!repo) {
      throw new NotFoundError(
        COMMON_ERROR_CODES.ROUTE_NOT_FOUND,
        "Repository not found."
      );
    }

    const latestJob = repo.jobs[0] ?? null;

    if (latestJob && latestJob.status === JOB_STATUS.RUNNING) {
      console.log(
        `⚙️ [Repository Service DB] Cancelling stale running job ${latestJob.id}...`
      );

      await prisma.job.update({
        where: { id: latestJob.id },
        data: { status: JOB_STATUS.CANCELLED, cancelledAt: new Date() },
      });
    }

    console.log(`⚙️ [Repository Service DB] Creating new resync job...`);

    const newJob = await prisma.job.create({
      data: {
        repositoryId: id,
        status: JOB_STATUS.RUNNING,
      },
    });

    console.log(
      `⚙️ [Repository Service DB] Updating repo ${id} status to PROCESSING...`
    );

    await prisma.repository.update({
      where: { id },
      data: { status: REPOSITORY_STATUS.PROCESSING },
    });

    await repositoryIngestionQueue.add(JOB_NAMES.ANALYZE_REPO, {
      jobId: newJob.id,
      repositoryId: id,
    });

    console.log(`✅ [Repository Service] Resync job queued: ${newJob.id}`);

    return { jobId: newJob.id };
  },

  async boostRepository(id: string, userId: string) {
    console.log(
      `⚙️ [Repository Service DB] Fetching repository and latest job for boost...`
    );

    const repo = await prisma.repository.findFirst({
      where: { id, userId },
      include: {
        jobs: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!repo) {
      throw new NotFoundError(
        COMMON_ERROR_CODES.ROUTE_NOT_FOUND,
        "Repository not found."
      );
    }

    const latestJob = repo.jobs[0] ?? null;

    if (latestJob && latestJob.status === JOB_STATUS.RUNNING) {
      console.log(
        `⚙️ [Repository Service DB] Cancelling stale running job ${latestJob.id}...`
      );

      await prisma.job.update({
        where: { id: latestJob.id },
        data: { status: JOB_STATUS.CANCELLED, cancelledAt: new Date() },
      });
    }

    console.log(
      `⚙️ [Repository Service DB] Counting incomplete files for repo ${id}...`
    );

    const incompleteCount = await prisma.repositoryFile.count({
      where: {
        repositoryId: id,
        summaryStatus: { not: FILE_SUMMARY_STATUS.COMPLETED },
      },
    });

    if (incompleteCount === 0) {
      console.log(
        `ℹ️ [Repository Service] No incomplete files found. Marking repo as COMPLETED.`
      );

      await prisma.repository.update({
        where: { id },
        data: { status: REPOSITORY_STATUS.COMPLETED },
      });

      // If we cancelled a job above but actually everything was done, we flip it back to completed
      // so the UI shows a success state instead of a cancelled state.
      if (latestJob) {
        await prisma.job.update({
          where: { id: latestJob.id },
          data: { status: JOB_STATUS.COMPLETED, completedAt: new Date() },
        });

        await trackProgress({
          jobId: latestJob.id,
          repositoryId: id,
          status: JOB_STATUS.COMPLETED,
          message: "Boost complete. All files are already processed.",
        });
      }

      return { jobId: latestJob?.id || "" };
    }

    console.log(
      `⚙️ [Repository Service DB] Creating new boost job for repo ${id}...`
    );

    const newJob = await prisma.job.create({
      data: {
        repositoryId: id,
        status: JOB_STATUS.RUNNING,
      },
    });

    await trackProgress({
      jobId: newJob.id,
      repositoryId: id,
      status: JOB_STATUS.RUNNING,
      message: "Starting Repository Boost...",
    });

    // ✨ RESET ALL UNFINISHED FILES (Catches FAILED and any stuck in PROCESSING)
    console.log(
      `⚙️ [Repository Service DB] Resetting ${incompleteCount} incomplete files to PENDING...`
    );

    const updatedRepoFiles = await prisma.repositoryFile.updateMany({
      where: {
        repositoryId: id,
        summaryStatus: { not: FILE_SUMMARY_STATUS.COMPLETED },
      },
      data: {
        summaryStatus: FILE_SUMMARY_STATUS.PENDING,
        retryCount: 0,
        lastError: null,
      },
    });

    await repositoryIngestionQueue.add(JOB_NAMES.ANALYZE_REPO, {
      jobId: newJob.id,
      repositoryId: id,
    });

    await trackProgress({
      jobId: newJob.id,
      repositoryId: id,
      status: JOB_STATUS.RUNNING,
      message: `Re-syncing workspace and queueing ${updatedRepoFiles.count} files for AI analysis...`,
    });

    console.log(
      `✅ [Repository Service] Boost completed. Queued ${updatedRepoFiles.count} files.`
    );

    return { jobId: newJob.id };
  },

  async deleteRepository(id: string, userId: string) {
    console.log(
      `⚙️ [Repository Service DB] Checking ownership for repo ${id}...`
    );

    const repo = await prisma.repository.findFirst({
      where: { id, userId },
      select: { id: true },
    });

    if (!repo) {
      throw new NotFoundError(
        REPO_ERROR_CODES.REPO_NOT_FOUND,
        "Repository not found or access denied."
      );
    }

    // Chunked deletion of child records to prevent Supabase statement timeouts
    console.log(
      `⚙️ [Repository Service DB] Fetching file IDs for safe removal...`
    );

    const files = await prisma.repositoryFile.findMany({
      where: { repositoryId: id },
      select: { id: true },
    });

    if (files.length > 0) {
      const fileChunks = chunkArray(
        files.map((f) => f.id),
        500
      );

      console.log(
        `⚙️ [Repository Service DB] Deleting ${files.length} files in ${fileChunks.length} chunk(s)...`
      );

      for (const chunk of fileChunks) {
        await prisma.repositoryFile.deleteMany({
          where: { id: { in: chunk } },
        });
      }
    }

    console.log(`⚙️ [Repository Service DB] Deleting parent repo ${id}...`);

    await prisma.repository.delete({ where: { id } });

    console.log(`✅ [Repository Service] Successfully deleted repo ${id}.`);

    return { message: "Repository successfully removed." };
  },

  async deleteMultipleRepositories(ids: string[], userId: string) {
    console.log(
      `⚙️ [Repository Service DB] Fetching ${ids.length} repos for deletion...`
    );

    const repos = await prisma.repository.findMany({
      where: { id: { in: ids }, userId },
      select: { id: true },
    });

    if (repos.length === 0) {
      return { message: "No matching repositories found to remove." };
    }

    const validRepoIds = repos.map((r) => r.id);

    console.log(
      `⚙️ [Repository Service DB] Fetching file IDs for bulk repo removal...`
    );

    const files = await prisma.repositoryFile.findMany({
      where: { repositoryId: { in: validRepoIds } },
      select: { id: true },
    });

    if (files.length > 0) {
      const fileChunks = chunkArray(
        files.map((f) => f.id),
        500
      );

      console.log(
        `⚙️ [Repository Service DB] Bulk deleting ${files.length} files in ${fileChunks.length} chunk(s)...`
      );

      for (const chunk of fileChunks) {
        await prisma.repositoryFile.deleteMany({
          where: { id: { in: chunk } },
        });
      }
    }

    console.log(
      `⚙️ [Repository Service DB] Deleting ${validRepoIds.length} parent repo records...`
    );

    await prisma.repository.deleteMany({
      where: { id: { in: validRepoIds }, userId },
    });

    console.log(
      `✅ [Repository Service] Successfully removed ${validRepoIds.length} repositories.`
    );

    return {
      message: `${validRepoIds.length} repositories successfully removed.`,
    };
  },
};
