import express from "express";
import z from "zod";
import { GoogleAuth } from "google-auth-library";
import { log } from "./utils/logging";

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

  const auth = new GoogleAuth();
  const client = await auth.getIdTokenClient(targetAudience);
  try {
    log.debug("fetching_from_puppeteer_worker");
    const response = await client.fetch(config.puppeterWorkerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        templateId: "4pQTTMHwqPCraONcfrU4",
      }),
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

app.listen(config.port, () => {
  log.info("REST_server_listening", { port: config.port });
  log.info("Environment", { env: process.env.NODE_ENV || "development" });
});
