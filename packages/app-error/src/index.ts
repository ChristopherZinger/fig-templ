export class AppError extends Error {
  info: Record<string, unknown>;
  constructor(message: string, info: Record<string, unknown> = {}) {
    super(message);
    this.name = "AppError";
    this.info = info;
  }
}

export class RateLimitError extends AppError {
  constructor(
    message: string,
    resource: string,
    info: Record<string, unknown>
  ) {
    super("rate_limit_error", { message, resource, ...info });
  }
}
