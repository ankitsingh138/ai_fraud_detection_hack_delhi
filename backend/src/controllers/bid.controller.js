import Bid from "../models/Bid.model.js";
import Tender from "../models/Tender.model.js";
import Company from "../models/Company.model.js";
import { syncBidsToGraph } from "../services/neo4j.service.js";

// Simulated IP pool for demo collusion detection
const IP_POOLS = [
  ['192.168.1.100', '192.168.1.101', '192.168.1.102'], // Pool 1 - will create IP collusion
  ['192.168.2.50', '192.168.2.51'],                    // Pool 2
  ['10.0.0.25', '10.0.0.26', '10.0.0.27', '10.0.0.28'], // Pool 3
  ['172.16.5.10', '172.16.5.11'],                       // Pool 4
];

// Generate simulated IP - some will be shared to create collusion patterns
const generateSimulatedIP = (companyId) => {
  // Use company ID hash to consistently assign to same pool (for demo collusion)
  const hash = companyId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const poolIndex = hash % IP_POOLS.length;
  const pool = IP_POOLS[poolIndex];
  const ipIndex = hash % pool.length;
  return pool[ipIndex];
};

// Generate unique bid ID
const generateBidId = () => {
  return `BID-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Create a new bid
export const createBid = async (req, res) => {
  try {
    const { tenderId, companyId, bidAmount } = req.body;

    // Validate tender exists and is active
    const tender = await Tender.findOne({ tenderId, status: 'active' });
    if (!tender) {
      return res.status(400).json({ error: "Tender not found or not active" });
    }

    // Check if company already bid on this tender
    const existingBid = await Bid.findOne({ tenderId, companyId });
    if (existingBid) {
      return res.status(400).json({ error: "Company has already bid on this tender" });
    }

    // Generate simulated IP for demo
    const ipAddress = generateSimulatedIP(companyId);

    const bid = new Bid({
      bidId: generateBidId(),
      tenderId,
      companyId,
      bidAmount: parseFloat(bidAmount),
      bidDate: new Date(),
      ipAddress,
      status: 'pending'
    });

    await bid.save();

    // Sync to Neo4j
    try {
      await syncBidsToGraph();
    } catch (neo4jErr) {
      console.error("Neo4j sync error:", neo4jErr.message);
    }

    res.status(201).json({ 
      message: "Bid submitted successfully", 
      bid,
      ipAddress // Return for demo visibility
    });
  } catch (error) {
    console.error("Create bid error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get bids for a tender
export const getBidsByTender = async (req, res) => {
  try {
    const { tenderId } = req.params;
    
    const bids = await Bid.find({ tenderId }).sort({ bidAmount: 1 });
    res.json(bids);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get bids by company
export const getBidsByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    
    const bids = await Bid.find({ companyId }).sort({ bidDate: -1 });
    
    // Populate tender info
    const bidsWithTenders = await Promise.all(bids.map(async (bid) => {
      const tender = await Tender.findOne({ tenderId: bid.tenderId });
      return {
        ...bid.toObject(),
        tender: tender ? {
          title: tender.title,
          location: tender.location,
          estValueInCr: tender.estValueInCr,
          status: tender.status
        } : null
      };
    }));

    res.json(bidsWithTenders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all bids (for admin/authority)
export const getAllBids = async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    
    const bids = await Bid.find()
      .sort({ bidDate: -1 })
      .limit(parseInt(limit));

    res.json(bids);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update bid status (for winner selection)
export const updateBidStatus = async (req, res) => {
  try {
    const { bidId } = req.params;
    const { status } = req.body;

    const bid = await Bid.findOneAndUpdate(
      { bidId },
      { status },
      { new: true }
    );

    if (!bid) {
      return res.status(404).json({ error: "Bid not found" });
    }

    res.json({ message: "Bid status updated", bid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

