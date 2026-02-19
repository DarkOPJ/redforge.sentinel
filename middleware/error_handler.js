import { createChildLogger } from "../utils/logger.js";

const log = createChildLogger("error_handler");

/**
 * 404 catch-all — placed after all route definitions.
 */
const not_found_handler = (req, res, _next) => {
  log.warn("Route not found", {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    host: req.get("host") || "",
    user_agent: req.get("user-agent") || "",
  });

  return res.status(404).json({
    error: "Not Found",
    message: `The route ${req.method} ${req.originalUrl} does not exist.`,
  });
};

/**
 * Global error handler — catches thrown/unhandled errors.
 * Must have 4 parameters for Express to recognise it as an error handler.
 */
// eslint-disable-next-line no-unused-vars
const global_error_handler = (err, req, res, _next) => {
  log.error("Unhandled error", {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  });

  return res.status(err.status || 500).json({
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong."
        : err.message,
  });
};

export { not_found_handler, global_error_handler };
