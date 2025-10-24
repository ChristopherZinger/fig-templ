import express from "express";
import { createPdfHandler } from "./route-handlers";
import { apiAuthMiddleware } from "./middleware";

const apiRouter = express.Router();
apiRouter.use(apiAuthMiddleware);

apiRouter.post("/create-pdf", createPdfHandler);

export { apiRouter };
