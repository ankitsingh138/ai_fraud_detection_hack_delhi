import express from "express";
const router = express.Router();

router.get("/health", (req, res) => {
    console.log('/health')
  res.json({
    status: "OK",
    service: "Procurement Backend",
    timestamp: new Date()
  });
});

export default router;
