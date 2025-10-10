import type { Response, Request } from "express";
import z from "zod";
import fs from "fs";
import path from "path";
import { getBucket, pushToStorage } from "./utils/firebase-storage";
import { firestore } from "./utils/firebase";
import { withBrowserPage } from "./utils/puppeteer";
import { log } from "./utils/logging";

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

  const templatePathInStorage = `templates/4pQTTMHwqPCraONcfrU4.html`;
  const bucket = getBucket();
  const templateRef = bucket.file(templatePathInStorage);
  if (!(await templateRef.exists())) {
    throw new Error("template_not_found" + " " + templatePathInStorage);
  }
  const [buffer] = await templateRef.download();
  const templateHtml = buffer.toString("utf-8");

  log.info("create_template_with_puppeteer", { templateHtml });
  const pdfLocalFilePath = `/tmp/${Date.now()}/out.pdf` as const;
  fs.mkdirSync(path.dirname(pdfLocalFilePath), { recursive: true });

  await withBrowserPage(async (page) => {
    await page.setContent(templateHtml, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    await page.pdf({ path: pdfLocalFilePath });
  });

  const pdfDocRef = firestore.collection("output").doc();
  const pdfPathInStorage = `outputs/${pdfDocRef.id}.pdf`;

  log.info("saving_pdf_to_storage", { pdfPathInStorage });
  await pushToStorage({
    localFilePath: pdfLocalFilePath,
    destinationInStorage: pdfPathInStorage,
  });

  log.info("saving_pdf_to_firestore", { pdfPathInStorage });
  await pdfDocRef.set({
    name: "output",
    filePathInStorage: pdfPathInStorage,
  });

  res.status(200).json({ message: "reponse_from_puppeteer_worker" });

  log.info("puppeteer_worker_response", {
    httpRequest: {
      status: res.statusCode,
      requestUrl: req.url,
      requestMethod: req.method,
    },
  });
}
