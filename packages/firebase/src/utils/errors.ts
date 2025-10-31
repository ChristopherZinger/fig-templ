import { FirebaseAuthError } from "firebase-admin/auth";

export function isFirebaseAuthError(
  error: unknown
): error is FirebaseAuthError {
  return error instanceof FirebaseAuthError;
}
