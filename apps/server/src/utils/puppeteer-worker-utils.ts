import z from "zod";
import { PUPPETEER_WORKER_URL } from "./env";
import { log } from "./logging";
import { getIdTokenClient } from "./gcloud-id-token";

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
): Promise<Response> {
  if (!PUPPETEER_WORKER_URL) {
    throw new Error("missing_env_config PUPPETEER_WORKER_URL");
  }

  log.info("calling_puppeteer_worker", { PUPPETEER_WORKER_URL });
  const client = await getIdTokenClient();
  const response = await client.fetch(PUPPETEER_WORKER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestParams),
  });
  return response;
}
