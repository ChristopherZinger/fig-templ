import express from "express";
import { log } from "./utils/logging";
import { apiRouter } from "./rest-server/router";
import { PORT } from "./utils/env";
import { pluginAuthRouter, pluginRouter } from "./rest-server/plugin-router";
import { logMiddleware } from "./rest-server/middleware";
import { AppError } from "@templetto/app-error";

if (!PORT) {
  throw new AppError("missing_env_config PORT");
}

const app = express();
app.use(express.json());
app.use(logMiddleware);

// important! order of mounting routes matters!
app.use("/plugin", pluginRouter, pluginAuthRouter);
app.use("/", apiRouter);

app.listen(PORT, () => {
  log.info("REST_server_listening", { port: PORT, env: process.env.NODE_ENV });
});
