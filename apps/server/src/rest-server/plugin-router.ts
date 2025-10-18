import express from "express";
import {
  createSessionTokenHandler,
  getPkceKeysHandler,
  logoutHandler,
  readSessionTokenHandler,
} from "./plugin-rounte-handlers";
import cors from "cors";

const pluginRouter = express.Router();

/**
 * TODO: implement CORS!
 * - plugin router should only respond to requests from templetto.com/plugin/get-pkce-keys
 * - configure url in configuration (.env) for local and production
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
pluginRouter.post("/logout", logoutHandler);

export { pluginRouter };
