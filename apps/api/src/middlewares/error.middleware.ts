import { COMMON_ERROR_CODES, logError } from "@repo/shared";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/api-errors.js";

export const globalErrorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
      },
    });

    return;
  }

  logError(error);

  res.status(500).json({
    success: false,
    error: {
      code: COMMON_ERROR_CODES.INTERNAL_SERVER_ERROR,
      message:
        "Something went wrong on our end. Please try again in a few moments.",
    },
  });
};
