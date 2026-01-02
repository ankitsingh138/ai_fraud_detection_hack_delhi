import {
  syncCompaniesToGraph,
  createCollusionEdges,
  syncBidsToGraph
} from "../services/neo4j.service.js";

export const buildGraph = async (req, res) => {
  await syncCompaniesToGraph();
  await createCollusionEdges();
  await syncBidsToGraph();

  res.json({ message: "Full graph (companies + bids) built" });
};

