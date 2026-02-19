import fs from "fs";
import path from "path";
import { fileExists } from "../utils/file_registry.js";
import { createChildLogger } from "../utils/logger.js";

const log = createChildLogger("rfi");

// ── Content-Type map per technology ──────────────────────────────────
const CONTENT_TYPES = {
  php: "text/x-php",
  asp: "text/x-asp",
  jsp: "text/x-jsp",
  python: "text/x-python",
  perl: "text/x-perl",
  coldfusion: "text/x-coldfusion",
  shell: "text/x-shellscript",
};

/**
 * Serves a validated RFI test payload file.
 * req.validated_path and req.validated_technology are set by validate_path middleware.
 */
const rfi_handler = async (req, res) => {
  const { validated_path, validated_technology } = req;
  const filename = path.basename(validated_path);

  // Verify file exists on disk
  if (!fileExists(validated_path)) {
    log.warn("File not found", {
      technology: validated_technology,
      filename,
      ip: req.ip,
    });
    return res.status(404).json({
      error: "File not found",
      message: `Payload file "${filename}" does not exist in the ${validated_technology} directory.`,
    });
  }

  // Log the served event
  log.info("Serving RFI payload", {
    technology: validated_technology,
    filename,
    ip: req.ip,
  });

  // Set appropriate content type and stream the file
  const content_type = CONTENT_TYPES[validated_technology] || "text/plain";
  res.setHeader("Content-Type", content_type);
  res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
  res.setHeader("X-Payload-Technology", validated_technology);

  const stream = fs.createReadStream(validated_path);
  stream.on("error", (err) => {
    log.error("File stream error", { error: err.message, filename });
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal error reading file." });
    }
  });

  stream.pipe(res);
};

export { rfi_handler };
