import express from "express";
import upload from "../middlewares/upload.middleware.js";
import { uploadCompanies, uploadBids } from "../controllers/upload.controller.js";

const router = express.Router();

router.post("/companies", upload.single("file"), uploadCompanies);
router.post("/bids", upload.single("file"), uploadBids);

export default router;
