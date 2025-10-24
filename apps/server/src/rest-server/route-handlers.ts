import type { Request, Response } from "express";
import { log } from "../utils/logging";
import { callPuppeteerWorker } from "../utils/puppeteer-worker-utils";
import z from "zod";
import { expectApiTokenOrgId } from "../utils/plugin-session-token";
import { getTemplatesCollectionRef } from "@templetto/firebase";

const createPdfRequestParamsSchema = z
  .object({
    "template-id": z.string(),
  })
  .transform((data) => ({
    templateId: data["template-id"],
  }));

export async function createPdfHandler(req: Request, res: Response) {
  const apiTokenOrgId = expectApiTokenOrgId(req);

  const parsingResult = createPdfRequestParamsSchema.safeParse(req.query);
  if (!parsingResult.success) {
    log.error("invalid_request", { error: parsingResult.error });
    res.status(400).json({
      error: "invalid_request",
      details: z.prettifyError(parsingResult.error),
    });
    log.info("rest_server_response", {
      httpRequest: getRequestLogInfo(req, res),
    });
    return;
  }
  const { templateId } = parsingResult.data;

  const templateDoc = await getTemplatesCollectionRef({ orgId: apiTokenOrgId })
    .doc(templateId)
    .get();
  if (!templateDoc.exists) {
    log.debug("template_not_found", { templateId, orgId: apiTokenOrgId });
    res.status(404).json({ error: "template_not_found" });
    return;
  }

  try {
    log.info("fetching_from_puppeteer_worker");
    const response = await callPuppeteerWorker({
      templateId,
      jsonData: req.body,
    });

    const {
      data: { downloadUrl },
    } = z
      .object({ data: z.object({ downloadUrl: z.string() }) })
      .parse(response);

    log.debug("puppeteer_worker_response", { downloadUrl });

    res.status(200).json({ downloadUrl });
    log.info("rest_server_response", {
      httpRequest: getRequestLogInfo(req, res),
    });
  } catch (error) {
    log.error("failed_to_process_request", { error });
    res.status(500).json({ error: "Internal server error" });
    log.error("rest_server_response", {
      httpRequest: getRequestLogInfo(req, res),
    });
  }
}

function getRequestLogInfo(req: Request, res: Response) {
  return {
    requestUrl: req.url,
    requestMethod: req.method,
    status: res.status,
  };
}
