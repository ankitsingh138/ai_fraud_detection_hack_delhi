import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import connectDB from '../config/db.js';
import Company from '../models/Company.model.js';
import Tender from '../models/Tender.model.js';
import TenderSpecification from '../models/TenderSpecification.model.js';
import Bid from '../models/Bid.model.js';
import Person from '../models/Person.model.js';
import FinancialTie from '../models/FinancialTie.model.js';
import { syncAllToGraph } from '../services/neo4j.service.js';

// Path: backend/src/scripts/ -> go up 3 levels to project root, then into data/
const DATA_PATH = path.resolve(__dirname, '../../../data');

// Simple CSV parser
const parseCSV = (filePath) => {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return [];
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n').filter(line => line.trim());
  
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    const row = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] || '';
    });
    data.push(row);
  }
  
  return data;
};

// Seed companies from CSV
const seedCompanies = async () => {
  const filePath = path.join(DATA_PATH, 'companies.csv');
  const data = parseCSV(filePath);
  
  console.log(`Found ${data.length} companies to seed`);
  
  for (const row of data) {
    await Company.findOneAndUpdate(
      { companyId: row.company_id },
      {
        companyId: row.company_id,
        name: row.company_name,
        address: row.reg_address,
        director: row.director
      },
      { upsert: true }
    );
  }
  
  console.log('✅ Companies seeded');
};

// Seed tenders from CSV
const seedTenders = async () => {
  const filePath = path.join(DATA_PATH, 'tenders.csv');
  const data = parseCSV(filePath);
  
  console.log(`Found ${data.length} tenders to seed`);
  
  for (const row of data) {
    await Tender.findOneAndUpdate(
      { tenderId: row.tender_id },
      {
        tenderId: row.tender_id,
        deptName: row.dept_name,
        year: parseInt(row.tender_id?.split('-')?.[1]) || 2024,
        tenderNum: parseInt(row.tender_id?.split('-')?.[2]) || 1,
        title: `${row.dept_name} Tender - ${row.location}`,
        location: row.location,
        pincode: row.pincode || '000000',
        estValueInCr: parseFloat(row.est_value_in_cr) || 0,
        publishDate: new Date(row.publish_date || Date.now()),
        status: 'active'
      },
      { upsert: true }
    );
  }
  
  console.log('✅ Tenders seeded');
};

// Seed tender specifications from CSV
const seedTenderSpecs = async () => {
  const filePath = path.join(DATA_PATH, 'tender_specifications.csv');
  const data = parseCSV(filePath);
  
  console.log(`Found ${data.length} tender specifications to seed`);
  
  for (const row of data) {
    const clauseId = `CL-${row.tender_id}-${Math.random().toString(36).substr(2, 6)}`;
    
    await TenderSpecification.findOneAndUpdate(
      { tenderId: row.tender_id, requirementText: row.requirement_text },
      {
        tenderId: row.tender_id,
        clauseId,
        sectionType: 'Technical Eligibility',
        requirementText: row.requirement_text,
        isMandatory: true,
        restrictiveness_score: row.restrictiveness_score ? parseFloat(row.restrictiveness_score) : null
      },
      { upsert: true }
    );
  }
  
  console.log('✅ Tender specifications seeded');
};

