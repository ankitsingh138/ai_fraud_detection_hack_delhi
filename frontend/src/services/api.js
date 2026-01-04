// API Base URL - adjust for production
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3010';

// Generic fetch wrapper with error handling
const fetchAPI = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP error ${response.status}`);
  }
  
  return response.json();
};

// ============================================
// TENDER APIs
// ============================================

export const tenderAPI = {
  // Create a new tender
  create: async (tenderData) => {
    return fetchAPI('/api/tenders', {
      method: 'POST',
      body: JSON.stringify(tenderData),
    });
  },

  // Get all tenders with optional filters
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return fetchAPI(`/api/tenders${params ? `?${params}` : ''}`);
  },

  // Get active tenders
  getActive: async () => {
    return fetchAPI('/api/tenders?status=active');
  },

  // Get tender by ID
  getById: async (tenderId) => {
    return fetchAPI(`/api/tenders/${tenderId}`);
  },

  // Get tender statistics
  getStats: async (deptName = null) => {
    const params = deptName ? `?deptName=${deptName}` : '';
    return fetchAPI(`/api/tenders/stats${params}`);
  },
};

// ============================================
// BID APIs
// ============================================

export const bidAPI = {
  // Create a new bid
  create: async (bidData) => {
    return fetchAPI('/api/bids', {
      method: 'POST',
      body: JSON.stringify(bidData),
    });
  },

  // Get all bids
  getAll: async () => {
    return fetchAPI('/api/bids');
  },

  // Get bids for a specific tender
  getByTender: async (tenderId) => {
    return fetchAPI(`/api/bids/tender/${tenderId}`);
  },

  // Get bids by company
  getByCompany: async (companyId) => {
    return fetchAPI(`/api/bids/company/${companyId}`);
  },
};

// ============================================
// FRAUD DETECTION APIs
// ============================================

export const fraudAPI = {
  // Get fraud summary
  getSummary: async () => {
    return fetchAPI('/api/fraud/summary');
  },

  // Get address collusion data
  getAddressCollusion: async () => {
    return fetchAPI('/api/fraud/address-collusion');
  },

  // Get IP collusion data
  getIPCollusion: async () => {
    return fetchAPI('/api/fraud/ip-collusion');
  },

  // Get shared ownership data
  getSharedOwnership: async () => {
    return fetchAPI('/api/fraud/shared-ownership');
  },

  // Get financial ties data
  getFinancialTies: async () => {
    return fetchAPI('/api/fraud/financial-ties');
  },

  // Trigger NLP analysis
  analyzeTenders: async () => {
    return fetchAPI('/api/fraud/analyze-tenders', {
      method: 'POST',
    });
  },

  // Get tailored clause results
  getTailoredClauses: async (threshold = 0.5) => {
    return fetchAPI(`/api/fraud/tailored-clauses?threshold=${threshold}`);
  },
};

// ============================================
// NEO4J GRAPH APIs
// ============================================

export const graphAPI = {
  // Build/rebuild the graph
  build: async () => {
    return fetchAPI('/api/neo4j/build', {
      method: 'POST',
    });
  },
};

export default {
  tender: tenderAPI,
  bid: bidAPI,
  fraud: fraudAPI,
  graph: graphAPI,
};

