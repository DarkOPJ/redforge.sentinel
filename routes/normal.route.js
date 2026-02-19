import express from "express";
import { file_handler } from "../controllers/normal.controller.js";

const router = express.Router();

router.get("", file_handler);

export default router;
