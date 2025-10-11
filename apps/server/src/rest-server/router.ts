import express from "express";
import { createPdfHandler } from "./route-handlers";

const apiRouter = express.Router();

apiRouter.post("/create-pdf", createPdfHandler);

export { apiRouter };
