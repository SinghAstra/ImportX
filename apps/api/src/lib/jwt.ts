import { logError } from "@repo/shared";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

interface TokenPayload {
  userId: string;
  email: string;
}

export const jwtTokenEngine = {
  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: "7d",
    });
  },

  verifyAccessToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    } catch (error) {
      logError(error);

      return null;
    }
  },
};
