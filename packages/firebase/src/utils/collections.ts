import z from "zod";
import {
  apiTokenParser,
  artifactParser,
  billableApiCallLogParser,
  emailSubscriptionParser,
  organizationParser,
  pkceKeyParser,
  pluginSessionTokenParser,
  templateParser,
  userOrgJoinTableParser,
  userParser,
} from "./collection-parsers";

export enum CollectionName {
  pkceKeys = "pkce-keys",
  pluginSessionTokens = "plugin-session-tokens",
  users = "users",
  organizations = "organizations",
  userOrgJoinTable = "user-organization-join-table",
  templates = "templates",
  apiTokens = "api-tokens",
  artifacts = "artifacts",
  billableApiCallLogs = "billable-api-call-logs",
  emailSubscriptions = "email-subscriptions",
}

export type PkceKey_FsDoc = z.infer<typeof pkceKeyParser>;
export type PluginSessionToken_FsDoc = z.infer<typeof pluginSessionTokenParser>;
export type User_FsDoc = z.infer<typeof userParser>;
export type Organization_FsDoc = z.infer<typeof organizationParser>;
export type UserOrgJoinTable_FsDoc = z.infer<typeof userOrgJoinTableParser>;
export type Template_FsDoc = z.infer<typeof templateParser>;
export type ApiToken_FsDoc = z.infer<typeof apiTokenParser>;
export type Artifact_FsDoc = z.infer<typeof artifactParser>;
export type BillableApiCallLog_FsDoc = z.infer<typeof billableApiCallLogParser>;
export type EmailSubscription_FsDoc = z.infer<typeof emailSubscriptionParser>;
