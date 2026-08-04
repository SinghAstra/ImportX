import { prisma } from "@repo/db";
import { COMMON_ERROR_CODES, GetJobLogsResponse } from "@repo/shared";
import { NotFoundError } from "../errors/api-errors.js";

export const jobService = {
  async getJobLogsById(jobId: string): Promise<GetJobLogsResponse> {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        logs: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!job) {
      throw new NotFoundError(
        COMMON_ERROR_CODES.RESOURCE_NOT_FOUND,
        "Job not found."
      );
    }

    return {
      status: job.status,
      logs: job.logs.map((log) => ({
        id: log.id,
        jobId: log.jobId,
        message: log.message,
        createdAt: log.createdAt.toISOString(),
      })),
    };
  },
};
