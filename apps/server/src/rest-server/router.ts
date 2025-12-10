import express from "express";
import { createPdfHandler } from "./route-handlers";
import {
  apiAuthMiddleware,
  monthlyApiCallRateLimitMiddleware,
} from "./middleware";

const apiRouter = express.Router();
apiRouter.use(apiAuthMiddleware);
apiRouter.use(monthlyApiCallRateLimitMiddleware);

apiRouter.post("/create-pdf", createPdfHandler);

export { apiRouter };
