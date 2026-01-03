import express from "express";
import cors from "cors";

import healthRoutes from "./routes/health.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import graphRoutes from "./routes/graph.routes.js";
import tenderRoutes from "./routes/tender.routes.js";
import bidRoutes from "./routes/bid.routes.js";
import fraudRoutes from "./routes/fraud.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.use("/api", healthRoutes);

// File upload
app.use("/api/upload", uploadRoutes);

// Neo4j graph operations
app.use("/api/neo4j", graphRoutes);

// Tender management
app.use("/api/tenders", tenderRoutes);

// Bid management
app.use("/api/bids", bidRoutes);

// Fraud detection
app.use("/api/fraud", fraudRoutes);

app.get('/', (req, res) => {
  res.json({ 
    message: 'AI Fraud Detection API',
    endpoints: {
      tenders: '/api/tenders',
      bids: '/api/bids',
      fraud: '/api/fraud',
      neo4j: '/api/neo4j'
    }
  });
});

export default app;
