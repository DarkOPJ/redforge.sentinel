import express from "express";
import { stream_logs } from "../controllers/logs.controller.js";

const router = express.Router();

// GET /logs/stream - Real-time SSE log stream
router.get("/stream", stream_logs);

export default router;
