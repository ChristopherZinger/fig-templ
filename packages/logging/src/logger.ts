import winston from "winston";
import { LoggingWinston } from "@google-cloud/logging-winston";
import { OpenTelemetryTransportV3 } from "@opentelemetry/winston-transport";

const NODE_ENV = process.env.NODE_ENV || "development";
const GCLOUD_PROJECT_ID = process.env.GCLOUD_PROJECT_ID;
const GOOGLE_APPLICATION_CREDENTIALS =
  process.env.GOOGLE_APPLICATION_CREDENTIALS;

console.log({
  NODE_ENV,
  GCLOUD_PROJECT_ID,
  GOOGLE_APPLICATION_CREDENTIALS,
});

const FORMAT = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

// Only use GCP logging in production
let transports: winston.transport[] = [
  new winston.transports.Console({
    format: FORMAT,
  }),
  // Add OpenTelemetry transport to bridge Winston logs to OTel
  new OpenTelemetryTransportV3(),
];

if (NODE_ENV === "production" && GCLOUD_PROJECT_ID) {
  const loggingWinston = new LoggingWinston({
    projectId: GCLOUD_PROJECT_ID,
    keyFilename: GOOGLE_APPLICATION_CREDENTIALS,
    labels: {
      service: "templetto",
      environment: NODE_ENV,
    },

    format: FORMAT,
  });
  transports = [loggingWinston, new OpenTelemetryTransportV3()];
}

export const log = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  transports,
});
