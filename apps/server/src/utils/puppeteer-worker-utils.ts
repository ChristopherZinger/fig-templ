import z from "zod";
import { PUPPETEER_WORKER_URL } from "./env";
import { log } from "./logging";
import { getIdTokenClient } from "./gcloud-id-token";
import { AppError } from "@templetto/app-error";

export const puppeteerWorkerRequestSchema = z.object({
  templateId: z.string(),
  orgId: z.string(),
  jsonData: z.record(z.string(), z.unknown()),
});

export type PuppeteerWorkerRequest = z.infer<
  typeof puppeteerWorkerRequestSchema
>;

export async function callPuppeteerWorker(
  requestParams: PuppeteerWorkerRequest
): Promise<{ downloadUrl: string; pathInStorage: string }> {
  if (!PUPPETEER_WORKER_URL) {
    throw new AppError("missing_env_config PUPPETEER_WORKER_URL");
  }

  log.info("calling_puppeteer_worker", { PUPPETEER_WORKER_URL });
  const client = await getIdTokenClient();
  const response = await client.fetch(PUPPETEER_WORKER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestParams),
  });

  if (!response.ok) {
    const responseInfo = {
      status: response.status,
      statusText: response.statusText,
    };
    log.error("puppeteer_worker_error", { responseInfo });
    throw new AppError(`puppeteer_worker_error`, responseInfo);
  }

  const jsonResponse = await response.json();
  log.debug("received_response_from_puppeteer_worker", { jsonResponse });

  const { downloadUrl, pathInStorage } = z
    .object({ downloadUrl: z.string(), pathInStorage: z.string() })
    .parse(response);

  return { downloadUrl, pathInStorage };
}
