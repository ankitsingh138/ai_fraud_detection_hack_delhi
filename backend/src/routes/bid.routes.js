import express from "express";
import {
  createBid,
  getBidsByTender,
  getBidsByCompany,
  getAllBids,
  updateBidStatus
} from "../controllers/bid.controller.js";

const router = express.Router();

// Create a new bid
router.post("/", createBid);

// Get all bids
router.get("/", getAllBids);

// Get bids for a specific tender
router.get("/tender/:tenderId", getBidsByTender);

// Get bids by company
router.get("/company/:companyId", getBidsByCompany);

// Update bid status
router.patch("/:bidId/status", updateBidStatus);

export default router;

