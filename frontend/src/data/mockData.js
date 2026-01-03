export const DEPARTMENTS = [
  { value: 'UADD', label: 'Urban Administration and Development Department (UADD)' },
  { value: 'MPMKVV', label: 'MP Madhya Kshetra Vidyut Vitran (MPMKVV)' },
  { value: 'PHED', label: 'Public Health Engineering Department (PHED)' },
  { value: 'WRD', label: 'Water Resources Department (WRD)' },
  { value: 'PWD', label: 'Public Works Department (PWD)' },
  { value: 'MPRDC', label: 'MP Road Development Corporation (MPRDC)' },
];

export const MOCK_TENDERS = [
  {
    id: 'TND-2025-001',
    title: 'Construction of Bridge over Narmada River',
    department: 'PWD',
    departmentId: 'PWD-12345',
    location: 'Bhopal',
    pincode: '462001',
    estimatedAmount: 45.5,
    publishDate: '2025-01-15',
    closingDate: '2025-02-15',
    status: 'active',
    mandatoryConditions: 'Contractor must have 5+ years experience in bridge construction. Valid GST and PAN required.',
    bids: [
      { bidderId: 'BID-001', companyName: 'Sharma Constructions', amount: 44.2, date: '2025-01-20' },
      { bidderId: 'BID-003', companyName: 'Patel Infra Ltd', amount: 46.1, date: '2025-01-22' },
    ]
  },
  {
    id: 'TND-2025-002',
    title: 'Water Supply Pipeline Installation - Phase II',
    department: 'PHED',
    departmentId: 'PHED-54321',
    location: 'Indore',
    pincode: '452001',
    estimatedAmount: 12.8,
    publishDate: '2025-01-10',
    closingDate: '2025-02-10',
    status: 'active',
    mandatoryConditions: 'Experience in water pipeline projects mandatory. ISO certification required.',
    bids: [
      { bidderId: 'BID-002', companyName: 'Gupta Enterprises', amount: 12.5, date: '2025-01-18' },
    ]
  },
  {
    id: 'TND-2025-003',
    title: 'Road Widening Project NH-12',
    department: 'MPRDC',
    departmentId: 'MPRDC-11111',
    location: 'Jabalpur',
    pincode: '482001',
    estimatedAmount: 78.3,
    publishDate: '2025-01-05',
    closingDate: '2025-02-05',
    status: 'active',
    mandatoryConditions: 'Minimum turnover of 50 Cr required. Road construction experience mandatory.',
    bids: []
  },
  {
    id: 'TND-2024-045',
    title: 'Urban Street Lighting Project',
    department: 'UADD',
    departmentId: 'UADD-99999',
    location: 'Gwalior',
    pincode: '474001',
    estimatedAmount: 8.5,
    publishDate: '2024-11-01',
    closingDate: '2024-12-01',
    status: 'completed',
    mandatoryConditions: 'Electrical contractor license required.',
    bids: [
      { bidderId: 'BID-001', companyName: 'Sharma Constructions', amount: 8.2, date: '2024-11-15', winner: true },
      { bidderId: 'BID-002', companyName: 'Gupta Enterprises', amount: 8.7, date: '2024-11-18' },
    ]
  },
  {
    id: 'TND-2024-032',
    title: 'Electrical Substation Upgrade',
    department: 'MPMKVV',
    departmentId: 'MPMKVV-22222',
    location: 'Ujjain',
    pincode: '456001',
    estimatedAmount: 25.0,
    publishDate: '2024-10-15',
    closingDate: '2024-11-15',
    status: 'completed',
    mandatoryConditions: 'High voltage work experience required. Safety certifications mandatory.',
    bids: [
      { bidderId: 'BID-003', companyName: 'Patel Infra Ltd', amount: 24.5, date: '2024-10-25', winner: true },
    ]
  },
];

export const MOCK_COMPANIES = [
  { id: 'BID-001', name: 'Sharma Constructions Pvt. Ltd.' },
  { id: 'BID-002', name: 'Gupta Enterprises' },
  { id: 'BID-003', name: 'Patel Infra Ltd' },
];

