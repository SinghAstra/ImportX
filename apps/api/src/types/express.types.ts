import { type Request } from "express";

export interface AuthenticatedUser {
  readonly id: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
