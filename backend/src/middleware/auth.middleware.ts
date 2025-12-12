import { AppError } from "@/utils/AppError";
import { logger } from "@/utils/logger";
import crypto from "crypto";
import { NextFunction, Request, Response } from "express";

// 1. Extend Express Request to allow req.user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.warn("🛑 Blocked unauthorized request (No Token)");
      // Throw standardized error
      return next(
        new AppError("Unauthorized: Missing token", 401, "UNAUTHORIZED")
      );
    }

    const token = authHeader.split(" ")[1];
    const [userId, expiryStr, providedSignature] = token.split(":");

    if (!userId || !expiryStr || !providedSignature) {
      logger.warn("🚫 Invalid token format received");
      return next(
        new AppError("Unauthorized: Invalid token format", 401, "INVALID_TOKEN")
      );
    }

    const now = Date.now();
    if (parseInt(expiryStr) < now) {
      logger.warn(`⏳ Expired token attempt for User ${userId}`);
      return next(
        new AppError("Unauthorized: Token expired", 401, "TOKEN_EXPIRED")
      );
    }

    const secret = process.env.AUTH_SECRET_KEY;
    if (!secret) {
      logger.error("SERVER ERROR: AUTH_SECRET_KEY missing");
      return next(
        new AppError("Internal Server Configuration Error", 500, "CONFIG_ERROR")
      );
    }

    const dataToSign = `${userId}:${expiryStr}`;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(dataToSign)
      .digest("hex");

    const sourceBuffer = Buffer.from(providedSignature, "utf-8");
    const targetBuffer = Buffer.from(expectedSignature, "utf-8");

    const isMatch =
      sourceBuffer.length === targetBuffer.length &&
      crypto.timingSafeEqual(sourceBuffer, targetBuffer);

    if (!isMatch) {
      logger.error(`🚨 Security Alert: Signature mismatch for User ${userId}`);
      return next(
        new AppError("Forbidden: Invalid signature", 403, "INVALID_SIGNATURE")
      );
    }

    req.user = { id: userId };
    logger.info(`✅ User Authenticated via HMAC: ${userId}`);
    next();
  } catch (error) {
    logger.error("Auth Middleware System Error", error);
    next(error);
  }
};
