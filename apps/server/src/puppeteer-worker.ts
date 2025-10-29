import type { Response, Request } from "express";
import fs from "fs";
import path from "path";
import {
  getBucket,
  pushToStorage,
  getTemplatesCollectionRef,
  expectDocInCollection,
  getArtifactsCollectionRef,
  StorageDirectory,
} from "@templetto/firebase";
import { withBrowserPage } from "./utils/puppeteer";
import { log } from "./utils/logging";
import { puppeteerWorkerRequestSchema } from "./utils/puppeteer-worker-utils";
import Handlebars from "handlebars";

export async function main(req: Request, res: Response) {
  log.info("got_request_from_rest_server");

  if (!req.is("application/json")) {
    throw new AppError("expected_application_json");
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

  let templateHtml: string;
  try {
    const [buffer] = await templateRef.download();
    templateHtml = buffer.toString("utf-8");
  } catch (error) {
    log.error("failed_to_download_template", { error });
    res.status(500).json({ error: "internal_server_error" });
    return;
  }

  const htmlToRender = Handlebars.compile(templateHtml)(jsonData);

  log.debug("create_template_with_puppeteer", { templateHtml });
  const pdfLocalFilePath =
    process.env.NODE_ENV === "production"
      ? (`/tmp/${Date.now()}/out.pdf` as const)
      : (`./${Date.now()}/out.pdf` as const);
  fs.mkdirSync(path.dirname(pdfLocalFilePath), { recursive: true });

  try {
    await withBrowserPage(async (page) => {
      await page.setContent(htmlToRender, {
        waitUntil: "networkidle0",
        timeout: 30000,
      });

      await page.pdf({ path: pdfLocalFilePath });
    });
  } catch (error) {
    log.error("failed_to_create_template_with_puppeteer", { error });
    res.status(500).json({ error: "internal_server_error" });
    return;
  }

  const artifactDocRef = getArtifactsCollectionRef({ orgId }).doc();
  const artifactPathInStorage = `${StorageDirectory.organizations}/${orgId}/${StorageDirectory.artifacts}/${artifactDocRef.id}.pdf`;

  log.debug("saving_pdf_to_storage", { artifactPathInStorage });
  await pushToStorage({
    localFilePath: pdfLocalFilePath,
    destinationInStorage: artifactPathInStorage,
  });

  log.debug("get_signed_url", { artifactPathInStorage });
  const [downloadUrl] = await bucket.file(artifactPathInStorage).getSignedUrl({
    action: "read",
    expires: Date.now() + 1000 * 60 * 60 * 24 * 365,
    responseDisposition: `attachment; filename="result.pdf"`,
  });

  log.debug("saving_pdf_to_firestore", { artifactPathInStorage });
  await artifactDocRef.set({
    id: artifactDocRef.id,
    orgId,
    templateId,
    filePathInStorage: artifactPathInStorage,
    downloadUrl,
    createdAt: new Date(),
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
