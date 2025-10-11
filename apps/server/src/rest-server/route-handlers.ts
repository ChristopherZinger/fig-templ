import type { Request, Response } from "express";
import { log } from "../utils/logging";
import { callPuppeteerWorker } from "../utils/puppeteer-worker-utils";
import z from "zod";

const createPdfRequestParamsSchema = z
  .object({
    "template-id": z.string(),
  })
  .transform((data) => ({
    templateId: data["template-id"],
  }));

export async function createPdfHandler(req: Request, res: Response) {
  log.info("handle_request", {
    httpRequest: { requestUrl: req.url, requestMethod: req.method },
  });

  const parsingResult = createPdfRequestParamsSchema.safeParse(req.query);
  if (!parsingResult.success) {
    log.error("invalid_request", { error: parsingResult.error });
    res.status(400).json({
      error: "invalid_request",
      details: ["expected_valid_template_id"],
    });
    log.info("response", { httpRequest: getRequestLogInfo(req, res) });
    return;
  }
  const { templateId } = parsingResult.data;

  try {
    log.info("fetching_from_puppeteer_worker");
    const response = await callPuppeteerWorker({ templateId });

    if (!response.ok) {
      throw new Error("puppeteer_worker_error");
    }
    res.status(200).send("processed_successfully");
  } catch (error) {
    log.error("failed_to_process_request", { error });
    res.status(500).json({ error: "Internal server error" });
  }

  log.info("response", { httpRequest: getRequestLogInfo(req, res) });
}

function getRequestLogInfo(req: Request, res: Response) {
  return {
    requestUrl: req.url,
    requestMethod: req.method,
    status: res.status,
  };
}
