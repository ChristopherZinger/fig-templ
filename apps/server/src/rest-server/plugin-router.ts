import express from "express";
import {
  createSessionTokenHandler,
  getOrganizationsHandler,
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

pluginRouter.use((req, _, next) => {
  const authHeader = req.headers["authorization"];
  let token;
  if (
    authHeader &&
    typeof authHeader === "string" &&
    (authHeader.startsWith("BEARER ") ||
      authHeader.startsWith("bearer ") ||
      authHeader.startsWith("Bearer "))
  ) {
    token = authHeader.substring("Bearer ".length);
  }
  console.log("token", token);
  req["pluginSessionToken"] = token;

  next();
});

pluginRouter.get("/get-pkce-keys", getPkceKeysHandler);
pluginRouter.post("/read-session-token", readSessionTokenHandler);
pluginRouter.post("/save-token", createSessionTokenHandler);
pluginRouter.post("/logout", logoutHandler);
pluginRouter.get("/get-organizations", getOrganizationsHandler);

export { pluginRouter };
