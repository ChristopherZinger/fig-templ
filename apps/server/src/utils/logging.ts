import winston from "winston";
import { LoggingWinston } from "@google-cloud/logging-winston";
import type Transport from "winston-transport";

const transports: Transport[] = [new winston.transports.Console()];

// if (process.env.NODE_ENV === "production") {
const loggingWinston = new LoggingWinston();
transports.push(loggingWinston);
// }

const logger = winston.createLogger({
  transports,
});

export const log = {
  info: (msg: string, info?: Record<string, unknown>) => {
    logger.info(msg, info);
  },
  debug: (msg: string, info?: Record<string, unknown>) => {
    logger.debug(msg, info);
  },
  error: (msg: string, info?: Record<string, unknown>) => {
    logger.error(msg, info);
  },
  warn: (msg: string, info: Record<string, unknown>) => {
    logger.warn(msg, info);
  },
};
