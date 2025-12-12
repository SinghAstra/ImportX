import { Response } from "express";

export const sendSuccess = <T>(res: Response, data: T, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
  });
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  code?: string
) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      message,
      code: code || "INTERNAL_ERROR",
    },
  });
};
