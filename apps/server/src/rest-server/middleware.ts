import { log } from "@templetto/logging";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { getAuth, getOrgApiTokensCollectionRef } from "@templetto/firebase";
import { getTokenFromReqAuthHeader } from "../utils/plugin-session-token";
import { isFirebaseAuthError } from "@templetto/firebase/errors";
import { AppError } from "@templetto/app-error";

export const logMiddleware: express.RequestHandler = (
  req: Request,
  _: Response,
  next: NextFunction
) => {
  log.info("httpRequest", {
    httpRequest: {
      requestUrl: req.url,
      requestMethod: req.method,
    },
  });
  next();
};

export function logErrorsMiddleware(
  error: Error,
  _req: Request,
  _res: Response,
  next: NextFunction
) {
  let message = "unknown_error";
  const info: Record<string, unknown> = {};
  if (error instanceof AppError) {
    message = "AppError: " + (error.message || "unnamed_app_error");
    info.appErrorInfo = error.info;
  }
  if (error instanceof Error) {
    message = "Error: " + (error.message || "unknown_error");
    info.errorStack = error.stack;
    info.errorName = error.name;
    info.errorCause = error.cause;
  }
  log.error("failed_to_handle_request", { message, info, error });
  next(error);
}

export const pluginAuthMiddleware: express.RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = getTokenFromReqAuthHeader(req);
  if (!token) {
    res.status(401).json({ message: "unauthorized" });
    return;
  }

  try {
    const { uid } = await getAuth().verifySessionCookie(token);
    req.auth = { type: "plugin-session", uid };
  } catch (error) {
    log.error("failed_to_verify_session_cookie", { error });

    if (
      isFirebaseAuthError(error) &&
      error.code === "auth/session-cookie-expired"
    ) {
      res.status(401).json({ message: "session_cookie_expired" });
      return;
    }

    res.status(401).json({ message: "unauthorized" });
    return;
  }

  next();
};

export const apiAuthMiddleware: express.RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeaderToken = getTokenFromReqAuthHeader(req);
  if (!authHeaderToken) {
    log.debug("missing_token_in_headers");
    res.status(401).json({ message: "unauthorized" });
    return;
  }

  const tokenHash = authHeaderToken;
  try {
    const tokenDoc = (
      await getOrgApiTokensCollectionRef().doc(tokenHash).get()
    ).data();
    if (!tokenDoc) {
      log.debug("token_doc_not_found");
      res.status(401).json({ message: "unauthorized" });
      return;
    }
    if (tokenDoc.expiresAt < new Date()) {
      log.debug("token_expired", { expiresAt: tokenDoc.expiresAt });
      res.status(401).json({ message: "token_expired" });
      return;
    }
    req.auth = { type: "api-token", orgId: tokenDoc.orgId };
  } catch (error) {
    log.error("failed_to_verify_api_token", { error });
    res.status(500).json({ message: "internal_server_error" });
    return;
  }

  next();
};
