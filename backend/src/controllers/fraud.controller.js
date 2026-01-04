import {
  getAddressCollusionGraph,
  getIPCollusionGraph,
  getSharedOwnershipGraph,
  getFinancialTiesGraph
} from "../services/neo4j.service.js";
import { runTailoredClauseAnalysis, getTailoredClauseResults } from "../services/nlp.service.js";
import TenderSpecification from "../models/TenderSpecification.model.js";
import Tender from "../models/Tender.model.js";

// Address Collusion - companies sharing same address
export const getAddressCollusion = async (req, res) => {
  try {
    const result = await getAddressCollusionGraph();
    res.json(result);
  } catch (error) {
    console.error("Address collusion error:", error);
    res.status(500).json({ error: error.message });
  }
};

// IP Collusion - bids from same IP
export const getIPCollusion = async (req, res) => {
  try {
    const result = await getIPCollusionGraph();
    res.json(result);
  } catch (error) {
    console.error("IP collusion error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Shared Ownership - persons owning multiple companies
export const getSharedOwnership = async (req, res) => {
  try {
    const result = await getSharedOwnershipGraph();
    res.json(result);
  } catch (error) {
    console.error("Shared ownership error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Financial Ties - shared bank accounts, notaries, etc.
export const getFinancialTies = async (req, res) => {
  try {
    const result = await getFinancialTiesGraph();
    res.json(result);
  } catch (error) {
    console.error("Financial ties error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Trigger NLP analysis on tender specifications
export const analyzeTenders = async (req, res) => {
  try {
    const result = await runTailoredClauseAnalysis();
    res.json(result);
  } catch (error) {
    console.error("NLP analysis error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get high-risk tenders (tailored clauses with score > 0.8)
export const getTailoredClauses = async (req, res) => {
  try {
    const { threshold = 0.5 } = req.query;
    
    // Get specifications with high restrictiveness scores
    const highRiskSpecs = await TenderSpecification.find({
      restrictiveness_score: { $gte: parseFloat(threshold) }
    }).sort({ restrictiveness_score: -1 });

    // Group by tender and get tender details
    const tenderIds = [...new Set(highRiskSpecs.map(s => s.tenderId))];
    
    const results = await Promise.all(tenderIds.map(async (tenderId) => {
      const tender = await Tender.findOne({ tenderId });
      const specs = highRiskSpecs.filter(s => s.tenderId === tenderId);
      
      return {
        tenderId,
        tender: tender ? {
          title: tender.title,
          deptName: tender.deptName,
          location: tender.location,
          estValueInCr: tender.estValueInCr,
          publishDate: tender.publishDate
        } : null,
        riskScore: Math.max(...specs.map(s => s.restrictiveness_score)),
        flaggedClauses: specs.map(s => ({
          clauseId: s.clauseId,
          requirementText: s.requirementText,
          score: s.restrictiveness_score
        }))
      };
    }));

    res.json({
      threshold: parseFloat(threshold),
      count: results.length,
      highRiskTenders: results
    });
  } catch (error) {
    console.error("Tailored clauses error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get fraud summary dashboard
export const getFraudSummary = async (req, res) => {
  try {
    const [addressData, ipData, ownershipData, financialData] = await Promise.all([
      getAddressCollusionGraph(),
      getIPCollusionGraph(),
      getSharedOwnershipGraph(),
      getFinancialTiesGraph()
    ]);

    // Get high-risk tender count
    const highRiskCount = await TenderSpecification.countDocuments({
      restrictiveness_score: { $gte: 0.8 }
    });

    res.json({
      summary: {
        addressCollusionCount: addressData.tableData?.length || 0,
        ipCollusionCount: ipData.tableData?.length || 0,
        sharedOwnershipCount: ownershipData.tableData?.length || 0,
        financialTiesCount: financialData.tableData?.length || 0,
        highRiskTenderCount: highRiskCount
      },
      lastUpdated: new Date()
    });
  } catch (error) {
    console.error("Fraud summary error:", error);
    res.status(500).json({ error: error.message });
  }
};

