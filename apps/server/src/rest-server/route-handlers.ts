import type { Request, Response } from "express";
import { log } from "../utils/logging";
import { callPuppeteerWorker } from "../utils/puppeteer-worker-utils";
import z from "zod";
import { expectApiTokenOrgId } from "../utils/plugin-session-token";
import { getTemplatesCollectionRef } from "@templetto/firebase";
import {
  createArtifact,
  hasReachedArtifactsRateLimit,
} from "@templetto/firebase/repositories/artifact";
import { RateLimitError } from "@templetto/app-error";

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

  const hasReachedRateLimit = await hasReachedArtifactsRateLimit({
    orgId: apiTokenOrgId,
  });
  if (hasReachedRateLimit) {
    log.debug("rate_limit_reached", { orgId: apiTokenOrgId });
    res.status(429).json({ error: "rate_limit_reached" });
    return;
  }

  const templateDoc = await getTemplatesCollectionRef({ orgId: apiTokenOrgId })
    .doc(templateId)
    .get();
  if (!templateDoc.exists) {
    log.debug("template_not_found", { templateId, orgId: apiTokenOrgId });
    res.status(404).json({ error: "template_not_found" });
    return;
  }

  log.info("fetching_from_puppeteer_worker");
  const response = await callPuppeteerWorker({
    templateId,
    orgId: apiTokenOrgId,
    jsonData: req.body,
  });

  const {
    data: { downloadUrl, pathInStorage },
  } = z
    .object({
      data: z.object({ downloadUrl: z.string(), pathInStorage: z.string() }),
    })
    .parse(response);

  try {
    await createArtifact({
      orgId: apiTokenOrgId,
      apiTokenHash: "", // TODO
      templateId,
      filePathInStorage: pathInStorage,
      downloadUrl,
    });
  } catch (error) {
    if (error instanceof RateLimitError) {
      log.debug("rate_limit_reached", { error });
      res.status(429).json({ error: "rate_limit_reached" });
      return;
    }
  }

  log.debug("puppeteer_worker_response", { downloadUrl });

  res.status(200).json({ downloadUrl });
  log.info("rest_server_response", {
    httpRequest: getRequestLogInfo(req, res),
  });
}

function getRequestLogInfo(req: Request, res: Response) {
  return {
    requestUrl: req.url,
    requestMethod: req.method,
    status: res.status,
  };
}
