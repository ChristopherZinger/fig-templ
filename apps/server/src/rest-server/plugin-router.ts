import express from "express";
import {
  createSessionTokenHandler,
  getPkceKeysHandler,
  readSessionTokenHandler,
} from "./plugin-rounte-handlers";
import cors from "cors";

const pluginRouter = express.Router();

/**
 * TODO: implement CORS!
 * - plugin router should only respond to requests from templetto.com/plugin/get-pkce-keys
 * - configure url in configuration (.env) for local and production
 *  */
pluginRouter.use(
  cors({
    origin: ["http://localhost:5173"],
  })
);

pluginRouter.get("/get-pkce-keys", getPkceKeysHandler);
pluginRouter.post("/read-session-token", readSessionTokenHandler);
pluginRouter.post("/save-token", createSessionTokenHandler);

export { pluginRouter };
