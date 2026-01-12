import Tender from "../models/Tender.model.js";
import TenderSpecification from "../models/TenderSpecification.model.js";
import { syncTendersToGraph } from "../services/neo4j.service.js";

// Generate tender ID
const generateTenderId = (deptName, year, tenderNum) => {
  return `${deptName}-${year}-${String(tenderNum).padStart(3, '0')}`;
};

// Get next tender number for department
const getNextTenderNum = async (deptName, year) => {
  const lastTender = await Tender.findOne({ deptName, year })
    .sort({ tenderNum: -1 })
    .select('tenderNum');
  return lastTender ? lastTender.tenderNum + 1 : 1;
};

// Create a new tender
export const createTender = async (req, res) => {
  try {
    const { deptName, title, location, pincode, estValueInCr, publishDate, closingDate, mandatoryConditions } = req.body;
    
    const year = new Date(publishDate || Date.now()).getFullYear();
    const tenderNum = await getNextTenderNum(deptName, year);
    const tenderId = generateTenderId(deptName, year, tenderNum);

    const tender = new Tender({
      tenderId,
      deptName,
      year,
      tenderNum,
      title,
      location,
      pincode,
      estValueInCr: parseFloat(estValueInCr),
      publishDate: publishDate || new Date(),
      closingDate,
      status: 'pending_approval'
    });

    await tender.save();

    // If mandatory conditions provided, save as specification
    if (mandatoryConditions) {
      const clauseId = `CL-${Date.now()}`;
      const spec = new TenderSpecification({
        tenderId,
        clauseId,
        sectionType: 'Technical Eligibility',
        requirementText: mandatoryConditions,
        isMandatory: true,
        restrictiveness_score: null
      });
      await spec.save();
    }

    // Sync to Neo4j
    try {
      await syncTendersToGraph();
    } catch (neo4jErr) {
      console.error("Neo4j sync error:", neo4jErr.message);
    }

    res.status(201).json({ 
      message: "Tender created successfully", 
      tender,
      tenderId 
    });
  } catch (error) {
    console.error("Create tender error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get all tenders with optional filters
export const getTenders = async (req, res) => {
  try {
    const { status, deptName, limit = 200 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (deptName) filter.deptName = deptName;

    // Sort by createdAt first (so new tenders appear at top), then by publishDate
    const tenders = await Tender.find(filter)
      .sort({ createdAt: -1, publishDate: -1 })
      .limit(parseInt(limit));

    res.json(tenders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get tender by ID with specifications
export const getTenderById = async (req, res) => {
  try {
    const { tenderId } = req.params;
    
    const tender = await Tender.findOne({ tenderId });
    if (!tender) {
      return res.status(404).json({ error: "Tender not found" });
    }

    const specifications = await TenderSpecification.find({ tenderId });

    res.json({ tender, specifications });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update tender status
export const updateTenderStatus = async (req, res) => {
  try {
    const { tenderId } = req.params;
    const { status } = req.body;

    const tender = await Tender.findOneAndUpdate(
      { tenderId },
      { status },
      { new: true }
    );

    if (!tender) {
      return res.status(404).json({ error: "Tender not found" });
    }

    res.json({ message: "Tender status updated", tender });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Approve tender (Authority action)
export const approveTender = async (req, res) => {
  try {
    const { tenderId } = req.params;
    const { reviewedBy } = req.body;

    const tender = await Tender.findOne({ tenderId });
    if (!tender) {
      return res.status(404).json({ error: "Tender not found" });
    }

    if (tender.status !== 'pending_approval') {
      return res.status(400).json({ error: "Tender is not pending approval" });
    }

    tender.status = 'active';
    tender.reviewedBy = reviewedBy || 'Authority';
    tender.reviewedAt = new Date();
    tender.rejectionReason = null;
    await tender.save();

    // Sync to Neo4j
    try {
      await syncTendersToGraph();
    } catch (neo4jErr) {
      console.error("Neo4j sync error:", neo4jErr.message);
    }

    res.json({ message: "Tender approved successfully", tender });
  } catch (error) {
    console.error("Approve tender error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Reject tender (Authority action)
export const rejectTender = async (req, res) => {
  try {
    const { tenderId } = req.params;
    const { rejectionReason, reviewedBy } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({ error: "Rejection reason is required" });
    }

    const tender = await Tender.findOne({ tenderId });
    if (!tender) {
      return res.status(404).json({ error: "Tender not found" });
    }

    if (tender.status !== 'pending_approval') {
      return res.status(400).json({ error: "Tender is not pending approval" });
    }

    tender.status = 'rejected';
    tender.rejectionReason = rejectionReason;
    tender.reviewedBy = reviewedBy || 'Authority';
    tender.reviewedAt = new Date();
    await tender.save();

    res.json({ message: "Tender rejected", tender });
  } catch (error) {
    console.error("Reject tender error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Resubmit rejected tender (Government action)
export const resubmitTender = async (req, res) => {
  try {
    const { tenderId } = req.params;
    const { title, location, pincode, estValueInCr, closingDate, mandatoryConditions } = req.body;

    const tender = await Tender.findOne({ tenderId });
    if (!tender) {
      return res.status(404).json({ error: "Tender not found" });
    }

    if (tender.status !== 'rejected') {
      return res.status(400).json({ error: "Only rejected tenders can be resubmitted" });
    }

    // Update tender fields if provided
    if (title) tender.title = title;
    if (location) tender.location = location;
    if (pincode) tender.pincode = pincode;
    if (estValueInCr) tender.estValueInCr = parseFloat(estValueInCr);
    if (closingDate) tender.closingDate = closingDate;
    
    // Reset to pending approval
    tender.status = 'pending_approval';
    tender.rejectionReason = null;
    tender.reviewedBy = null;
    tender.reviewedAt = null;
    await tender.save();

    // Update specifications if provided
    if (mandatoryConditions) {
      await TenderSpecification.updateOne(
        { tenderId },
        { requirementText: mandatoryConditions, restrictiveness_score: null },
        { upsert: true }
      );
    }

    res.json({ message: "Tender resubmitted for approval", tender });
  } catch (error) {
    console.error("Resubmit tender error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get tender statistics by department
export const getTenderStats = async (req, res) => {
  try {
    const { deptName } = req.query;
    
    const matchStage = deptName ? { $match: { deptName } } : { $match: {} };
    
    const stats = await Tender.aggregate([
      matchStage,
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalValue: { $sum: "$estValueInCr" }
        }
      }
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