// ============================================
// FRAUD DETECTION DATA (for Authority Portal)
// ============================================

// Address Collusion - Multiple companies at same address
export const ADDRESS_COLLUSION_DATA = {
  nodes: [
    { id: 'addr1', type: 'address', label: '42 MG Road, Bhopal' },
    { id: 'addr2', type: 'address', label: '15 Industrial Area, Indore' },
    { id: 'addr3', type: 'address', label: '88 Station Road, Jabalpur' },
    { id: 'c1', type: 'company', label: 'Sharma Constructions' },
    { id: 'c2', type: 'company', label: 'Sharma Infra Pvt Ltd' },
    { id: 'c3', type: 'company', label: 'S.K. Builders' },
    { id: 'c4', type: 'company', label: 'Gupta Enterprises' },
    { id: 'c5', type: 'company', label: 'Gupta & Sons Trading' },
    { id: 'c6', type: 'company', label: 'Patel Infrastructure' },
    { id: 'c7', type: 'company', label: 'Patel Road Works' },
    { id: 'c8', type: 'company', label: 'MP Civil Contractors' },
  ],
  edges: [
    { from: 'c1', to: 'addr1' },
    { from: 'c2', to: 'addr1' },
    { from: 'c3', to: 'addr1' },
    { from: 'c4', to: 'addr2' },
    { from: 'c5', to: 'addr2' },
    { from: 'c6', to: 'addr3' },
    { from: 'c7', to: 'addr3' },
    { from: 'c8', to: 'addr3' },
  ],
  tableData: [
    { address: '42 MG Road, Bhopal - 462001', companies: ['Sharma Constructions', 'Sharma Infra Pvt Ltd', 'S.K. Builders'] },
    { address: '15 Industrial Area, Indore - 452001', companies: ['Gupta Enterprises', 'Gupta & Sons Trading'] },
    { address: '88 Station Road, Jabalpur - 482001', companies: ['Patel Infrastructure', 'Patel Road Works', 'MP Civil Contractors'] },
  ]
};

// IP Collusion - Multiple bids from same IP
export const IP_COLLUSION_DATA = {
  nodes: [
    { id: 'ip1', type: 'ip', label: '192.168.1.105' },
    { id: 'ip2', type: 'ip', label: '10.0.0.42' },
    { id: 'ip3', type: 'ip', label: '172.16.0.88' },
    { id: 'bid1', type: 'bid', label: 'BID-2025-001' },
    { id: 'bid2', type: 'bid', label: 'BID-2025-002' },
    { id: 'bid3', type: 'bid', label: 'BID-2025-003' },
    { id: 'bid4', type: 'bid', label: 'BID-2025-004' },
    { id: 'bid5', type: 'bid', label: 'BID-2025-005' },
    { id: 'bid6', type: 'bid', label: 'BID-2025-006' },
    { id: 'bid7', type: 'bid', label: 'BID-2025-007' },
  ],
  edges: [
    { from: 'bid1', to: 'ip1' },
    { from: 'bid2', to: 'ip1' },
    { from: 'bid3', to: 'ip1' },
    { from: 'bid4', to: 'ip2' },
    { from: 'bid5', to: 'ip2' },
    { from: 'bid6', to: 'ip3' },
    { from: 'bid7', to: 'ip3' },
  ],
  tableData: [
    { ip: '192.168.1.105', bids: ['BID-2025-001 (Sharma Const.)', 'BID-2025-002 (Sharma Infra)', 'BID-2025-003 (S.K. Builders)'], tender: 'TND-2025-001' },
    { ip: '10.0.0.42', bids: ['BID-2025-004 (Gupta Ent.)', 'BID-2025-005 (Gupta & Sons)'], tender: 'TND-2025-002' },
    { ip: '172.16.0.88', bids: ['BID-2025-006 (Patel Infra)', 'BID-2025-007 (Patel Road)'], tender: 'TND-2025-003' },
  ]
};

