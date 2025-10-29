import winston from "winston";
import { LoggingWinston } from "@google-cloud/logging-winston";

const isProduction = process.env.NODE_ENV === "production";
const GCLOUD_PROJECT_ID = process.env.GCLOUD_PROJECT_ID;
const GOOGLE_APPLICATION_CREDENTIALS =
  process.env.GOOGLE_APPLICATION_CREDENTIALS;

const FORMAT = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

// Only use GCP logging in production
let transports: winston.transport[] = [
  new winston.transports.Console({
    format: FORMAT,
  }),
];

if (isProduction && GCLOUD_PROJECT_ID) {
  const loggingWinston = new LoggingWinston({
    projectId: GCLOUD_PROJECT_ID,
    keyFilename: GOOGLE_APPLICATION_CREDENTIALS,
    labels: {
      service: "templetto",
      environment: isProduction ? "production" : "development",
    },
    format: FORMAT,
  });
  transports = [loggingWinston];
}

export const log = winston.createLogger({
  level: "debug",
  transports,
});
