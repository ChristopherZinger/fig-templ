import winston from "winston";
import { LoggingWinston } from "@google-cloud/logging-winston";
import type Transport from "winston-transport";
import { v4 as uuid } from "uuid";

const transports: Transport[] = [new winston.transports.Console()];

// if (process.env.NODE_ENV === "production") {
const loggingWinston = new LoggingWinston();
transports.push(loggingWinston);
// }

const logger = winston.createLogger({
  transports,
});

const config = {
  [LoggingWinston.LOGGING_TRACE_KEY]: uuid(),
};

export const log = {
  info: (msg: string, info?: Record<string, unknown>) => {
    logger.info(msg, { ...info, ...config });
  },
  debug: (msg: string, info?: Record<string, unknown>) => {
    logger.debug(msg, { ...info, ...config });
  },
  error: (msg: string, info?: Record<string, unknown>) => {
    logger.error(msg, { ...info, ...config });
  },
  warn: (msg: string, info: Record<string, unknown>) => {
    logger.warn(msg, { ...info, ...config });
  },
};
