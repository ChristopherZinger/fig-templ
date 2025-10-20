import { log } from "@templetto/logging";
import z from "zod";
import type { Request } from "express";

export const SESSION_TOKEN_KEY = "pluginSessionToken";
export const SESSION_TOKEN_PREFIXES = ["Bearer", "bearer", "Bearer", "BEARER"];

export function getSessionTokenFromRequest(req: Request): string | null {
  const parseResult = z
    .object({ authorization: z.string() })
    .safeParse(req.headers);

  if (!parseResult.success) {
    log.debug("missing_session_token_in_headers", { error: parseResult.error });
    return null;
  }

  const { authorization: authHeader } = parseResult.data;
  const [bearerPrefix, token] = authHeader.split(" ");

  if (!SESSION_TOKEN_PREFIXES.includes(bearerPrefix) || !token) {
    log.debug("invalid_session_token_format", { bearerPrefix, token });
    return null;
  }

  return token;
}

export function expectUid(req: Request): string {
  const uid = req.auth?.uid;
  if (!uid) {
    log.debug("missing_uid_in_request");
    throw new Error("expected_uid_in_request");
  }
  return uid;
}
