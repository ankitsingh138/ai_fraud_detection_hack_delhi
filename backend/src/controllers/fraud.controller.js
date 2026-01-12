import {
  getAddressCollusionGraph,
  getIPCollusionGraph,
  getSharedOwnershipGraph,
  getFinancialTiesGraph
} from "../services/neo4j.service.js";
import { runTailoredClauseAnalysis, getTailoredClauseResults } from "../services/nlp.service.js";
import TenderSpecification from "../models/TenderSpecification.model.js";
import Tender from "../models/Tender.model.js";
import Company from "../models/Company.model.js";

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

// Check a specific tender for all fraud indicators
export const checkTender = async (req, res) => {
  try {
    const { tenderId } = req.params;
    
    // Get tender details
    const tender = await Tender.findOne({ tenderId });
    if (!tender) {
      return res.status(404).json({ error: "Tender not found" });
    }

    const checks = {
      tenderId,
      tender: {
        title: tender.title,
        deptName: tender.deptName,
        location: tender.location,
        pincode: tender.pincode,
        estValueInCr: tender.estValueInCr
      },
      results: []
    };

    // 1. Address Collusion Check - Companies in same location as tender
    try {
      const addressData = await getAddressCollusionGraph();
      const addressMatches = addressData.tableData?.filter(item => 
        item.address?.includes(tender.pincode) || 
        item.address?.toLowerCase().includes(tender.location?.toLowerCase())
      ) || [];
      
      checks.results.push({
        type: 'address_collusion',
        label: 'Address Collusion',
        status: addressMatches.length > 0 ? 'warning' : 'clear',
        count: addressMatches.length,
        message: addressMatches.length > 0 
          ? `${addressMatches.length} companies share addresses in tender location`
          : 'No address collusion detected',
        details: addressMatches.slice(0, 5)
      });
    } catch (e) {
      checks.results.push({
        type: 'address_collusion',
        label: 'Address Collusion',
        status: 'error',
        message: 'Check unavailable'
      });
    }

    // 2. IP Collusion Check - Check if there's IP collusion in system
    try {
      const ipData = await getIPCollusionGraph();
      const ipIssues = ipData.tableData?.length || 0;
      
      checks.results.push({
        type: 'ip_collusion',
        label: 'IP Collusion',
        status: ipIssues > 0 ? 'warning' : 'clear',
        count: ipIssues,
        message: ipIssues > 0 
          ? `${ipIssues} IP collusion patterns detected in system`
          : 'No IP collusion detected',
        details: ipData.tableData?.slice(0, 5) || []
      });
    } catch (e) {
      checks.results.push({
        type: 'ip_collusion',
        label: 'IP Collusion',
        status: 'error',
        message: 'Check unavailable'
      });
    }

    // 3. Shared Ownership Check
    try {
      const ownershipData = await getSharedOwnershipGraph();
      const ownershipIssues = ownershipData.tableData?.length || 0;
      
      checks.results.push({
        type: 'shared_ownership',
        label: 'Shared Ownership',
        status: ownershipIssues > 0 ? 'warning' : 'clear',
        count: ownershipIssues,
        message: ownershipIssues > 0 
          ? `${ownershipIssues} shared ownership patterns detected`
          : 'No shared ownership detected',
        details: ownershipData.tableData?.slice(0, 5) || []
      });
    } catch (e) {
      checks.results.push({
        type: 'shared_ownership',
        label: 'Shared Ownership',
        status: 'error',
        message: 'Check unavailable'
      });
    }

    // 4. Financial Ties Check
    try {
      const financialData = await getFinancialTiesGraph();
      const financialIssues = financialData.tableData?.length || 0;
      
      checks.results.push({
        type: 'financial_ties',
        label: 'Financial Ties',
        status: financialIssues > 0 ? 'warning' : 'clear',
        count: financialIssues,
        message: financialIssues > 0 
          ? `${financialIssues} financial tie patterns detected`
          : 'No suspicious financial ties',
        details: financialData.tableData?.slice(0, 5) || []
      });
    } catch (e) {
      checks.results.push({
        type: 'financial_ties',
        label: 'Financial Ties',
        status: 'error',
        message: 'Check unavailable'
      });
    }

    // 5. Tailored Clauses Check - Run NLP on this tender's specifications
    try {
      const specs = await TenderSpecification.find({ tenderId });
      const highRiskSpecs = specs.filter(s => s.restrictiveness_score >= 0.7);
      
      // If no scores yet, trigger analysis
      const unanalyzedSpecs = specs.filter(s => s.restrictiveness_score === null);
      if (unanalyzedSpecs.length > 0) {
        // Run NLP analysis in background
        runTailoredClauseAnalysis().catch(console.error);
      }

      const maxScore = specs.length > 0 
        ? Math.max(...specs.map(s => s.restrictiveness_score || 0))
        : 0;

      checks.results.push({
        type: 'tailored_clauses',
        label: 'Tailored Clauses',
        status: maxScore >= 0.8 ? 'danger' : maxScore >= 0.5 ? 'warning' : 'clear',
        count: highRiskSpecs.length,
        score: maxScore,
        message: highRiskSpecs.length > 0
          ? `${highRiskSpecs.length} high-risk clauses detected (max score: ${maxScore.toFixed(2)})`
          : specs.length === 0 
            ? 'No specifications to analyze'
            : 'Clauses appear fair',
        details: highRiskSpecs.map(s => ({
          clauseId: s.clauseId,
          text: s.requirementText?.substring(0, 100) + '...',
          score: s.restrictiveness_score
        }))
      });
    } catch (e) {
      checks.results.push({
        type: 'tailored_clauses',
        label: 'Tailored Clauses',
        status: 'error',
        message: 'Check unavailable'
      });
    }

    // Summary
    const warningCount = checks.results.filter(r => r.status === 'warning').length;
    const dangerCount = checks.results.filter(r => r.status === 'danger').length;
    
    checks.summary = {
      overallStatus: dangerCount > 0 ? 'danger' : warningCount > 0 ? 'warning' : 'clear',
      warnings: warningCount,
      dangers: dangerCount,
      recommendation: dangerCount > 0 
        ? 'High risk - Review carefully before approval'
        : warningCount > 0 
          ? 'Some concerns - Manual review recommended'
          : 'Low risk - Safe to approve'
    };

    res.json(checks);
  } catch (error) {
    console.error("Check tender error:", error);
    res.status(500).json({ error: error.message });
  }
};

