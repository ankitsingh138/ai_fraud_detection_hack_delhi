import express from "express";
import {
  createTender,
  getTenders,
  getTenderById,
  updateTenderStatus,
  getTenderStats,
  approveTender,
  rejectTender,
  resubmitTender
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

// Approve tender (Authority action)
router.post("/:tenderId/approve", approveTender);

// Reject tender (Authority action)
router.post("/:tenderId/reject", rejectTender);

// Resubmit rejected tender (Government action)
router.post("/:tenderId/resubmit", resubmitTender);

export default router;

