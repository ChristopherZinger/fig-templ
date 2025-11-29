import "express-async-errors";
import express, { NextFunction, type Request, type Response } from "express";
import { log } from "./utils/logging";
import { apiRouter } from "./rest-server/router";
import { PORT } from "./utils/env";
import { pluginAuthRouter, pluginRouter } from "./rest-server/plugin-router";
import { logErrorsMiddleware, logMiddleware } from "./rest-server/middleware";
import { AppError } from "@templetto/app-error";
import { initFirebaseAdmin } from "@templetto/firebase";

if (!PORT) {
  throw new AppError("missing_env_config PORT");
}

initFirebaseAdmin({
  bucketUri: process.env.FIREBASE_STORAGE_BUCKET_NAME || "",
  googleApplicationCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

const app = express();
app.use(express.json());
app.use(logMiddleware);

// important! order of mounting routes matters!
app.use("/plugin", pluginRouter, pluginAuthRouter);
app.use("/", apiRouter);
app.use(logErrorsMiddleware);
app.use((error: Error, _req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(error);
  }
  res.status(500).send("internal_server_error");
});

app.listen(PORT, () => {
  log.info("REST_server_listening", { port: PORT, env: process.env.NODE_ENV });
});
