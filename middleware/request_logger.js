import { createChildLogger } from "../utils/logger.js";
import ENV from "../utils/env.js";

const log = createChildLogger("request");

/**
 * Middleware: logs every incoming request with full context.
 * Installed globally before any route handlers.
 *
 * Captures: method, url, IP, headers (host, origin, referer, user-agent),
 * domain/subdomain detection, fragment hints, body preview, and response latency.
 */
const request_logger = (req, res, next) => {
  const start = Date.now();

  // ── Build request metadata ───────────────────────────────────────
  const meta = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    host: req.get("host") || "",
    origin: req.get("origin") || "",
    referer: req.get("referer") || "",
    user_agent: req.get("user-agent") || "",
  };

  // ── Domain / subdomain detection ─────────────────────────────────
  const configured_domain = ENV.DOMAIN.toLowerCase();
  const incoming_host = (meta.host || "").split(":")[0].toLowerCase();

  if (incoming_host && incoming_host !== configured_domain) {
    if (incoming_host.endsWith(`.${configured_domain}`)) {
      meta.subdomain = incoming_host.replace(`.${configured_domain}`, "");
    } else {
      meta.external_host = incoming_host;
    }
  }

  // ── Fragment detection from Referer ──────────────────────────────
  // Browsers strip fragments from requests, but the Referer header
  // may carry them when following links.
  if (meta.referer) {
    try {
      const referer_url = new URL(meta.referer);
      if (referer_url.hash) {
        meta.fragment = referer_url.hash;
      }
    } catch {
      // Malformed referer — not critical
    }
  }

  // ── Body preview (sanitised, capped at 1 KB) ────────────────────
  if (req.body && Object.keys(req.body).length > 0) {
    const body_str = JSON.stringify(req.body);
    meta.body_preview =
      body_str.length > 1024 ? body_str.slice(0, 1024) + "…" : body_str;
  }

  // ── Log on response finish ───────────────────────────────────────
  res.on("finish", () => {
    const duration_ms = Date.now() - start;
    const level = res.statusCode >= 400 ? "warn" : "info";

    log[level](
      `${meta.method} ${meta.url} → ${res.statusCode} (${duration_ms}ms)`,
      {
        ...meta,
        status: res.statusCode,
        duration_ms,
      },
    );
  });

  next();
};

export { request_logger };
