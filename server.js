import express from "express";
import cors from "cors";
import helmet from "helmet";
import ENV from "./utils/env.js";
import { createChildLogger } from "./utils/logger.js";

// Middleware imports
import { request_logger } from "./middleware/request_logger.js";
import {
  not_found_handler,
  global_error_handler,
} from "./middleware/error_handler.js";

// Route imports
import normal_router from "./routes/normal.route.js";
import rfi_router from "./routes/rfi.route.js";
import logs_router from "./routes/logs.route.js";

const log = createChildLogger("server");
const app = express();

// ── Global Middleware ────────────────────────────────────────────────
app.use(helmet()); // Security headers
app.use(cors()); // CORS
app.use(express.json()); // Parse JSON bodies
app.set("trust proxy", 1); // Correct IP behind proxies
app.use(request_logger); // Log every request

// ── Routes ───────────────────────────────────────────────────────────
app.use("/", normal_router);
app.use("/rfi", rfi_router);
app.use("/logs", logs_router);

// ── Error Handling (must be after routes) ────────────────────────────
app.use(not_found_handler);
app.use(global_error_handler);

// ── Start ────────────────────────────────────────────────────────────
const PORT = ENV.PORT || 3000;

app.listen(PORT, () => {
  log.info(`RedForge Sentinel running on port ${PORT}`, { env: ENV.NODE_ENV });
});