// Seed bids from CSV (if exists)
const seedBids = async () => {
  const filePath = path.join(DATA_PATH, 'bids.csv');
  
  if (!fs.existsSync(filePath)) {
    console.log('No bids.csv found, creating sample bids...');
    
    // Create sample bids for demo
    const tenders = await Tender.find().limit(5);
    const companies = await Company.find();
    
    if (tenders.length === 0 || companies.length === 0) {
      console.log('No tenders or companies to create bids');
      return;
    }
    
    // IP pools for collusion simulation
    const ipPools = [
      ['192.168.1.100', '192.168.1.101'],
      ['10.0.0.50', '10.0.0.51', '10.0.0.52'],
      ['172.16.5.10', '172.16.5.11']
    ];
    
    let bidCount = 0;
    for (const tender of tenders) {
      // Random 2-4 companies bid on each tender
      const numBids = Math.floor(Math.random() * 3) + 2;
      const shuffled = [...companies].sort(() => Math.random() - 0.5);
      
      for (let i = 0; i < Math.min(numBids, shuffled.length); i++) {
        const company = shuffled[i];
        const poolIndex = Math.abs(company.companyId.charCodeAt(0)) % ipPools.length;
        const ipAddress = ipPools[poolIndex][i % ipPools[poolIndex].length];
        
        await Bid.findOneAndUpdate(
          { tenderId: tender.tenderId, companyId: company.companyId },
          {
            bidId: `BID-${tender.tenderId}-${company.companyId}`,
            tenderId: tender.tenderId,
            companyId: company.companyId,
            bidAmount: (tender.estValueInCr * (0.8 + Math.random() * 0.3)) * 100, // Lakhs
            bidDate: new Date(),
            ipAddress,
            status: 'pending'
          },
          { upsert: true }
        );
        bidCount++;
      }
    }
    
    console.log(`✅ Created ${bidCount} sample bids`);
    return;
  }
  
  const data = parseCSV(filePath);
  console.log(`Found ${data.length} bids to seed`);
  
  for (const row of data) {
    await Bid.findOneAndUpdate(
      { bidId: row.bid_id || `BID-${row.tender_id}-${row.company_id}` },
      {
        bidId: row.bid_id || `BID-${row.tender_id}-${row.company_id}`,
        tenderId: row.tender_id,
        companyId: row.company_id,
        bidAmount: parseFloat(row.bid_amount) || 0,
        bidDate: new Date(row.bid_date || Date.now()),
        ipAddress: row.ip_address || null,
        status: row.status || 'pending'
      },
      { upsert: true }
    );
  }
  
  console.log('✅ Bids seeded');
};

// Seed persons (ownership data) from CSV
const seedPersons = async () => {
  const filePath = path.join(DATA_PATH, 'people_ownership.csv');
  const data = parseCSV(filePath);
  
  console.log(`Found ${data.length} ownership records to seed`);
  
  // Group by person
  const personMap = new Map();
  
  for (const row of data) {
    const personId = row.person_id;
    if (!personMap.has(personId)) {
      personMap.set(personId, {
        personId,
        personName: row.person_name,
        companies: []
      });
    }
    
    personMap.get(personId).companies.push({
      companyId: row.company_id,
      designation: row.designation,
      sharePercent: parseFloat(row.share_percent) || 0
    });
  }
  
  for (const [personId, personData] of personMap) {
    await Person.findOneAndUpdate(
      { personId },
      personData,
      { upsert: true }
    );
  }
  
  console.log('✅ Persons (ownership) seeded');
};

// Seed financial ties from CSV
const seedFinancialTies = async () => {
  const filePath = path.join(DATA_PATH, 'financial_ties.csv');
  const data = parseCSV(filePath);
  
  console.log(`Found ${data.length} financial tie records to seed`);
  
  for (const row of data) {
    await FinancialTie.findOneAndUpdate(
      { entityId: row.entity_id },
      {
        entityId: row.entity_id,
        entityType: 'company',
        bankAccHash: row.bank_acc_hash,
        taxIdHash: row.tax_id_hash,
        notaryId: row.notary_id,
        emdAccountHash: row.emd_account_hash
      },
      { upsert: true }
    );
  }
  
  console.log('✅ Financial ties seeded');
};

// Main seed function
const seedAll = async () => {
  try {
    console.log('🚀 Starting database seed...\n');
    console.log(`Data directory: ${DATA_PATH}\n`);
    
    // Connect to MongoDB
    await connectDB();
    console.log('✅ Connected to MongoDB\n');
    
    // Seed all collections
    await seedCompanies();
    await seedTenders();
    await seedTenderSpecs();
    await seedBids();
    await seedPersons();
    await seedFinancialTies();
    
    console.log('\n🔄 Syncing to Neo4j graph...');
    try {
      await syncAllToGraph();
      console.log('✅ Neo4j graph synced\n');
    } catch (neo4jErr) {
      console.error('⚠️ Neo4j sync failed (database might not be running):', neo4jErr.message);
    }
    
    console.log('\n🎉 Database seeding complete!');
    
    // Print summary
    const summary = {
      companies: await Company.countDocuments(),
      tenders: await Tender.countDocuments(),
      specifications: await TenderSpecification.countDocuments(),
      bids: await Bid.countDocuments(),
      persons: await Person.countDocuments(),
      financialTies: await FinancialTie.countDocuments()
    };
    console.log('\n📊 Summary:', summary);
    
  } catch (error) {
    console.error('❌ Seed error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

// Run if called directly
seedAll();

