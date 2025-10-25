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

// /api-tokens/{token}
export const apiTokenParser = z.object({
  token: z.string(),
  createdAt: firestoreDateField,
  expiresAt: firestoreDateField,
  orgId: z.string(),
});

// /users/{uid}
export const userParser = z.object({
  uid: z.string(),
  name: z.string(),
});

// /organizations/{id}
export const organizationParser = z.object({
  id: z.string(),
  name: z.string(),
});

// /organizations/{orgId}/templates/{id}
export const templateParser = z.object({
  id: z.string(),
  orgId: z.string(),
  pathInStorage: z.string(),
  downloadUrl: z.string().nullable(),
});

// /user-organization-join-table/{uid}:{orgId}
export const userOrgJoinTableParser = z.object({
  uid: z.string(),
  orgId: z.string(),
});

// organizations/{orgId}/artifacts/{id}
export const artifactParser = z.object({
  id: z.string(),
  orgId: z.string(),
  filePathInStorage: z.string(),
  downloadUrl: z.string(),
  createdAt: firestoreDateField,
  templateId: z.string(),
});