// Shared Ownership - Same person owns multiple companies
export const SHARED_OWNERSHIP_DATA = {
  nodes: [
    { id: 'p1', type: 'person', label: 'Rajesh Sharma' },
    { id: 'p2', type: 'person', label: 'Amit Gupta' },
    { id: 'p3', type: 'person', label: 'Sunil Patel' },
    { id: 'co1', type: 'company', label: 'Sharma Constructions' },
    { id: 'co2', type: 'company', label: 'Sharma Infra Pvt Ltd' },
    { id: 'co3', type: 'company', label: 'S.K. Builders' },
    { id: 'co4', type: 'company', label: 'Royal Projects' },
    { id: 'co5', type: 'company', label: 'Gupta Enterprises' },
    { id: 'co6', type: 'company', label: 'Gupta & Sons Trading' },
    { id: 'co7', type: 'company', label: 'AG Infrastructure' },
    { id: 'co8', type: 'company', label: 'Patel Infrastructure' },
    { id: 'co9', type: 'company', label: 'Patel Road Works' },
  ],
  edges: [
    { from: 'p1', to: 'co1' },
    { from: 'p1', to: 'co2' },
    { from: 'p1', to: 'co3' },
    { from: 'p1', to: 'co4' },
    { from: 'p2', to: 'co5' },
    { from: 'p2', to: 'co6' },
    { from: 'p2', to: 'co7' },
    { from: 'p3', to: 'co8' },
    { from: 'p3', to: 'co9' },
  ],
  tableData: [
    { person: 'Rajesh Sharma', pan: 'ABCPS1234A', companies: ['Sharma Constructions', 'Sharma Infra Pvt Ltd', 'S.K. Builders', 'Royal Projects'] },
    { person: 'Amit Gupta', pan: 'DEFPG5678B', companies: ['Gupta Enterprises', 'Gupta & Sons Trading', 'AG Infrastructure'] },
    { person: 'Sunil Patel', pan: 'GHIPP9012C', companies: ['Patel Infrastructure', 'Patel Road Works'] },
  ]
};

// Tailored Clause - NLP Risk Analysis Results
export const TAILORED_CLAUSE_DATA = [
  {
    tenderId: 'TND-2025-007',
    title: 'Construction of Government Building Phase-II',
    department: 'PWD',
    riskScore: 0.92,
    riskLevel: 'high',
    flaggedClauses: [
      'Bidder must have completed exactly 3 projects with Department XYZ in last 2 years',
      'Equipment must be procured from M/s ABC Suppliers only',
      'Work experience specifically in Bhopal Municipal area mandatory',
    ],
    specifications: {
      estimatedCost: '₹45.5 Cr',
      deadline: '15 Feb 2025',
      location: 'Bhopal, MP',
      eligibility: 'Class A contractors only',
    }
  },
  {
    tenderId: 'TND-2025-012',
    title: 'Road Resurfacing NH-12 Stretch',
    department: 'MPRDC',
    riskScore: 0.87,
    riskLevel: 'high',
    flaggedClauses: [
      'Contractor must own specific model of road roller manufactured after 2023',
      'Joint venture only with companies registered in MP for last 10 years',
      'Technical staff must have worked on NH-12 previously',
    ],
    specifications: {
      estimatedCost: '₹78.3 Cr',
      deadline: '20 Feb 2025',
      location: 'Jabalpur-Bhopal Highway',
      eligibility: 'Special Class contractors',
    }
  },
  {
    tenderId: 'TND-2025-018',
    title: 'Water Treatment Plant Upgrade',
    department: 'PHED',
    riskScore: 0.84,
    riskLevel: 'high',
    flaggedClauses: [
      'Experience with exact same water treatment technology from vendor XYZ required',
      'Annual turnover must be exactly between 50-55 Cr',
    ],
    specifications: {
      estimatedCost: '₹32.1 Cr',
      deadline: '28 Feb 2025',
      location: 'Indore, MP',
      eligibility: 'Specialized water contractors',
    }
  },
];

