import { prisma } from "@repo/db";
import {
  AUTH_ERROR_CODES,
  COMMON_ERROR_CODES,
  JOB_STATUS,
  logError,
  telemetryEventSchema,
} from "@repo/shared";
import { getJobTelemetryChannel } from "@repo/shared/server";
import { type NextFunction, type Request, type Response } from "express";
import z from "zod";
import { redisConnection } from "../config/redis.js";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/api-errors.js";
import { jwtTokenEngine } from "../lib/jwt.js";
import { jobService } from "../services/job.service.js";
import { successResponse } from "../utils/response.js";

const SSE_RETRY_MS = 5000;

const writeSseEvent = (res: Response, payload: unknown): void => {
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
};

export const jobController = {
  async getJobLogs(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError(
          AUTH_ERROR_CODES.INVALID_CREDENTIALS,
          "Please sign in again."
        );
      }

      const idParamParse = z.string().uuid().safeParse(req.params.id);

      if (!idParamParse.success) {
        throw new BadRequestError(
          COMMON_ERROR_CODES.VALIDATION_ERROR,
          "Invalid identifier format."
        );
      }

      const logsHistory = await jobService.getJobLogsById(idParamParse.data);

      res.status(200).json(successResponse(logsHistory));
    } catch (error) {
      next(error);
    }
  },

  async streamJobTelemetry(req: Request, res: Response, next: NextFunction) {
    let telemetrySubscriber: ReturnType<
      typeof redisConnection.duplicate
    > | null = null;

    let isCleanedUp = false;

    try {
      const queryParse = z
        .object({ token: z.string().min(1) })
        .safeParse(req.query);

      const idParamParse = z.uuid().safeParse(req.params.id);

      if (!idParamParse.success || !queryParse.success) {
        throw new BadRequestError(
          COMMON_ERROR_CODES.VALIDATION_ERROR,
          "Invalid stream parameters."
        );
      }

      const jobId = idParamParse.data;

      const { token } = queryParse.data;

      const channelCoordinate = getJobTelemetryChannel(jobId);

      const cleanup = async (): Promise<void> => {
        if (isCleanedUp) return;

        isCleanedUp = true;

        try {
          if (telemetrySubscriber) {
            await telemetrySubscriber.unsubscribe(channelCoordinate);

            await telemetrySubscriber.quit();
          }
        } catch (error) {
          logError(error);
        } finally {
          if (!res.writableEnded) {
            res.end();
          }
        }
      };

      const payloadContext = await jwtTokenEngine.verifyAccessToken(token);

      if (!payloadContext) {
        throw new UnauthorizedError(
          AUTH_ERROR_CODES.INVALID_CREDENTIALS,
          "Session expired."
        );
      }

      const activeJob = await prisma.job.findUnique({
        where: { id: jobId },
      });

      if (!activeJob) {
        throw new NotFoundError(
          COMMON_ERROR_CODES.RESOURCE_NOT_FOUND,
          "Job not found."
        );
      }

      res.setHeader("Content-Type", "text/event-stream");

      res.setHeader("Cache-Control", "no-cache");

      res.setHeader("Connection", "keep-alive");

      res.setHeader("X-Accel-Buffering", "no");

      res.flushHeaders();

      res.write(`retry: ${SSE_RETRY_MS}\n\n`);

      telemetrySubscriber = redisConnection.duplicate();

      telemetrySubscriber.on("error", (error) => {
        logError(error);

        void cleanup();
      });

      telemetrySubscriber.on(
        "message",
        (_channel: string, messagePayloadString: string) => {
          try {
            const parsedEvent = telemetryEventSchema.parse(
              JSON.parse(messagePayloadString)
            );

            writeSseEvent(res, parsedEvent);

            const currentStatus = parsedEvent.status as string;

            if (
              currentStatus === JOB_STATUS.COMPLETED ||
              currentStatus === JOB_STATUS.FAILED ||
              currentStatus === JOB_STATUS.CANCELLED
            ) {
              void cleanup();
            }
          } catch (error) {
            logError(error);

            writeSseEvent(res, { error: "MALFORMED_TELEMETRY_FRAME" });
          }
        }
      );

      await telemetrySubscriber.subscribe(channelCoordinate);

      req.on("close", () => {
        void cleanup();
      });
    } catch (error) {
      next(error);
    }
  },
};
