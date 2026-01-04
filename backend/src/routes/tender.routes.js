import express from "express";
import {
  createTender,
  getTenders,
  getTenderById,
  updateTenderStatus,
  getTenderStats
} from "../controllers/tender.controller.js";

const router = express.Router();

// Create a new tender
router.post("/", createTender);

// Get all tenders (with optional filters: status, deptName)
router.get("/", getTenders);

// Get tender statistics
router.get("/stats", getTenderStats);

// Get tender by ID
router.get("/:tenderId", getTenderById);

// Update tender status
router.patch("/:tenderId/status", updateTenderStatus);

export default router;

