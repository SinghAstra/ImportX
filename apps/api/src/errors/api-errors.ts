import { COMMON_ERROR_CODES, ErrorCode } from "@repo/shared";

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: ErrorCode,
    message: string
  ) {
    super(message);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, COMMON_ERROR_CODES.VALIDATION_ERROR, message);
  }
}

export class BadRequestError extends AppError {
  constructor(code: ErrorCode, message: string) {
    super(400, code, message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(code: ErrorCode, message: string) {
    super(401, code, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(code: ErrorCode, message: string) {
    super(403, code, message);
  }
}

export class NotFoundError extends AppError {
  constructor(code: ErrorCode, message: string) {
    super(404, code, message);
  }
}

export class ConflictError extends AppError {
  constructor(code: ErrorCode, message: string) {
    super(409, code, message);
  }
}
