import express from "express";
import { buildGraph } from "../controllers/graph.controller.js";

const router = express.Router();

router.post("/build", buildGraph);

export default router;
