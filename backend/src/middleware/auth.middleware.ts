import { prisma } from "@/lib/prisma";
import { logger } from "@/utils/logger";
import { NextFunction, Request, Response } from "express";

// 1. Extend Express Request to allow req.user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
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
    // 2. Get Token from Header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.warn("🛑 Blocked unauthorized request (No Token)");
      res.status(401).json({ error: "Unauthorized: Missing session token" });
      return;
    }

    // Extract the token string (remove "Bearer ")
    const sessionToken = authHeader.split(" ")[1];

    // 3. Check Database
    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true }, // Join with User table
    });

    // 4. Validate Session
    if (!session) {
      logger.warn(`🚫 Invalid token attempt: ${sessionToken.slice(0, 10)}...`);
      res.status(401).json({ error: "Unauthorized: Invalid session" });
      return;
    }

    if (session.expires < new Date()) {
      logger.warn(`⏳ Expired session for user: ${session.user.email}`);
      res.status(401).json({ error: "Unauthorized: Session expired" });
      return;
    }

    // 5. Success! Attach user to request
    req.user = {
      id: session.user.id,
      email: session.user.email,
    };

    logger.info(`👤 User Authenticated: ${session.user.email}`);
    next(); // Pass control to the route
  } catch (error) {
    logger.error("Auth Middleware System Error", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
