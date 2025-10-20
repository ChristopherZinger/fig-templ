import { log } from "@templetto/logging";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { auth } from "@templetto/firebase";
import { getSessionTokenFromRequest } from "../utils/plugin-session-token";

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
  const token = getSessionTokenFromRequest(req);
  if (!token) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  try {
    const { uid } = await auth.verifySessionCookie(token);
    req.auth = { uid };
  } catch (error) {
    log.error("failed_to_verify_session_cookie", { error });
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  next();
};
