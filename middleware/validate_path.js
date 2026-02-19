import {
  isAllowedTechnology,
  isAllowedExtension,
  getFilePath,
} from "../utils/file_registry.js";
import { createChildLogger } from "../utils/logger.js";

const log = createChildLogger("validate_path");

/**
 * Middleware: validates :technology and :filename route params.
 * Blocks path traversal, LFI, RFI, null bytes, hidden files, and wrong extensions.
 */
const validate_path = (req, res, next) => {
  const { technology, filename } = req.params;

  // ── 1. Technology must exist ─────────────────────────────────────
  if (!technology || !isAllowedTechnology(technology)) {
    log.warn("Rejected unknown technology", { technology, ip: req.ip });
    return res.status(400).json({
      error: "Invalid technology",
      message: `Technology "${technology}" is not supported. Use a valid technology path.`,
    });
  }

  // ── 2. Filename must be provided ─────────────────────────────────
  if (!filename) {
    log.warn("Missing filename", { technology, ip: req.ip });
    return res.status(400).json({
      error: "Missing filename",
      message: "A filename must be provided in the path.",
    });
  }

  // ── 3. Reject obvious traversal / injection characters ───────────
  const FORBIDDEN_PATTERNS = [
    "..",
    "/",
    "\\",
    "\0",
    "%2e",
    "%2f",
    "%5c",
    "%00",
  ];
  const lower_filename = filename.toLowerCase();

  for (const pattern of FORBIDDEN_PATTERNS) {
    if (lower_filename.includes(pattern)) {
      log.warn("Path traversal attempt blocked", {
        technology,
        filename,
        pattern,
        ip: req.ip,
      });
      return res.status(400).json({
        error: "Invalid filename",
        message: "Filename contains forbidden characters.",
      });
    }
  }

  // ── 4. No hidden files ───────────────────────────────────────────
  if (filename.startsWith(".")) {
    log.warn("Hidden file access attempt blocked", {
      technology,
      filename,
      ip: req.ip,
    });
    return res.status(400).json({
      error: "Invalid filename",
      message: "Access to hidden files is not allowed.",
    });
  }

  // ── 5. Extension must match technology ───────────────────────────
  if (!isAllowedExtension(technology, filename)) {
    log.warn("Extension mismatch", { technology, filename, ip: req.ip });
    return res.status(400).json({
      error: "Invalid file extension",
      message: `File extension does not match technology "${technology}".`,
    });
  }

  // ── 6. Resolve path and verify it stays within files/ ────────────
  const safe_path = getFilePath(technology, filename);

  if (!safe_path) {
    log.warn("Path resolution failed / escaped sandbox", {
      technology,
      filename,
      ip: req.ip,
    });
    return res.status(400).json({
      error: "Invalid path",
      message: "Could not resolve a safe file path.",
    });
  }

  // Attach the validated path to the request for the controller
  req.validated_path = safe_path;
  req.validated_technology = technology.toLowerCase();

  next();
};

export { validate_path };
