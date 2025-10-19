import z from "zod";
import { pkceKeyParser, pluginSessionTokenParser } from "./collection-parsers";

export enum CollectionName {
  pkceKeys = "pkce-keys",
  pluginSessionTokens = "plugin-session-tokens",
}

export type PkceKey_FsDoc = z.infer<typeof pkceKeyParser>;
export type PluginSessionToken_FsDoc = z.infer<typeof pluginSessionTokenParser>;
