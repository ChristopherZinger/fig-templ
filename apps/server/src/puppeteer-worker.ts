import type { Response, Request } from "express";
import z from "zod";
import fs from "fs";
import path from "path";
import {
  getBucket,
  pushToStorage,
  firestore,
  getTemplatesCollectionRef,
  expectDocInCollection,
} from "@templetto/firebase";
import { withBrowserPage } from "./utils/puppeteer";
import { log } from "./utils/logging";
import { puppeteerWorkerRequestSchema } from "./utils/puppeteer-worker-utils";
import Handlebars from "handlebars";

const configParseResult = z
  .object({
    googleApplicationCredentials: z.string().optional(),
  })
  .safeParse({
    googleApplicationCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  });

if (!configParseResult.success) {
  throw new Error(
    "invalid_puppeteer_worker_config" + JSON.stringify(configParseResult.error)
  );
}

export async function main(req: Request, res: Response) {
  log.info("got_request_from_rest_server");

  if (!req.is("application/json")) {
    throw new Error("expected_application_json");
  }

  const reqParsingResult = puppeteerWorkerRequestSchema.safeParse(req.body);
  if (!reqParsingResult.success) {
    res.status(400).json({ error: "invalid_request" });
    return;
  }
  const { templateId, orgId, jsonData } = reqParsingResult.data;

  const templateDocRef = getTemplatesCollectionRef({ orgId }).doc(templateId);
  const { pathInStorage: templatePathInStorage } =
    await expectDocInCollection(templateDocRef);

  const bucket = getBucket();
  const templateRef = bucket.file(templatePathInStorage);
  if (!(await templateRef.exists())) {
    log.warn("template_not_found" + " " + templatePathInStorage);
    res.status(404).json({ error: "template_not_found_in_storage" });
    return;
  }
  const [buffer] = await templateRef.download();
  const templateHtml = buffer.toString("utf-8");

  const htmlToRender = Handlebars.compile(templateHtml)(jsonData);

  log.debug("create_template_with_puppeteer", { templateHtml });
  const pdfLocalFilePath =
    process.env.NODE_ENV === "production"
      ? (`/tmp/${Date.now()}/out.pdf` as const)
      : (`./${Date.now()}/out.pdf` as const);
  fs.mkdirSync(path.dirname(pdfLocalFilePath), { recursive: true });

  await withBrowserPage(async (page) => {
    await page.setContent(htmlToRender, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    await page.pdf({ path: pdfLocalFilePath });
  });

  const pdfDocRef = firestore.collection("output").doc();
  const pdfPathInStorage = `outputs/${pdfDocRef.id}.pdf`;

  log.debug("saving_pdf_to_storage", { pdfPathInStorage });
  await pushToStorage({
    localFilePath: pdfLocalFilePath,
    destinationInStorage: pdfPathInStorage,
  });

  log.debug("saving_pdf_to_firestore", { pdfPathInStorage });
  await pdfDocRef.set({
    name: "output",
    filePathInStorage: pdfPathInStorage,
  });

  log.debug("get_signed_url", { pdfPathInStorage });
  const [downloadUrl] = await bucket.file(pdfPathInStorage).getSignedUrl({
    action: "read",
    expires: Date.now() + 1000 * 60 * 60 * 24 * 365,
    responseDisposition: `attachment; filename="result.pdf"`,
  });

  res.status(200).json({ downloadUrl });

  log.info("puppeteer_worker_response", {
    httpRequest: {
      status: res.statusCode,
      requestUrl: req.url,
      requestMethod: req.method,
    },
  });
}
