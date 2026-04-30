/**
 * Cloud Run Structured Logger
 * Formats logs as JSON for automatic ingestion by Google Cloud Logging.
 */

type LogLevel =
  | "DEFAULT"
  | "DEBUG"
  | "INFO"
  | "NOTICE"
  | "WARNING"
  | "ERROR"
  | "CRITICAL"
  | "ALERT"
  | "EMERGENCY";

interface LogEntry {
  severity: LogLevel;
  message: string;
  [key: string]: unknown;
}

const log = (severity: LogLevel, message: string, extra?: object) => {
  const entry: LogEntry = {
    severity,
    message,
    ...extra,
    timestamp: new Date().toISOString(),
  };

  // In development, pretty print to console
  if (process.env.NODE_ENV === "development") {
    const color =
      severity === "ERROR" || severity === "CRITICAL" ? "\x1b[31m" : "\x1b[32m";
    console.log(`${color}[${severity}]\x1b[0m ${message}`, extra || "");
  } else {
    // In production (Cloud Run), print JSON
    console.log(JSON.stringify(entry));
  }
};

export const logger = {
  info: (msg: string, extra?: object) => log("INFO", msg, extra),
  warn: (msg: string, extra?: object) => log("WARNING", msg, extra),
  error: (msg: string, extra?: object) => log("ERROR", msg, extra),
  debug: (msg: string, extra?: object) => log("DEBUG", msg, extra),
  critical: (msg: string, extra?: object) => log("CRITICAL", msg, extra),
};
