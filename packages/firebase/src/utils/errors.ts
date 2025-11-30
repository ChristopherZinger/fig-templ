import { FirebaseAuthError } from "firebase-admin/auth";
import { AppError } from "@templetto/app-error";

export function isFirebaseAuthError(
  error: unknown
): error is FirebaseAuthError {
  return error instanceof FirebaseAuthError;
}

export class RestrictedAccessError extends AppError {
  constructor(message: string, info: Record<string, unknown> = {}) {
    super("restricted_access", { ...info, message });
  }
}
