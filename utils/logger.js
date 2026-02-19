import winston from "winston";
import path from "path";
import { fileURLToPath } from "url";
import ENV from "./env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOG_DIR = path.join(__dirname, "..", "logs");

// ── Formats ──────────────────────────────────────────────────────────
const timestamp_format = winston.format.timestamp({
  format: "YYYY-MM-DD HH:mm:ss.SSS",
});

const json_format = winston.format.combine(
  timestamp_format,
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

const console_format = winston.format.combine(
  timestamp_format,
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, label, ...meta }) => {
    const prefix = label ? `[${label}]` : "";
    const extras = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    return `${timestamp} ${level} ${prefix} ${message}${extras}`;
  }),
);

// ── Transports ───────────────────────────────────────────────────────
const transports = [
  new winston.transports.Console({
    format: console_format,
    level: ENV.LOG_LEVEL,
  }),
  new winston.transports.File({
    filename: path.join(LOG_DIR, "combined.log"),
    format: json_format,
    level: ENV.LOG_LEVEL,
    maxsize: 5 * 1024 * 1024, // 5 MB rotation
    maxFiles: 5,
  }),
  new winston.transports.File({
    filename: path.join(LOG_DIR, "error.log"),
    format: json_format,
    level: "error",
    maxsize: 5 * 1024 * 1024,
    maxFiles: 3,
  }),
];

// ── Root Logger ──────────────────────────────────────────────────────
const logger = winston.createLogger({
  level: ENV.LOG_LEVEL,
  defaultMeta: { service: "redforge-sentinel" },
  transports,
  exitOnError: false,
});

/**
 * Create a child logger with a specific label.
 * Usage: const log = createChildLogger("rfi");
 */
const createChildLogger = (label) => {
  return logger.child({ label });
};

export { logger, createChildLogger };
export default logger;
