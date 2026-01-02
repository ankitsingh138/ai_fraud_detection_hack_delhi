import driver from "../config/Neo4j.js";
import Company from "../models/Company.model.js";
import Bid from "../models/Bid.model.js";

export const syncCompaniesToGraph = async () => {
  const session = driver.session();
  const companies = await Company.find();

  try {
    for (const c of companies) {

      // 🔴 SAFETY CHECK
      if (!c.companyId || !c.name || !c.address || !c.director) {
        console.log("❌ Skipping invalid company:", c);
        continue;
      }

      await session.run(
        `
        MERGE (c:Company {companyId: $companyId})
        SET c.name = $name,
            c.address = $address,
            c.director = $director
        `,
        {
          companyId: c.companyId,
          name: c.name,
          address: c.address,
          director: c.director
        }
      );
    }
  } finally {
    await session.close();
  }
};


export const createCollusionEdges = async () => {
  const session = driver.session();

  try {
    // Same Director
    await session.run(`
      MATCH (a:Company), (b:Company)
      WHERE a.director = b.director AND a.companyId <> b.companyId
      MERGE (a)-[:SAME_DIRECTOR]->(b)
    `);

    // Same Address
    await session.run(`
      MATCH (a:Company), (b:Company)
      WHERE a.address = b.address AND a.companyId <> b.companyId
      MERGE (a)-[:SAME_ADDRESS]->(b)
    `);
  } finally {
    await session.close();
  }
};



export const syncBidsToGraph = async () => {
  const session = driver.session();
  const bids = await Bid.find();

  try {
    for (const b of bids) {
      if (!b.companyId || !b.tenderId || !b.bidAmount) continue;

      await session.run(
        `
        MERGE (c:Company {companyId: $companyId})
        MERGE (t:Tender {tenderId: $tenderId})
        MERGE (c)-[r:BID_ON]->(t)
        SET r.amount = $amount,
            r.bidDate = $bidDate
        `,
        {
          companyId: String(b.companyId),
          tenderId: String(b.tenderId),
          amount: Number(b.bidAmount),
          bidDate: b.bidDate
            ? new Date(b.bidDate).toISOString()
            : null
        }
      );
    }
  } finally {
    await session.close();
  }
};



