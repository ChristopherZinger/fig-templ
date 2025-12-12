import type { Response, Request } from "express";
import fs from "fs";
import path from "path";
import {
  getBucket,
  pushToStorage,
  getTemplatesCollectionRef,
  expectDocInCollection,
  StorageDirectory,
  initFirebaseAdmin,
} from "@templetto/firebase";
import { withBrowserPage } from "./utils/puppeteer";
import { log } from "./utils/logging";
import { puppeteerWorkerRequestSchema } from "./utils/puppeteer-worker-utils";
import Handlebars from "handlebars";
import { v4 as uuid } from "uuid";
import { recordBillableApiCall } from "@templetto/firebase/repositories/billable-api-call-logs";

initFirebaseAdmin({
  bucketUri: process.env.FIREBASE_STORAGE_BUCKET_NAME || "",
  googleApplicationCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

export async function main(req: Request, res: Response) {
  log.info("got_request_from_rest_server");

  if (!req.is("application/json")) {
    log.debug("expected_application_json_header");
    res.status(400).json({ error: "expected_application_json_header" });
    return;
  }

  const reqParsingResult = puppeteerWorkerRequestSchema.safeParse(req.body);
  if (!reqParsingResult.success) {
    res.status(400).json({ error: "invalid_request_body" });
    return;
  }

  const { templateId, orgId, jsonData } = reqParsingResult.data;
  const templateDocRef = getTemplatesCollectionRef({ orgId }).doc(templateId);
  const { pathInStorage: templatePathInStorage, dimensions } =
    await expectDocInCollection(templateDocRef);

  const bucket = getBucket();
  const templateRef = bucket.file(templatePathInStorage);
  if (!(await templateRef.exists())) {
    log.debug("template_not_found", {
      templatePathInStorage,
      orgId,
      templateId,
    });
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

  log.debug("create_template_with_puppeteer", {
    templateHtmlSize: templateHtml.length,
  });
  const { dirPath, cleanup } = createTmpDir();
  const pdfLocalFilePath = path.join(dirPath, "out.pdf");

  try {
    await withBrowserPage(dimensions, async (page) => {
      await page.setContent(htmlToRender, {
        waitUntil: "networkidle0",
        timeout: 30000,
      });

      await page.pdf({
        path: pdfLocalFilePath,
        width: `${dimensions.widthPx}px`,
        height: `${dimensions.heightPx}px`,
        printBackground: true,
        preferCSSPageSize: false,
      });
    });
  } catch (error) {
    log.error("failed_to_create_template_with_puppeteer", { error });
    res.status(500).json({ error: "internal_server_error" });
    return;
  }

  const artifactPathInStorage = `${StorageDirectory.organizations}/${orgId}/${StorageDirectory.artifacts}/tId-${templateId}/${uuid()}.pdf`;

  log.debug("saving_pdf_to_storage", { artifactPathInStorage });
  await pushToStorage({
    localFilePath: pdfLocalFilePath,
    destinationInStorage: artifactPathInStorage,
  });
  cleanup();

  log.debug("get_signed_url");
  const [downloadUrl] = await bucket.file(artifactPathInStorage).getSignedUrl({
    action: "read",
    expires: Date.now() + 1000 * 60 * 60 * 24 * 365, // 1 year
    responseDisposition: `attachment; filename="result.pdf"`,
  });

  await recordBillableApiCall({ orgId });
  log.debug("saved_pdf_to_firestore", { artifactPathInStorage });

  res.status(200).json({ downloadUrl, pathInStorage: artifactPathInStorage });
}

function createTmpDir(): {
  dirPath: string;
  cleanup: () => void;
} {
  const tmpDir =
    process.env.NODE_ENV === "production"
      ? `/tmp/${Date.now()}`
      : `./${Date.now()}`;

  fs.mkdirSync(tmpDir, { recursive: true });

  return {
    dirPath: tmpDir,
    cleanup: () => fs.rmSync(tmpDir, { recursive: true }),
  };
}
