import driver from "../config/Neo4j.js";
import Company from "../models/Company.model.js";
import Bid from "../models/Bid.model.js";
import Tender from "../models/Tender.model.js";
import Person from "../models/Person.model.js";
import FinancialTie from "../models/FinancialTie.model.js";

// ============================================
// SYNC FUNCTIONS - MongoDB to Neo4j
// ============================================

export const syncCompaniesToGraph = async () => {
  const session = driver.session();
  const companies = await Company.find();

  try {
    for (const c of companies) {
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

export const syncTendersToGraph = async () => {
  const session = driver.session();
  const tenders = await Tender.find();

  try {
    for (const t of tenders) {
      if (!t.tenderId) continue;

      await session.run(
        `
        MERGE (t:Tender {tenderId: $tenderId})
        SET t.title = $title,
            t.deptName = $deptName,
            t.location = $location,
            t.estValue = $estValue,
            t.status = $status
        `,
        {
          tenderId: t.tenderId,
          title: t.title || '',
          deptName: t.deptName,
          location: t.location,
          estValue: t.estValueInCr,
          status: t.status
        }
      );
    }
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

      // Create bid relationship with IP address
      await session.run(
        `
        MERGE (c:Company {companyId: $companyId})
        MERGE (t:Tender {tenderId: $tenderId})
        MERGE (c)-[r:BID_ON]->(t)
        SET r.amount = $amount,
            r.bidDate = $bidDate,
            r.bidId = $bidId,
            r.ipAddress = $ipAddress
        `,
        {
          companyId: String(b.companyId),
          tenderId: String(b.tenderId),
          amount: Number(b.bidAmount),
          bidDate: b.bidDate ? new Date(b.bidDate).toISOString() : null,
          bidId: b.bidId || '',
          ipAddress: b.ipAddress || ''
        }
      );

      // Create IP node and relationship for IP collusion detection
      if (b.ipAddress) {
        await session.run(
          `
          MERGE (ip:IPAddress {address: $ipAddress})
          MERGE (c:Company {companyId: $companyId})
          MERGE (c)-[:SUBMITTED_FROM]->(ip)
          `,
          {
            ipAddress: b.ipAddress,
            companyId: String(b.companyId)
          }
        );
      }
    }
  } finally {
    await session.close();
  }
};

export const syncPersonsToGraph = async () => {
  const session = driver.session();
  const persons = await Person.find();

  try {
    for (const p of persons) {
      if (!p.personId || !p.personName) continue;

      // Create person node
      await session.run(
        `
        MERGE (p:Person {personId: $personId})
        SET p.name = $name
        `,
        {
          personId: p.personId,
          name: p.personName
        }
      );

      // Create ownership relationships
      for (const ownership of p.companies || []) {
        await session.run(
          `
          MERGE (p:Person {personId: $personId})
          MERGE (c:Company {companyId: $companyId})
          MERGE (p)-[r:OWNS]->(c)
          SET r.designation = $designation,
              r.sharePercent = $sharePercent
          `,
          {
            personId: p.personId,
            companyId: ownership.companyId,
            designation: ownership.designation || '',
            sharePercent: ownership.sharePercent || 0
          }
        );
      }
    }
  } finally {
    await session.close();
  }
};

export const syncFinancialTiesToGraph = async () => {
  const session = driver.session();
  const ties = await FinancialTie.find();

  try {
    for (const t of ties) {
      if (!t.entityId) continue;

      // Create bank account nodes and relationships
      if (t.bankAccHash) {
        await session.run(
          `
          MERGE (c:Company {companyId: $entityId})
          MERGE (b:BankAccount {hash: $bankHash})
          MERGE (c)-[:HAS_BANK_ACCOUNT]->(b)
          `,
          { entityId: t.entityId, bankHash: t.bankAccHash }
        );
      }

      // Create notary relationships
      if (t.notaryId) {
        await session.run(
          `
          MERGE (c:Company {companyId: $entityId})
          MERGE (n:Notary {notaryId: $notaryId})
          MERGE (c)-[:USES_NOTARY]->(n)
          `,
          { entityId: t.entityId, notaryId: t.notaryId }
        );
      }

      // Create EMD account relationships
      if (t.emdAccountHash && t.emdAccountHash !== 'N/A') {
        await session.run(
          `
          MERGE (c:Company {companyId: $entityId})
          MERGE (e:EMDAccount {hash: $emdHash})
          MERGE (c)-[:HAS_EMD_ACCOUNT]->(e)
          `,
          { entityId: t.entityId, emdHash: t.emdAccountHash }
        );
      }
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

// ============================================
// FRAUD DETECTION QUERIES
// ============================================

// Address Collusion - Companies sharing same registered address
export const getAddressCollusionGraph = async () => {
  const session = driver.session();

  try {
    // Get addresses with multiple companies
    const result = await session.run(`
      MATCH (c:Company)
      WITH c.address AS address, collect(c) AS companies
      WHERE size(companies) > 1
      RETURN address, 
             [comp IN companies | {id: comp.companyId, name: comp.name}] AS companyList,
             size(companies) AS count
      ORDER BY count DESC
    `);

    const tableData = result.records.map(record => ({
      address: record.get('address') || 'Unknown Address',
      companies: record.get('companyList') || [],
      count: record.get('count')?.toNumber?.() || 0
    })).filter(row => row.address && row.address !== 'Unknown Address');

    // Build graph nodes and edges
    const nodes = [];
    const edges = [];
    const addressNodes = new Set();

    tableData.forEach(row => {
      if (!row.address) return;
      const addrId = `addr_${String(row.address).replace(/[^a-zA-Z0-9]/g, '_').slice(0, 20)}`;
      
      if (!addressNodes.has(addrId)) {
        nodes.push({ id: addrId, type: 'address', label: row.address });
        addressNodes.add(addrId);
      }

      (row.companies || []).forEach(company => {
        if (!company || !company.id) return;
        nodes.push({ id: company.id, type: 'company', label: company.name || 'Unknown' });
        edges.push({ source: company.id, target: addrId });
      });
    });

    return { nodes, edges, tableData };
  } finally {
    await session.close();
  }
};

// IP Collusion - Bids submitted from same IP address
export const getIPCollusionGraph = async () => {
  const session = driver.session();

  try {
    const result = await session.run(`
      MATCH (c:Company)-[r:BID_ON]->(t:Tender)
      WHERE r.ipAddress IS NOT NULL AND r.ipAddress <> ''
      WITH r.ipAddress AS ip, collect({
        company: c.name,
        companyId: c.companyId,
        tender: t.tenderId,
        bidId: r.bidId
      }) AS bids
      WHERE size(bids) > 1
      RETURN ip, bids, size(bids) AS bidCount
      ORDER BY bidCount DESC
    `);

    const tableData = result.records.map(record => ({
      ipAddress: record.get('ip') || 'Unknown',
      bids: record.get('bids') || [],
      bidCount: record.get('bidCount')?.toNumber?.() || 0
    })).filter(row => row.ipAddress && row.ipAddress !== 'Unknown');

    // Build graph
    const nodes = [];
    const edges = [];
    const seenNodes = new Set();

    tableData.forEach(row => {
      if (!row.ipAddress) return;
      const ipId = `ip_${String(row.ipAddress).replace(/\./g, '_')}`;
      
      if (!seenNodes.has(ipId)) {
        nodes.push({ id: ipId, type: 'ip', label: row.ipAddress });
        seenNodes.add(ipId);
      }

      (row.bids || []).forEach(bid => {
        if (!bid) return;
        const bidNodeId = `bid_${bid.bidId || bid.tender || 'unknown'}`;
        if (!seenNodes.has(bidNodeId)) {
          nodes.push({ 
            id: bidNodeId, 
            type: 'bid', 
            label: `${bid.company || 'Unknown'} → ${bid.tender || 'Unknown'}` 
          });
          seenNodes.add(bidNodeId);
        }
        edges.push({ source: bidNodeId, target: ipId });
      });
    });

    return { nodes, edges, tableData };
  } finally {
    await session.close();
  }
};

// Shared Ownership - Persons owning multiple companies
export const getSharedOwnershipGraph = async () => {
  const session = driver.session();

  try {
    const result = await session.run(`
      MATCH (p:Person)-[r:OWNS]->(c:Company)
      WITH p, collect({
        companyId: c.companyId,
        companyName: c.name,
        designation: r.designation,
        sharePercent: r.sharePercent
      }) AS companies
      WHERE size(companies) > 1
      RETURN p.personId AS personId, 
             p.name AS personName, 
             companies,
             size(companies) AS companyCount
      ORDER BY companyCount DESC
    `);

    const tableData = result.records.map(record => ({
      personId: record.get('personId') || 'unknown',
      personName: record.get('personName') || 'Unknown',
      companies: record.get('companies') || [],
      companyCount: record.get('companyCount')?.toNumber?.() || 0
    })).filter(row => row.personId && row.personId !== 'unknown');

    // Build graph
    const nodes = [];
    const edges = [];
    const seenNodes = new Set();

    tableData.forEach(row => {
      if (!row.personId) return;
      const personNodeId = `person_${row.personId}`;
      
      if (!seenNodes.has(personNodeId)) {
        nodes.push({ id: personNodeId, type: 'person', label: row.personName || 'Unknown' });
        seenNodes.add(personNodeId);
      }

      (row.companies || []).forEach(company => {
        if (!company || !company.companyId) return;
        if (!seenNodes.has(company.companyId)) {
          nodes.push({ 
            id: company.companyId, 
            type: 'company', 
            label: company.companyName || 'Unknown'
          });
          seenNodes.add(company.companyId);
    }
        edges.push({ source: personNodeId, target: company.companyId });
      });
    });

    return { nodes, edges, tableData };
  } finally {
    await session.close();
  }
};

// Financial Ties - Shared bank accounts, notaries, guarantors
export const getFinancialTiesGraph = async () => {
  const session = driver.session();

  try {
    // Get shared bank accounts
    const bankResult = await session.run(`
      MATCH (c:Company)-[:HAS_BANK_ACCOUNT]->(b:BankAccount)
      WITH b, collect(c) AS companies
      WHERE size(companies) > 1
      RETURN 'bank' AS tieType, 
             b.hash AS tieId,
             [comp IN companies | {id: comp.companyId, name: comp.name}] AS companies,
             size(companies) AS count
    `);

    // Get shared notaries
    const notaryResult = await session.run(`
      MATCH (c:Company)-[:USES_NOTARY]->(n:Notary)
      WITH n, collect(c) AS companies
      WHERE size(companies) > 1
      RETURN 'notary' AS tieType,
             n.notaryId AS tieId,
             [comp IN companies | {id: comp.companyId, name: comp.name}] AS companies,
             size(companies) AS count
    `);

    // Get shared EMD accounts
    const emdResult = await session.run(`
      MATCH (c:Company)-[:HAS_EMD_ACCOUNT]->(e:EMDAccount)
      WITH e, collect(c) AS companies
      WHERE size(companies) > 1
      RETURN 'emd' AS tieType,
             e.hash AS tieId,
             [comp IN companies | {id: comp.companyId, name: comp.name}] AS companies,
             size(companies) AS count
    `);

    const processResults = (records, type) => {
      return records.map(record => ({
        tieType: type,
        tieId: record.get('tieId') || 'unknown',
        companies: record.get('companies') || [],
        count: record.get('count')?.toNumber?.() || 0
      })).filter(row => row.tieId && row.tieId !== 'unknown');
    };

    const bankData = processResults(bankResult.records, 'bank');
    const notaryData = processResults(notaryResult.records, 'notary');
    const emdData = processResults(emdResult.records, 'emd');

    const tableData = {
      sharedBankAccounts: bankData,
      sharedNotaries: notaryData,
      sharedEMDAccounts: emdData
    };

    // Build combined graph
    const nodes = [];
    const edges = [];
    const seenNodes = new Set();

    const addToGraph = (data, nodeType) => {
      (data || []).forEach(row => {
        if (!row || !row.tieId) return;
        const tieIdStr = String(row.tieId);
        const tieNodeId = `${nodeType}_${tieIdStr.slice(0, 12)}`;
        
        if (!seenNodes.has(tieNodeId)) {
          nodes.push({ 
            id: tieNodeId, 
            type: nodeType, 
            label: `${nodeType.toUpperCase()}: ${tieIdStr.slice(0, 8)}...` 
          });
          seenNodes.add(tieNodeId);
        }

        (row.companies || []).forEach(company => {
          if (!company || !company.id) return;
          if (!seenNodes.has(company.id)) {
            nodes.push({ id: company.id, type: 'company', label: company.name || 'Unknown' });
            seenNodes.add(company.id);
          }
          edges.push({ source: company.id, target: tieNodeId });
        });
      });
    };

    addToGraph(bankData, 'bank');
    addToGraph(notaryData, 'notary');
    addToGraph(emdData, 'emd');

    return { nodes, edges, tableData };
  } finally {
    await session.close();
  }
};

// Full graph sync
export const syncAllToGraph = async () => {
  console.log("Starting full graph sync...");
  await syncCompaniesToGraph();
  console.log("✅ Companies synced");
  await syncTendersToGraph();
  console.log("✅ Tenders synced");
  await syncBidsToGraph();
  console.log("✅ Bids synced");
  await syncPersonsToGraph();
  console.log("✅ Persons synced");
  await syncFinancialTiesToGraph();
  console.log("✅ Financial ties synced");
  await createCollusionEdges();
  console.log("✅ Collusion edges created");
  console.log("Full graph sync complete!");
};

