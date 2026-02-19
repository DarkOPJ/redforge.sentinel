import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FILES_ROOT = path.resolve(__dirname, "..", "files");

// ── Technology → Allowed Extensions Map ──────────────────────────────
const TECH_MAP = {
  php: [".php"],
  asp: [".asp", ".aspx"],
  jsp: [".jsp"],
  python: [".py"],
  perl: [".pl", ".cgi"],
  coldfusion: [".cfm"],
  shell: [".sh"],
};

/**
 * Returns true if the technology key exists in the registry.
 */
const isAllowedTechnology = (tech) => {
  return Object.prototype.hasOwnProperty.call(TECH_MAP, tech.toLowerCase());
};

/**
 * Returns true if the filename has an extension allowed for the given technology.
 */
const isAllowedExtension = (tech, filename) => {
  const ext = path.extname(filename).toLowerCase();
  const allowed = TECH_MAP[tech.toLowerCase()];
  return allowed ? allowed.includes(ext) : false;
};

/**
 * Validates and returns the absolute file path within files/<tech>/.
 * Returns null if validation fails for any reason.
 */
const getFilePath = (tech, filename) => {
  const normalised_tech = tech.toLowerCase();

  // Guard: technology must exist
  if (!isAllowedTechnology(normalised_tech)) return null;

  // Guard: no path separators, no parent traversal, no null bytes, no hidden files
  if (
    filename.includes("..") ||
    filename.includes("/") ||
    filename.includes("\\") ||
    filename.includes("\0") ||
    filename.startsWith(".")
  ) {
    return null;
  }

  // Guard: extension must match
  if (!isAllowedExtension(normalised_tech, filename)) return null;

  // Build and verify the resolved path stays inside FILES_ROOT
  const target = path.resolve(FILES_ROOT, normalised_tech, filename);

  if (!target.startsWith(FILES_ROOT + path.sep)) return null;

  return target;
};

/**
 * Checks whether a validated file path actually exists on disk.
 */
const fileExists = (filepath) => {
  try {
    return fs.existsSync(filepath) && fs.statSync(filepath).isFile();
  } catch {
    return false;
  }
};

/**
 * Returns a list of all registered technologies.
 */
const listTechnologies = () => Object.keys(TECH_MAP);

/**
 * Returns allowed extensions for a given technology.
 */
const getExtensions = (tech) => TECH_MAP[tech.toLowerCase()] || [];

export {
  TECH_MAP,
  FILES_ROOT,
  isAllowedTechnology,
  isAllowedExtension,
  getFilePath,
  fileExists,
  listTechnologies,
  getExtensions,
};
