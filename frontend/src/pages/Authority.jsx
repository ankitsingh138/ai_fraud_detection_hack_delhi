import { useState, useEffect } from 'react';
import { Navbar, Card, Button, Tabs, NetworkGraph } from '../components';
import { useAuth } from '../context';
import { fraudAPI, tenderAPI } from '../services/api';
import {
  ADDRESS_COLLUSION_DATA,
  IP_COLLUSION_DATA,
  SHARED_OWNERSHIP_DATA,
  TAILORED_CLAUSE_DATA,
  FINANCIAL_TIES_DATA,
} from '../data/mockData';

const Authority = () => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [selectedTender, setSelectedTender] = useState(null);
  
  // Pending approval states
  const [pendingTenders, setPendingTenders] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [checkingTender, setCheckingTender] = useState(null);
  const [tenderChecks, setTenderChecks] = useState({});
  const [rejectModal, setRejectModal] = useState({ open: false, tenderId: null });
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  
  // API data states
  const [addressData, setAddressData] = useState(null);
  const [ipData, setIPData] = useState(null);
  const [ownershipData, setOwnershipData] = useState(null);
  const [financialData, setFinancialData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useMockData, setUseMockData] = useState(false);

  const tabs = [
    { id: 'pending', label: '⏳ Pending Approvals' },
    { id: 'address', label: '📍 Address Collusion' },
    { id: 'ip', label: '🌐 IP Collusion' },
    { id: 'ownership', label: '👥 Shared Ownership' },
    { id: 'tailored', label: '📋 Tailored Clause' },
    { id: 'financial', label: '🏦 Financial Ties' },
  ];

  // Fetch pending tenders
  const fetchPendingTenders = async () => {
    setLoadingPending(true);
    try {
      const tenders = await tenderAPI.getPending();
      setPendingTenders(tenders);
    } catch (err) {
      console.error('Error fetching pending tenders:', err);
    } finally {
      setLoadingPending(false);
    }
  };

  // Run fraud checks on a tender
  const runChecksOnTender = async (tenderId) => {
    setCheckingTender(tenderId);
    try {
      const checks = await fraudAPI.checkTender(tenderId);
      setTenderChecks(prev => ({ ...prev, [tenderId]: checks }));
    } catch (err) {
      console.error('Error running checks:', err);
      setTenderChecks(prev => ({ 
        ...prev, 
        [tenderId]: { error: 'Failed to run checks' } 
      }));
    } finally {
      setCheckingTender(null);
    }
  };

  // Approve a tender
  const handleApprove = async (tenderId) => {
    setActionLoading(tenderId);
    try {
      await tenderAPI.approve(tenderId);
      setPendingTenders(prev => prev.filter(t => t.tenderId !== tenderId));
      setTenderChecks(prev => {
        const updated = { ...prev };
        delete updated[tenderId];
        return updated;
      });
    } catch (err) {
      console.error('Error approving tender:', err);
      alert('Failed to approve tender: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Reject a tender
  const handleReject = async () => {
    const { tenderId } = rejectModal;
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    
    setActionLoading(tenderId);
    try {
      await tenderAPI.reject(tenderId, rejectionReason);
      setPendingTenders(prev => prev.filter(t => t.tenderId !== tenderId));
      setTenderChecks(prev => {
        const updated = { ...prev };
        delete updated[tenderId];
        return updated;
      });
      setRejectModal({ open: false, tenderId: null });
      setRejectionReason('');
    } catch (err) {
      console.error('Error rejecting tender:', err);
      alert('Failed to reject tender: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Fetch fraud data from API
  const fetchFraudData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [address, ip, ownership, financial] = await Promise.all([
        fraudAPI.getAddressCollusion(),
        fraudAPI.getIPCollusion(),
        fraudAPI.getSharedOwnership(),
        fraudAPI.getFinancialTies()
      ]);
      
      setAddressData(address);
      setIPData(ip);
      setOwnershipData(ownership);
      setFinancialData(financial);
      setUseMockData(false);
    } catch (err) {
      console.error('Error fetching fraud data:', err);
      setError('Backend not available. Showing demo data.');
      setUseMockData(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingTenders();
    fetchFraudData();
  }, []);

  // Get current data (API or mock fallback)
  const getAddressData = () => useMockData ? ADDRESS_COLLUSION_DATA : (addressData || ADDRESS_COLLUSION_DATA);
  const getIPData = () => useMockData ? IP_COLLUSION_DATA : (ipData || IP_COLLUSION_DATA);
  const getOwnershipData = () => useMockData ? SHARED_OWNERSHIP_DATA : (ownershipData || SHARED_OWNERSHIP_DATA);
  const getFinancialData = () => useMockData ? FINANCIAL_TIES_DATA : (financialData || FINANCIAL_TIES_DATA);

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisResults(null);
    
    try {
      // Call the actual NLP analysis API
      await fraudAPI.analyzeTenders();
      
      // Then fetch the results
      const results = await fraudAPI.getTailoredClauses(0.5);
      
      if (results.highRiskTenders && results.highRiskTenders.length > 0) {
        // Transform API response to match UI format
        const formattedResults = results.highRiskTenders.map(t => ({
          tenderId: t.tenderId,
          title: t.tender?.title || `${t.tender?.deptName} Tender`,
          department: t.tender?.deptName || 'Unknown',
          riskScore: t.riskScore,
          riskLevel: t.riskScore > 0.8 ? 'high' : t.riskScore > 0.6 ? 'medium' : 'low',
          specifications: {
            estimatedCost: t.tender ? `₹${t.tender.estValueInCr} Cr` : 'N/A',
            deadline: 'As per tender',
            location: t.tender?.location || 'N/A',
            eligibility: 'See flagged clauses'
          },
          flaggedClauses: t.flaggedClauses?.map(c => c.requirementText) || []
        }));
        setAnalysisResults(formattedResults);
      } else {
        setAnalysisResults([]);
      }
    } catch (err) {
      console.error('NLP analysis error:', err);
      // Fall back to mock data
      setAnalysisResults(TAILORED_CLAUSE_DATA);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskBadgeColor = (riskLevel) => {
    switch (riskLevel) {
      case 'high':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    }
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-purple-500/5 dark:bg-purple-500/15 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-accent-primary/5 dark:bg-accent-secondary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/3 dark:bg-pink-500/5 rounded-full blur-3xl" />
      </div>
      
      <Navbar />
      
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg dark:shadow-purple-500/20">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Fraud Detection Authority
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  AI-Powered Bid Collusion & Fraud Analysis Dashboard
                </p>
              </div>
            </div>
            <Button variant="secondary" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>

        {/* Connection Status Banner */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-amber-700 dark:text-amber-400 text-sm">{error}</span>
              <Button variant="secondary" onClick={fetchFraudData} className="ml-auto text-xs py-1 px-3">
                Retry Connection
              </Button>
            </div>
          </div>
        )}

        {/* Stats Bar */}
        <div className="grid grid-cols-6 gap-4 mb-8">
          {isLoading ? (
            Array(6).fill(0).map((_, index) => (
              <div key={index} className="relative overflow-hidden rounded-xl p-4 bg-white dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 shadow-lg animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-12 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              </div>
            ))
          ) : (
            [
              { label: 'Pending Approval', value: pendingTenders.length, color: 'from-amber-500 to-orange-500' },
              { label: 'Address Alerts', value: getAddressData().tableData?.length || 0, color: 'from-red-500 to-orange-500' },
              { label: 'IP Conflicts', value: getIPData().tableData?.length || 0, color: 'from-yellow-500 to-amber-500' },
              { label: 'Ownership Flags', value: getOwnershipData().tableData?.length || 0, color: 'from-purple-500 to-violet-500' },
              { label: 'Risky Tenders', value: analysisResults?.length || TAILORED_CLAUSE_DATA.length, color: 'from-pink-500 to-rose-500' },
              { label: 'Financial Links', value: getFinancialData().tableData?.sharedBankAccounts?.length || getFinancialData().bankTableData?.length || 0, color: 'from-cyan-500 to-blue-500' },
            ].map((stat, index) => (
              <div
                key={index}
                className="relative overflow-hidden rounded-xl p-4 bg-white dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 shadow-lg"
              >
                <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${stat.color}`} />
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
              </div>
            ))
          )}
        </div>

        {/* Tabs */}
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* Pending Approvals Tab */}
        {activeTab === 'pending' && (
          <div className="space-y-6">
            <Card hover={false}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    Tenders Awaiting Approval
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Review and approve new tenders before they become active
                  </p>
                </div>
                <Button variant="secondary" onClick={fetchPendingTenders} disabled={loadingPending}>
                  {loadingPending ? 'Refreshing...' : '🔄 Refresh'}
                </Button>
              </div>

              {loadingPending && pendingTenders.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-4">
                    <svg className="animate-spin h-8 w-8 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">Loading pending tenders...</p>
                </div>
              ) : pendingTenders.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    All Caught Up!
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    No tenders are pending approval at the moment.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingTenders.map((tender) => {
                    const checks = tenderChecks[tender.tenderId];
                    const isChecking = checkingTender === tender.tenderId;
                    const isActionLoading = actionLoading === tender.tenderId;
                    
                    return (
                      <div
                        key={tender.tenderId}
                        className="p-5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
                      >
                        {/* Tender Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <code className="font-mono text-sm font-bold text-amber-600 dark:text-amber-400">
                                {tender.tenderId}
                              </code>
                              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                Pending Approval
                              </span>
                            </div>
                            <h4 className="font-medium text-gray-900 dark:text-white text-lg">
                              {tender.title || `${tender.deptName} Tender`}
                            </h4>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              ₹{tender.estValueInCr} Cr
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-500">Estimated Value</p>
                          </div>
                        </div>

                        {/* Tender Details */}
                        <div className="grid md:grid-cols-4 gap-4 mb-4">
                          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                            <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Department</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{tender.deptName}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                            <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Location</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{tender.location} - {tender.pincode}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                            <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Published</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {new Date(tender.publishDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                            <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Closing Date</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {tender.closingDate ? new Date(tender.closingDate).toLocaleDateString() : 'Not set'}
                            </p>
                          </div>
                        </div>

                        {/* Run Checks Button */}
                        {!checks && (
                          <div className="mb-4">
                            <Button
                              variant="secondary"
                              onClick={() => runChecksOnTender(tender.tenderId)}
                              disabled={isChecking}
                              className="w-full"
                            >
                              {isChecking ? (
                                <span className="flex items-center justify-center gap-2">
                                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                  </svg>
                                  Running All Checks...
                                </span>
                              ) : (
                                '🔍 Run All Fraud Checks'
                              )}
                            </Button>
                          </div>
                        )}

                        {/* Check Results */}
                        {checks && !checks.error && (
                          <div className="mb-4">
                            <div className={`p-4 rounded-lg border ${
                              checks.summary?.overallStatus === 'danger' 
                                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                : checks.summary?.overallStatus === 'warning'
                                  ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                                  : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                            }`}>
                              <div className="flex items-center justify-between mb-3">
                                <h5 className={`font-semibold ${
                                  checks.summary?.overallStatus === 'danger'
                                    ? 'text-red-800 dark:text-red-400'
                                    : checks.summary?.overallStatus === 'warning'
                                      ? 'text-amber-800 dark:text-amber-400'
                                      : 'text-green-800 dark:text-green-400'
                                }`}>
                                  {checks.summary?.overallStatus === 'danger' ? '🚨' : checks.summary?.overallStatus === 'warning' ? '⚠️' : '✓'} 
                                  {' '}{checks.summary?.recommendation}
                                </h5>
                                <Button
                                  variant="secondary"
                                  onClick={() => runChecksOnTender(tender.tenderId)}
                                  className="text-xs py-1 px-3"
                                >
                                  Re-run Checks
                                </Button>
                              </div>
                              
                              <div className="grid md:grid-cols-5 gap-2">
                                {(checks.results || []).map((check, idx) => (
                                  <div
                                    key={idx}
                                    className={`p-2 rounded-lg text-center ${
                                      check.status === 'danger'
                                        ? 'bg-red-100 dark:bg-red-900/30'
                                        : check.status === 'warning'
                                          ? 'bg-amber-100 dark:bg-amber-900/30'
                                          : check.status === 'clear'
                                            ? 'bg-green-100 dark:bg-green-900/30'
                                            : 'bg-gray-100 dark:bg-gray-800'
                                    }`}
                                  >
                                    <p className={`text-lg font-bold ${
                                      check.status === 'danger'
                                        ? 'text-red-700 dark:text-red-400'
                                        : check.status === 'warning'
                                          ? 'text-amber-700 dark:text-amber-400'
                                          : check.status === 'clear'
                                            ? 'text-green-700 dark:text-green-400'
                                            : 'text-gray-700 dark:text-gray-400'
                                    }`}>
                                      {check.status === 'danger' ? '⛔' : check.status === 'warning' ? '⚠️' : check.status === 'clear' ? '✓' : '?'}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate" title={check.label}>
                                      {check.label}
                                    </p>
                                    {check.count > 0 && (
                                      <p className="text-xs font-medium text-gray-900 dark:text-white">
                                        {check.count} found
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {checks?.error && (
                          <div className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                            <p className="text-red-700 dark:text-red-400">{checks.error}</p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <Button
                            onClick={() => handleApprove(tender.tenderId)}
                            disabled={isActionLoading}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            {isActionLoading ? 'Processing...' : '✓ Approve Tender'}
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => setRejectModal({ open: true, tenderId: tender.tenderId })}
                            disabled={isActionLoading}
                            className="flex-1 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                          >
                            ✗ Reject with Reason
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Reject Modal */}
        {rejectModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Reject Tender
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Please provide a reason for rejection. This will be sent back to the government department for correction.
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white mb-4 h-32 resize-none"
              />
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setRejectModal({ open: false, tenderId: null });
                    setRejectionReason('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={actionLoading || !rejectionReason.trim()}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Address Collusion Tab */}
        {activeTab === 'address' && (
          <div className="space-y-6">
            <Card hover={false}>
              <NetworkGraph
                nodes={getAddressData().nodes || []}
                edges={getAddressData().edges || []}
                title="Address-Company Network Graph"
                height={450}
              />
            </Card>

            <Card hover={false}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                Addresses with Multiple Registered Companies
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Address</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Companies Registered</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(getAddressData().tableData || []).map((row, index) => (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-red-500">📍</span>
                            <span className="font-medium text-gray-900 dark:text-white">{row.address}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-2">
                            {(row.companies || []).map((company, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              >
                                🏢 {typeof company === 'object' ? company.name : company}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 font-bold">
                            {row.count || row.companies?.length || 0}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* IP Collusion Tab */}
        {activeTab === 'ip' && (
          <div className="space-y-6">
            <Card hover={false}>
              <NetworkGraph
                nodes={getIPData().nodes || []}
                edges={getIPData().edges || []}
                title="IP Address - Bid Network Graph"
                height={450}
              />
            </Card>

            <Card hover={false}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                IP Addresses with Multiple Bids
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">IP Address</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Bid Count</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Bids from this IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(getIPData().tableData || []).map((row, index) => (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-amber-500">🌐</span>
                            <code className="font-mono text-sm font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                              {row.ipAddress || row.ip}
                            </code>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-mono text-sm text-purple-600 dark:text-purple-400">{row.bidCount || row.bids?.length || 0}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-2">
                            {(row.bids || []).map((bid, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              >
                                📄 {typeof bid === 'object' ? `${bid.company} → ${bid.tender}` : bid}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Shared Ownership Tab */}
        {activeTab === 'ownership' && (
          <div className="space-y-6">
            <Card hover={false}>
              <NetworkGraph
                nodes={getOwnershipData().nodes || []}
                edges={getOwnershipData().edges || []}
                title="Person - Company Ownership Network"
                height={450}
              />
            </Card>

            <Card hover={false}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-500" />
                Individuals Owning Multiple Companies
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Person Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Companies Owned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(getOwnershipData().tableData || []).map((row, index) => (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-purple-500">👤</span>
                            <span className="font-medium text-gray-900 dark:text-white">{row.personName || row.person}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <code className="font-mono text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                            {row.personId || row.pan || 'N/A'}
                          </code>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-2">
                            {(row.companies || []).map((company, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              >
                                🏢 {typeof company === 'object' ? company.companyName : company}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Tailored Clause Tab */}
        {activeTab === 'tailored' && (
          <div className="space-y-6">
            <Card hover={false}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-pink-500" />
                    Tailored Clause Detection (NLP Analysis)
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    AI-powered analysis to detect tenders with suspiciously specific requirements
                  </p>
                </div>
                <Button onClick={handleRunAnalysis} disabled={isAnalyzing}>
                  {isAnalyzing ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Analyzing...
                    </span>
                  ) : (
                    '🔍 Run Analysis on New Tenders'
                  )}
                </Button>
              </div>

              {isAnalyzing && (
                <div className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-100 dark:bg-pink-900/30 mb-4">
                    <svg className="animate-spin h-8 w-8 text-pink-600 dark:text-pink-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">Running NLP model analysis...</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Checking tender specifications for tailored clauses</p>
                </div>
              )}

              {!isAnalyzing && analysisResults && (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <p className="text-sm font-medium text-red-800 dark:text-red-400">
                      ⚠️ Found {analysisResults.length} tenders with risk score &gt; 0.8
                    </p>
                  </div>

                  {analysisResults.map((tender, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-700 transition-colors cursor-pointer"
                      onClick={() => setSelectedTender(selectedTender?.tenderId === tender.tenderId ? null : tender)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <code className="font-mono text-sm font-bold text-pink-600 dark:text-pink-400">
                              {tender.tenderId}
                            </code>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRiskBadgeColor(tender.riskLevel)}`}>
                              Risk: {(tender.riskScore * 100).toFixed(0)}%
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-500">{tender.department}</span>
                          </div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{tender.title}</h4>
                        </div>
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform ${selectedTender?.tenderId === tender.tenderId ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>

                      {selectedTender?.tenderId === tender.tenderId && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          {/* Tender Specifications */}
                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                              <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Estimated Cost</p>
                              <p className="font-semibold text-gray-900 dark:text-white">{tender.specifications.estimatedCost}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                              <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Deadline</p>
                              <p className="font-semibold text-gray-900 dark:text-white">{tender.specifications.deadline}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                              <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Location</p>
                              <p className="font-semibold text-gray-900 dark:text-white">{tender.specifications.location}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                              <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Eligibility</p>
                              <p className="font-semibold text-gray-900 dark:text-white">{tender.specifications.eligibility}</p>
                            </div>
                          </div>

                          {/* Flagged Clauses */}
                          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                            <h5 className="font-semibold text-red-800 dark:text-red-400 mb-3 flex items-center gap-2">
                              🚨 Flagged Suspicious Clauses
                            </h5>
                            <ul className="space-y-2">
                              {tender.flaggedClauses.map((clause, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-red-700 dark:text-red-300">
                                  <span className="mt-1">•</span>
                                  <span>{clause}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {!isAnalyzing && !analysisResults && (
                <div className="p-12 text-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Run NLP Analysis
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    Click the button above to run AI-powered analysis on new tenders and detect potentially tailored clauses designed to favor specific bidders.
                  </p>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Financial Ties Tab */}
        {activeTab === 'financial' && (
          <div className="space-y-6">
            <Card hover={false}>
              <NetworkGraph
                nodes={getFinancialData().nodes || []}
                edges={getFinancialData().edges || []}
                title="Financial Relationships Network"
                height={450}
              />
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Bank Accounts Table */}
              <Card hover={false}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-cyan-500" />
                  Shared Bank Accounts
                </h3>
                <div className="space-y-4">
                  {(getFinancialData().tableData?.sharedBankAccounts || getFinancialData().bankTableData || []).map((row, index) => (
                    <div key={index} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-cyan-500">🏦</span>
                        <span className="font-medium text-gray-900 dark:text-white">{row.bank || `Account ${(row.tieId || '').slice(0, 8)}...`}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                        {row.accountNo ? `Account: ${row.accountNo}` : `${row.count || row.companies?.length || 0} companies share this account`}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(row.companies || []).map((company, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400"
                          >
                            {typeof company === 'object' ? company.name : company}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Notaries / EMD Accounts Table */}
              <Card hover={false}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-pink-500" />
                  Shared Notaries & EMD Accounts
                </h3>
                <div className="space-y-4">
                  {(getFinancialData().tableData?.sharedNotaries || getFinancialData().guarantorTableData || []).map((row, index) => (
                    <div key={index} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-pink-500">🤝</span>
                        <span className="font-medium text-gray-900 dark:text-white">{row.guarantor || `Notary ${row.tieId || 'Unknown'}`}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">
                        {row.pan ? `PAN: ${row.pan}` : `${row.count || row.companies?.length || 0} companies use this notary`}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Associated companies:</p>
                      <div className="flex flex-wrap gap-2">
                        {(row.companiesGuaranteed || row.companies || []).map((company, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400"
                          >
                            {typeof company === 'object' ? company.name : company}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Authority;
