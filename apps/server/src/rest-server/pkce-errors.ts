import { AppError } from "@templetto/app-error";

export class PkceError extends AppError {
  constructor(message: string, info: Record<string, unknown> = {}) {
    super(message, info);
  }
}
