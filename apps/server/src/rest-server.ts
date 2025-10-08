import express from "express";
import z from "zod";
import { GoogleAuth } from "google-auth-library";

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

app.get("/", async (_, res) => {
  const auth = new GoogleAuth();
  console.info(`request ${url} with target audience ${targetAudience}`);
  const client = await auth.getIdTokenClient(targetAudience);
  try {
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
    return;
  } catch (error) {
    console.error("failed_to_process_request", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
});

app.listen(config.port, () => {
  console.log(`REST server listening on port ${config.port}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
