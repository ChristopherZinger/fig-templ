import express from "express";
import { log } from "./utils/logging";
import { apiRouter } from "./rest-server/router";
import { PORT } from "./utils/env";
import { pluginAuthRouter, pluginRouter } from "./rest-server/plugin-router";
import { logMiddleware } from "./rest-server/middleware";

if (!PORT) {
  throw new Error("missing_env_config PORT");
}

const app = express();
app.use(express.json());
app.use(logMiddleware);

app.use("/", apiRouter);
app.use("/plugin", pluginRouter, pluginAuthRouter);
app.listen(PORT, () => {
  log.info("REST_server_listening", { port: PORT, env: process.env.NODE_ENV });
});
