import { log } from "@templetto/logging";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { auth, getOrgApiTokensCollectionRef } from "@templetto/firebase";
import { getTokenFromReqAuthHeader } from "../utils/plugin-session-token";

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
    const { uid } = await auth.verifySessionCookie(token);
    req.auth = { type: "plugin-session", uid };
  } catch (error) {
    log.error("failed_to_verify_session_cookie", { error });
    res.status(401).json({ error: "unauthorized" });
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
    res.status(401).json({ message: "unauthorized" });
    return;
  }

  try {
    const tokenDoc = (
      await getOrgApiTokensCollectionRef().doc(authHeaderToken).get()
    ).data();
    if (!tokenDoc) {
      res.status(401).json({ message: "unauthorized" });
      return;
    }
    if (tokenDoc.expiresAt >= new Date()) {
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
