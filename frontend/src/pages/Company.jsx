import { useState } from 'react';
import { useAuth } from '../context';
import { Navbar, Card, Button, Input, Tabs, Modal } from '../components';
import { MOCK_TENDERS, TERMS_AND_CONDITIONS } from '../data/mockData';

const Company = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('active');
  const [selectedTender, setSelectedTender] = useState(null);
  const [showTerms, setShowTerms] = useState(false);
  const [showBidForm, setShowBidForm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [bidData, setBidData] = useState({
    bidId: `BID-${Date.now()}`,
    bidPrice: '',
  });

  const tabs = [
    { id: 'active', label: 'Active Tenders' },
    { id: 'past', label: 'Past Bids' },
  ];

  const activeTenders = MOCK_TENDERS.filter(t => t.status === 'active');
  const companyBids = MOCK_TENDERS.filter(t => 
    t.bids.some(b => b.bidderId === user?.id)
  );

  const handleMakeBid = (tender) => {
    setSelectedTender(tender);
    setShowTerms(true);
    setTermsAccepted(false);
  };

  const handleAcceptTerms = () => {
    if (termsAccepted) {
      setShowTerms(false);
      setShowBidForm(true);
      setBidData({
        bidId: `BID-${Date.now()}`,
        bidPrice: '',
      });
    }
  };

  const handleSubmitBid = (e) => {
    e.preventDefault();
    setShowBidForm(false);
    setShowSuccessModal(true);
    setSelectedTender(null);
  };

  const getMockedIP = () => {
    return `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg relative overflow-hidden">
      {/* Dark mode background decorations - matching first page */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-accent-primary/5 dark:bg-accent-secondary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-[500px] h-[500px] bg-emerald-500/3 dark:bg-emerald-500/5 rounded-full blur-3xl" />
      </div>
      
      <Navbar />
      
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with gradient icon */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Company Portal
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Bidder ID: <span className="font-mono text-accent-primary dark:text-accent-secondary">{user?.id}</span>
              </p>
            </div>
          </div>
        </div>

        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === 'active' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTenders.map((tender) => (
              <Card key={tender.id} className="flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    Active
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {tender.department}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {tender.title}
                </h3>
                
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4 flex-1">
                  <p className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {tender.location} - {tender.pincode}
                  </p>
                  <p className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Closes: {tender.closingDate}
                  </p>
                </div>
                
                <div className="pt-4 border-t border-light-border dark:border-dark-border">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-accent-primary dark:text-accent-secondary">
                      ₹{tender.estimatedAmount} Cr
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {tender.bids.length} bid{tender.bids.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <Button fullWidth onClick={() => handleMakeBid(tender)}>
                    Make a Bid
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'past' && (
          <div className="space-y-4">
            {companyBids.length === 0 ? (
              <Card>
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No bids yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Start bidding on active tenders to see your history here.
                  </p>
                </div>
              </Card>
            ) : (
              companyBids.map((tender) => {
                const myBid = tender.bids.find(b => b.bidderId === user?.id);
                return (
                  <Card key={tender.id} hover={false}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {tender.title}
                          </h3>
                          {myBid?.winner && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-accent-success/20 text-accent-success">
                              🏆 Won
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {tender.department} • {tender.location}
                        </p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Your Bid</p>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">
                            ₹{myBid?.amount} Cr
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Estimated</p>
                          <p className="text-xl font-bold text-gray-600 dark:text-gray-400">
                            ₹{tender.estimatedAmount} Cr
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </main>

      {/* Terms & Conditions Modal */}
      <Modal
        isOpen={showTerms}
        onClose={() => setShowTerms(false)}
        title="Terms & Conditions"
        showCloseButton={false}
      >
        <div className="max-h-64 overflow-y-auto text-sm text-gray-600 dark:text-gray-400 mb-6 whitespace-pre-line border border-light-border dark:border-dark-border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
          {TERMS_AND_CONDITIONS}
        </div>
        
        <label className="flex items-center gap-3 cursor-pointer mb-6">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-accent-primary focus:ring-accent-primary"
          />
          <span className="text-gray-900 dark:text-white">
            I accept the Terms & Conditions
          </span>
        </label>

        <div className="flex gap-4">
          <Button variant="secondary" onClick={() => setShowTerms(false)} fullWidth>
            Cancel
          </Button>
          <Button onClick={handleAcceptTerms} disabled={!termsAccepted} fullWidth>
            Continue to Bid
          </Button>
        </div>
      </Modal>

      {/* Bid Form Modal */}
      <Modal
        isOpen={showBidForm}
        onClose={() => setShowBidForm(false)}
        title="Submit Your Bid"
        showCloseButton={false}
      >
        <form onSubmit={handleSubmitBid}>
          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              {selectedTender?.title}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Estimated: ₹{selectedTender?.estimatedAmount} Cr
            </p>
          </div>

          <Input
            label="Bid ID"
            value={bidData.bidId}
            readOnly
          />

          <Input
            label="Bidder ID"
            value={user?.id || ''}
            readOnly
          />

          <Input
            label="Tender ID"
            value={selectedTender?.id || ''}
            readOnly
          />

          <Input
            label="IP Address"
            value={getMockedIP()}
            readOnly
          />

          <div className="mb-4">
            <label className="label">
              Bid Price (in Crores) <span className="text-accent-danger">*</span>
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={bidData.bidPrice}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9.]/g, '');
                if (val.split('.').length <= 2) {
                  setBidData({ ...bidData, bidPrice: val });
                }
              }}
              placeholder="Enter your bid amount"
              required
              className="input-field"
            />
          </div>

          <div className="flex gap-4 mt-6">
            <Button type="button" variant="secondary" onClick={() => setShowBidForm(false)} fullWidth>
              Cancel
            </Button>
            <Button type="submit" fullWidth>
              Submit Bid
            </Button>
          </div>
        </form>
      </Modal>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="✅ Bid Submitted!"
      >
        <p className="text-lg">Bid successfully made!</p>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Your bid has been recorded and will be evaluated after the tender closes.
        </p>
      </Modal>
    </div>
  );
};

export default Company;

