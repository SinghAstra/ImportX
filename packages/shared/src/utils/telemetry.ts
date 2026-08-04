import { prisma } from "@repo/db";

import { redisConnection } from "../config/redis";
import { TelemetryEvent } from "../responses";
import { JobStatus } from "../schemas";
import { getJobTelemetryChannel } from "./get-job-telemetry-channel";

interface TelemetryOptions {
  jobId: string;
  repositoryId: string;
  status: JobStatus;
  message: string;
}

export async function trackProgress({
  jobId,
  repositoryId,
  status,
  message,
}: TelemetryOptions) {
  await prisma.jobLog.create({
    data: { jobId, message },
  });

  const channelCoordinate = getJobTelemetryChannel(jobId);

  const eventPayload: TelemetryEvent = {
    repositoryId,
    status,
    message,
    timestamp: new Date().toISOString(),
  };

  console.log("eventPayload is ", eventPayload);

  await redisConnection.publish(
    channelCoordinate,
    JSON.stringify(eventPayload)
  );
}