// Financial Ties - Companies with financial connections
export const FINANCIAL_TIES_DATA = {
  nodes: [
    { id: 'bank1', type: 'bank', label: 'SBI Bhopal Main' },
    { id: 'bank2', type: 'bank', label: 'HDFC Indore' },
    { id: 'fc1', type: 'company', label: 'Sharma Constructions' },
    { id: 'fc2', type: 'company', label: 'Sharma Infra Pvt Ltd' },
    { id: 'fc3', type: 'company', label: 'S.K. Builders' },
    { id: 'fc4', type: 'company', label: 'Gupta Enterprises' },
    { id: 'fc5', type: 'company', label: 'Gupta & Sons' },
    { id: 'guarantor1', type: 'guarantor', label: 'Rajesh Sharma' },
    { id: 'guarantor2', type: 'guarantor', label: 'Amit Gupta' },
  ],
  edges: [
    { from: 'fc1', to: 'bank1', label: 'Account' },
    { from: 'fc2', to: 'bank1', label: 'Account' },
    { from: 'fc3', to: 'bank1', label: 'Account' },
    { from: 'fc1', to: 'guarantor1', label: 'Guarantor' },
    { from: 'fc2', to: 'guarantor1', label: 'Guarantor' },
    { from: 'fc3', to: 'guarantor1', label: 'Guarantor' },
    { from: 'fc4', to: 'bank2', label: 'Account' },
    { from: 'fc5', to: 'bank2', label: 'Account' },
    { from: 'fc4', to: 'guarantor2', label: 'Guarantor' },
    { from: 'fc5', to: 'guarantor2', label: 'Guarantor' },
  ],
  bankTableData: [
    { bank: 'SBI Bhopal Main Branch', accountNo: 'XXXX1234', companies: ['Sharma Constructions', 'Sharma Infra Pvt Ltd', 'S.K. Builders'] },
    { bank: 'HDFC Indore Main Branch', accountNo: 'XXXX5678', companies: ['Gupta Enterprises', 'Gupta & Sons Trading'] },
  ],
  guarantorTableData: [
    { guarantor: 'Rajesh Sharma', pan: 'ABCPS1234A', companiesGuaranteed: ['Sharma Constructions', 'Sharma Infra Pvt Ltd', 'S.K. Builders'] },
    { guarantor: 'Amit Gupta', pan: 'DEFPG5678B', companiesGuaranteed: ['Gupta Enterprises', 'Gupta & Sons Trading'] },
  ]
};

export const TERMS_AND_CONDITIONS = `
TERMS AND CONDITIONS FOR BIDDING

1. ELIGIBILITY CRITERIA
   - The bidder must be a registered company/firm with valid GST registration.
   - Minimum 3 years of experience in similar projects.
   - Must have completed at least 2 projects of similar nature and value.

2. FINANCIAL REQUIREMENTS
   - EMD (Earnest Money Deposit) of 2% of estimated cost must be submitted.
   - Performance guarantee of 5% will be required upon contract award.
   - Valid solvency certificate from a scheduled bank.

3. TECHNICAL REQUIREMENTS
   - Adequate machinery and equipment for project execution.
   - Qualified technical staff including engineers and supervisors.
   - Valid labor licenses and insurance coverage.

4. SUBMISSION GUIDELINES
   - All documents must be uploaded in PDF format.
   - Bid price must be quoted in Indian Rupees (Crores).
   - Any conditional bid will be rejected.

5. EVALUATION CRITERIA
   - Technical evaluation: 60% weightage
   - Financial evaluation: 40% weightage
   - L1 bidder will be considered for contract award subject to technical qualification.

6. GENERAL CONDITIONS
   - The department reserves the right to reject any or all bids.
   - Any attempt to influence the tender process will result in disqualification.
   - All disputes will be subject to jurisdiction of courts in the respective city.

By accepting these terms, you confirm that all information provided is accurate and you agree to abide by these conditions.
`;

