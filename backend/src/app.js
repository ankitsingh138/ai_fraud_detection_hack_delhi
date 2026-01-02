import express from "express";
import cors from "cors";

import healthRoutes from "./routes/health.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import graphRoutes from "./routes/graph.routes.js";




const app = express();




app.use(cors());
app.use(express.json());
app.use("/api", healthRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/neo4j", graphRoutes);
app.get('/', (req,res)=>{
    res.send('hiii')
})

export default app;
