import z from "zod";
import {
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
}

export type PkceKey_FsDoc = z.infer<typeof pkceKeyParser>;
export type PluginSessionToken_FsDoc = z.infer<typeof pluginSessionTokenParser>;
export type User_FsDoc = z.infer<typeof userParser>;
export type Organization_FsDoc = z.infer<typeof organizationParser>;
export type UserOrgJoinTable_FsDoc = z.infer<typeof userOrgJoinTableParser>;
export type Template_FsDoc = z.infer<typeof templateParser>;
