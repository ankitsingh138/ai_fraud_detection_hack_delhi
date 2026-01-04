import {
  syncCompaniesToGraph,
  createCollusionEdges,
  syncBidsToGraph,
  syncTendersToGraph,
  syncPersonsToGraph,
  syncFinancialTiesToGraph,
  syncAllToGraph
} from "../services/neo4j.service.js";

export const buildGraph = async (req, res) => {
  try {
    await syncAllToGraph();
    res.json({ message: "Full graph (companies + tenders + bids + persons + financial ties) built successfully" });
  } catch (error) {
    console.error("Graph build error:", error);
    res.status(500).json({ error: error.message });
  }
};

