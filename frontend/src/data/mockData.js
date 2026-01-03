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

