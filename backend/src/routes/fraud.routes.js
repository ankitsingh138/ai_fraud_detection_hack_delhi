import express from "express";
import {
  getAddressCollusion,
  getIPCollusion,
  getSharedOwnership,
  getFinancialTies,
  analyzeTenders,
  getTailoredClauses,
  getFraudSummary
} from "../controllers/fraud.controller.js";

const router = express.Router();

// Get fraud detection summary
router.get("/summary", getFraudSummary);

// Address collusion - companies at same address
router.get("/address-collusion", getAddressCollusion);

// IP collusion - bids from same IP
router.get("/ip-collusion", getIPCollusion);

// Shared ownership - persons owning multiple companies
router.get("/shared-ownership", getSharedOwnership);

// Financial ties - shared bank accounts, notaries, guarantors
router.get("/financial-ties", getFinancialTies);

// Trigger NLP analysis on tenders
router.post("/analyze-tenders", analyzeTenders);

// Get high-risk tenders (tailored clauses)
router.get("/tailored-clauses", getTailoredClauses);

export default router;

