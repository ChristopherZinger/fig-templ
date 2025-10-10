import express from "express";
import z from "zod";
import { GoogleAuth, type IdTokenClient } from "google-auth-library";
import { log } from "./utils/logging";
import { PuppeteerWorkerRequest } from "./utils/puppeteer-worker-utils";
const projectNumber = process.env.GCLOUD_PROJECT_NUMBER;
const defaultLocation = process.env.DEFAULT_LOCATION;
const puppeteerWorkerServiceName = process.env.PUPPETEER_WORKER_SERVICE_NAME;
const url = `https://${puppeteerWorkerServiceName}-${projectNumber}.${defaultLocation}.run.app/`;
const targetAudience = url;

const configParseResult = z
  .object({
    puppeterWorkerUrl: z.string().url(),
    port: z.coerce.number().int().positive(),
  })
  .safeParse({
    puppeterWorkerUrl: process.env.PUPPETEER_WORKER_URL,
    port: process.env.PORT,
  });

if (!configParseResult.success) {
  throw new Error("invalid_config" + JSON.stringify(configParseResult.error));
}

const config = configParseResult.data;

const app = express();
app.use(express.json());

app.get("/", async (req, res) => {
  log.info("handle_request", {
    httpRequest: { requestUrl: req.url, requestMethod: req.method },
  });
  try {
    log.info("fetching_from_puppeteer_worker");
    const response = await callPuppeteerWorker({
      templateId: "template",
    });

    if (!response.ok) {
      throw new Error("puppeteer_worker_error");
    }
    res.status(200).send("processed_successfully");
  } catch (error) {
    log.error("failed_to_process_request", { error });
    res.status(500).json({ error: "Internal server error" });
  }

  log.info("response", {
    httpRequest: {
      status: res.statusCode,
      requestUrl: req.url,
      requestMethod: req.method,
    },
  });
});

let googleAuthIdTokenClient: Promise<IdTokenClient> | null = null;
async function getFetchClient(): Promise<
  IdTokenClient | { fetch: typeof fetch }
> {
  if (process.env.NODE_ENV === "production") {
    if (googleAuthIdTokenClient) {
      return await googleAuthIdTokenClient;
    }
    const auth = new GoogleAuth();
    googleAuthIdTokenClient = auth.getIdTokenClient(TARGET_AUDIENCE);
    return await googleAuthIdTokenClient;
  }
  return { fetch };
}

async function callPuppeteerWorker(
  requestParams: PuppeteerWorkerRequest
): Promise<Response> {
  const fetchClient = await getFetchClient();

  const puppeteerWorkerUrl = config.puppeterWorkerUrl;

  log.info("calling_puppeteer_worker", { puppeteerWorkerUrl });

  const response = await fetchClient.fetch(puppeteerWorkerUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestParams),
  });
  return response;
}

app.listen(config.port, () => {
  log.info("REST_server_listening", { port: config.port });
  log.info("Environment", { env: process.env.NODE_ENV || "development" });
});
