import { AUTH_ERROR_CODES } from "@repo/shared";
import { type NextFunction, type Request, type Response } from "express";
import { UnauthorizedError } from "../errors/api-errors.js";
import { jwtTokenEngine } from "../lib/jwt.js";

export const authMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError(
        AUTH_ERROR_CODES.INVALID_CREDENTIALS,
        "Please sign in to access this resource."
      );
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new UnauthorizedError(
        AUTH_ERROR_CODES.INVALID_CREDENTIALS,
        "Please sign in to access this resource."
      );
    }

    const payload = jwtTokenEngine.verifyAccessToken(token);

    if (!payload) {
      throw new UnauthorizedError(
        AUTH_ERROR_CODES.INVALID_CREDENTIALS,
        "Your session has expired. Please sign in again."
      );
    }

    req.user = {
      id: payload.userId,
    };

    return next();
  } catch (error) {
    return next(error);
  }
};
