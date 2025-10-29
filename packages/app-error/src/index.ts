export class AppError extends Error {
  info: Record<string, unknown>;
  constructor(message: string, info: Record<string, unknown> = {}) {
    super(message);
    this.name = "AppError";
    this.info = info;
  }
}
