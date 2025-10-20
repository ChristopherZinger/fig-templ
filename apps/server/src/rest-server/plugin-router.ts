import express from "express";
import {
  createSessionTokenHandler,
  getOrganizationsHandler,
  getPkceKeysHandler,
  getTemplatesHandler,
  createTemplateHandler,
  logoutHandler,
  readSessionTokenHandler,
} from "./plugin-rounte-handlers";
import cors from "cors";
import { pluginAuthMiddleware } from "./middleware";

const pluginRouter = express.Router();
const pluginAuthRouter = express.Router();

/**
 * TODO: implement CORS!
 * - plugin router should only respond to requests from templetto.com/plugin/get-pkce-keys
 * - configure url in configuration (.env) for local and production
 * - be explicite about which routes expect which origins
 * - be explicit about which reoutes require authentication and handle 401 in middleware
 *  */

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "null", // for requests from figma plugin with null origin; e.g /logout
  "https://templetto.com",
];
pluginRouter.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

pluginRouter.get("/get-pkce-keys", getPkceKeysHandler);
pluginRouter.post("/read-session-token", readSessionTokenHandler);
pluginRouter.post("/save-token", createSessionTokenHandler);

pluginAuthRouter.use(cors({ origin: ["null"], credentials: true }));
pluginAuthRouter.use(pluginAuthMiddleware);

pluginAuthRouter.post("/logout", logoutHandler);
pluginAuthRouter.get("/get-organizations", getOrganizationsHandler);
pluginAuthRouter.get("/get-templates", getTemplatesHandler);
pluginAuthRouter.post("/create-template", createTemplateHandler);

export { pluginRouter, pluginAuthRouter };
