import { AppError } from "@/utils/AppError";
import { sendError } from "@/utils/api-response";
import { logger } from "@/utils/logger";
import { NextFunction, Request, Response } from "express";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error("Global Error Caught:", err);

  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.code);
  }

  return sendError(res, "Internal Server Error", 500);
};
