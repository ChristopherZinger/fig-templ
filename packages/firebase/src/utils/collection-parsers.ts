import z from "zod";
import { Timestamp } from "firebase-admin/firestore";

// Helper: Accepts both Timestamp (from Firestore) and Date (from app code)
const firestoreDateField = z.preprocess((val) => {
  if (val instanceof Timestamp) {
    return val.toDate();
  }
  return val;
}, z.date());

// /pkce-keys/{writeKey}
export const pkceKeyParser = z.object({
  readKey: z.string(),
  writeKey: z.string(),
  createdAt: firestoreDateField,
  expiresAt: firestoreDateField,
  hasUsedReadKey: z.boolean(),
  userSessionId: z.string().nullable(),
});

// /plugin-session-tokens/{sessionToken}
export const pluginSessionTokenParser = z.object({
  sessionToken: z.string(),
  createdAt: firestoreDateField,
  expiresAt: firestoreDateField,
  uid: z.string(),
});
