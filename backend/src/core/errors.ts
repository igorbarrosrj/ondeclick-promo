export class ApplicationError extends Error {
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(message: string, statusCode = 400, details?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class UnauthorizedError extends ApplicationError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends ApplicationError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

export class NotFoundError extends ApplicationError {
  constructor(message = 'Not found') {
    super(message, 404);
  }
}

export class ConflictError extends ApplicationError {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}

export class RateLimitExceededError extends ApplicationError {
  constructor(message = 'Rate limit exceeded') {
    super(message, 429);
  }
}

export class ValidationError extends ApplicationError {
  constructor(message = 'Validation error', details?: Record<string, unknown>) {
    super(message, 422, details);
  }
}
