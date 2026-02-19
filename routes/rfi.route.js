import express from "express";
import { rfi_handler } from "../controllers/rfi.controller.js";
import { validate_path } from "../middleware/validate_path.js";

const router = express.Router();

// GET /rfi/:technology/:filename
// Everything is in the path — no query parameters.
router.get("/:technology/:filename", validate_path, rfi_handler);

export default router;
