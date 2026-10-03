import type { Logger } from "@christian-wechsel/logger";
import type { RequestHandler } from "express";

const SENSITIVE_KEYS = [
  "password",
  "token",
  "secret",
  "session",
  "cookie",
  "authorization",
];

const LOGGED_HEADERS = [
  "x-forwarded-for",
  "x-forwarded-proto",
  "X-Forwarded-Host",
  "X-Real-IP",
  "host",
  "user-agent",
  "referer",
  "content-type",
  "accept",
  "origin",
] as const;

function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEYS.some((sensitive) =>
    key.toLowerCase().includes(sensitive),
  );
}

function normalizeToRecord(value: unknown): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value)) {
    result[key] = val;
  }
  return result;
}

function redactSensitiveFields(
  data: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      if (!isSensitiveKey(key)) return [key, value];
      if (key === "cookie")
        return [key, value !== undefined ? "Active" : "None"];
      return [key, "***REDACTED***"];
    }),
  );
}

function pickRelevantHeaders(
  headers: Record<string, unknown>,
): Record<string, unknown> {
  const picked: Record<string, unknown> = {};
  for (const header of LOGGED_HEADERS) {
    const key = header.toLowerCase();
    if (headers[key] !== undefined) {
      picked[key] = headers[key];
    }
  }
  picked["cookie"] = headers["cookie"];
  return picked;
}

export function createRequestLogger(logger: Logger): RequestHandler {
  return (req, _res, next) => {
    // req.ip resolves to real client IP via 'trust proxy' config
    logger.info(`Incoming Request: ${req.method} ${req.url} from ${req.ip}`);

    const relevantHeaders = redactSensitiveFields(
      pickRelevantHeaders(normalizeToRecord(req.headers)),
    );
    logger.debug(`Request Headers: ${JSON.stringify(relevantHeaders)}`);

    next();
  };
}
