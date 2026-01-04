import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context';
import { Navbar, Card, Button, Input, Select, Modal } from '../components';
import { DEPARTMENTS } from '../data/mockData';
import { tenderAPI } from '../services/api';

const INDIAN_CITIES = [
  { city: 'Mumbai', pincode: '400001', state: 'Maharashtra' },
  { city: 'Delhi', pincode: '110001', state: 'Delhi' },
  { city: 'Bangalore', pincode: '560001', state: 'Karnataka' },
  { city: 'Hyderabad', pincode: '500001', state: 'Telangana' },
  { city: 'Chennai', pincode: '600001', state: 'Tamil Nadu' },
  { city: 'Kolkata', pincode: '700001', state: 'West Bengal' },
  { city: 'Ahmedabad', pincode: '380001', state: 'Gujarat' },
  { city: 'Pune', pincode: '411001', state: 'Maharashtra' },
  { city: 'Jaipur', pincode: '302001', state: 'Rajasthan' },
  { city: 'Lucknow', pincode: '226001', state: 'Uttar Pradesh' },
  { city: 'Kanpur', pincode: '208001', state: 'Uttar Pradesh' },
  { city: 'Nagpur', pincode: '440001', state: 'Maharashtra' },
  { city: 'Indore', pincode: '452001', state: 'Madhya Pradesh' },
  { city: 'Bhopal', pincode: '462001', state: 'Madhya Pradesh' },
  { city: 'Patna', pincode: '800001', state: 'Bihar' },
  { city: 'Vadodara', pincode: '390001', state: 'Gujarat' },
  { city: 'Ghaziabad', pincode: '201001', state: 'Uttar Pradesh' },
  { city: 'Ludhiana', pincode: '141001', state: 'Punjab' },
  { city: 'Agra', pincode: '282001', state: 'Uttar Pradesh' },
  { city: 'Nashik', pincode: '422001', state: 'Maharashtra' },
  { city: 'Ranchi', pincode: '834001', state: 'Jharkhand' },
  { city: 'Faridabad', pincode: '121001', state: 'Haryana' },
  { city: 'Meerut', pincode: '250001', state: 'Uttar Pradesh' },
  { city: 'Rajkot', pincode: '360001', state: 'Gujarat' },
  { city: 'Varanasi', pincode: '221001', state: 'Uttar Pradesh' },
  { city: 'Srinagar', pincode: '190001', state: 'Jammu & Kashmir' },
  { city: 'Aurangabad', pincode: '431001', state: 'Maharashtra' },
  { city: 'Dhanbad', pincode: '826001', state: 'Jharkhand' },
  { city: 'Amritsar', pincode: '143001', state: 'Punjab' },
  { city: 'Allahabad', pincode: '211001', state: 'Uttar Pradesh' },
  { city: 'Jabalpur', pincode: '482001', state: 'Madhya Pradesh' },
  { city: 'Gwalior', pincode: '474001', state: 'Madhya Pradesh' },
  { city: 'Vijayawada', pincode: '520001', state: 'Andhra Pradesh' },
  { city: 'Jodhpur', pincode: '342001', state: 'Rajasthan' },
  { city: 'Madurai', pincode: '625001', state: 'Tamil Nadu' },
  { city: 'Raipur', pincode: '492001', state: 'Chhattisgarh' },
  { city: 'Kota', pincode: '324001', state: 'Rajasthan' },
  { city: 'Guwahati', pincode: '781001', state: 'Assam' },
  { city: 'Chandigarh', pincode: '160001', state: 'Chandigarh' },
  { city: 'Thiruvananthapuram', pincode: '695001', state: 'Kerala' },
  { city: 'Solapur', pincode: '413001', state: 'Maharashtra' },
  { city: 'Tiruchirappalli', pincode: '620001', state: 'Tamil Nadu' },
  { city: 'Bareilly', pincode: '243001', state: 'Uttar Pradesh' },
  { city: 'Moradabad', pincode: '244001', state: 'Uttar Pradesh' },
  { city: 'Mysore', pincode: '570001', state: 'Karnataka' },
  { city: 'Gurgaon', pincode: '122001', state: 'Haryana' },
  { city: 'Aligarh', pincode: '202001', state: 'Uttar Pradesh' },
  { city: 'Jalandhar', pincode: '144001', state: 'Punjab' },
  { city: 'Bhubaneswar', pincode: '751001', state: 'Odisha' },
  { city: 'Salem', pincode: '636001', state: 'Tamil Nadu' },
  { city: 'Warangal', pincode: '506001', state: 'Telangana' },
  { city: 'Guntur', pincode: '522001', state: 'Andhra Pradesh' },
  { city: 'Bhiwandi', pincode: '421302', state: 'Maharashtra' },
  { city: 'Saharanpur', pincode: '247001', state: 'Uttar Pradesh' },
  { city: 'Gorakhpur', pincode: '273001', state: 'Uttar Pradesh' },
  { city: 'Bikaner', pincode: '334001', state: 'Rajasthan' },
  { city: 'Amravati', pincode: '444601', state: 'Maharashtra' },
  { city: 'Noida', pincode: '201301', state: 'Uttar Pradesh' },
  { city: 'Jamshedpur', pincode: '831001', state: 'Jharkhand' },
  { city: 'Bhilai', pincode: '490001', state: 'Chhattisgarh' },
  { city: 'Cuttack', pincode: '753001', state: 'Odisha' },
  { city: 'Firozabad', pincode: '283203', state: 'Uttar Pradesh' },
  { city: 'Kochi', pincode: '682001', state: 'Kerala' },
  { city: 'Nellore', pincode: '524001', state: 'Andhra Pradesh' },
  { city: 'Bhavnagar', pincode: '364001', state: 'Gujarat' },
  { city: 'Dehradun', pincode: '248001', state: 'Uttarakhand' },
  { city: 'Durgapur', pincode: '713201', state: 'West Bengal' },
  { city: 'Asansol', pincode: '713301', state: 'West Bengal' },
  { city: 'Rourkela', pincode: '769001', state: 'Odisha' },
  { city: 'Nanded', pincode: '431601', state: 'Maharashtra' },
  { city: 'Kolhapur', pincode: '416001', state: 'Maharashtra' },
  { city: 'Ajmer', pincode: '305001', state: 'Rajasthan' },
  { city: 'Akola', pincode: '444001', state: 'Maharashtra' },
  { city: 'Gulbarga', pincode: '585101', state: 'Karnataka' },
  { city: 'Jamnagar', pincode: '361001', state: 'Gujarat' },
  { city: 'Ujjain', pincode: '456001', state: 'Madhya Pradesh' },
  { city: 'Loni', pincode: '201102', state: 'Uttar Pradesh' },
  { city: 'Siliguri', pincode: '734001', state: 'West Bengal' },
  { city: 'Jhansi', pincode: '284001', state: 'Uttar Pradesh' },
  { city: 'Ulhasnagar', pincode: '421001', state: 'Maharashtra' },
  { city: 'Jammu', pincode: '180001', state: 'Jammu & Kashmir' },
  { city: 'Sangli', pincode: '416416', state: 'Maharashtra' },
  { city: 'Mangalore', pincode: '575001', state: 'Karnataka' },
  { city: 'Erode', pincode: '638001', state: 'Tamil Nadu' },
  { city: 'Belgaum', pincode: '590001', state: 'Karnataka' },
  { city: 'Ambattur', pincode: '600053', state: 'Tamil Nadu' },
  { city: 'Tirunelveli', pincode: '627001', state: 'Tamil Nadu' },
  { city: 'Malegaon', pincode: '423203', state: 'Maharashtra' },
  { city: 'Gaya', pincode: '823001', state: 'Bihar' },
  { city: 'Udaipur', pincode: '313001', state: 'Rajasthan' },
  { city: 'Kakinada', pincode: '533001', state: 'Andhra Pradesh' },
  { city: 'Davanagere', pincode: '577001', state: 'Karnataka' },
  { city: 'Kozhikode', pincode: '673001', state: 'Kerala' },
  { city: 'Maheshtala', pincode: '700141', state: 'West Bengal' },
  { city: 'Rajpur Sonarpur', pincode: '700149', state: 'West Bengal' },
  { city: 'Bokaro', pincode: '827001', state: 'Jharkhand' },
  { city: 'South Dumdum', pincode: '700028', state: 'West Bengal' },
  { city: 'Bellary', pincode: '583101', state: 'Karnataka' },
  { city: 'Patiala', pincode: '147001', state: 'Punjab' },
];

const Government = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('home');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [departmentTenders, setDepartmentTenders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const cityInputRef = useRef(null);
  
  const departmentName = DEPARTMENTS.find(d => d.value === user?.department)?.label || user?.department;
  
  const [formData, setFormData] = useState({
    tenderTitle: '',
    day: '',
    month: '',
    year: '2025',
    city: '',
    pincode: '',
    estimatedAmount: '',
    mandatoryConditions: '',
  });

  // Fetch department tenders from API
  const fetchTenders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const tenders = await tenderAPI.getAll({ deptName: user?.department });
      setDepartmentTenders(tenders);
    } catch (err) {
      console.error('Error fetching tenders:', err);
      setError('Failed to load tenders. Backend might not be running.');
      setDepartmentTenders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.department) {
      fetchTenders();
    }
  }, [user?.department]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cityInputRef.current && !cityInputRef.current.contains(event.target)) {
        setShowCitySuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCityChange = (value) => {
    setFormData({ ...formData, city: value, pincode: '' });
    
    if (value.length >= 2) {
      const filtered = INDIAN_CITIES.filter(c => 
        c.city.toLowerCase().startsWith(value.toLowerCase())
      ).slice(0, 8);
      setCitySuggestions(filtered);
      setShowCitySuggestions(filtered.length > 0);
    } else {
      setCitySuggestions([]);
      setShowCitySuggestions(false);
    }
  };

  const handleCitySelect = (cityData) => {
    setFormData({ 
      ...formData, 
      city: cityData.city, 
      pincode: cityData.pincode 
    });
    setShowCitySuggestions(false);
  };

  const months = [
    { value: '01', label: 'January' }, { value: '02', label: 'February' },
    { value: '03', label: 'March' }, { value: '04', label: 'April' },
    { value: '05', label: 'May' }, { value: '06', label: 'June' },
    { value: '07', label: 'July' }, { value: '08', label: 'August' },
    { value: '09', label: 'September' }, { value: '10', label: 'October' },
    { value: '11', label: 'November' }, { value: '12', label: 'December' },
  ];

  const days = Array.from({ length: 31 }, (_, i) => ({
    value: String(i + 1).padStart(2, '0'),
    label: String(i + 1),
  }));

  const years = [
    { value: '2025', label: '2025' },
    { value: '2026', label: '2026' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const publishDate = new Date(
        parseInt(formData.year),
        parseInt(formData.month) - 1,
        parseInt(formData.day)
      );

      const tenderData = {
        deptName: user?.department,
        title: formData.tenderTitle,
        location: formData.city,
        pincode: formData.pincode,
        estValueInCr: formData.estimatedAmount,
        publishDate: publishDate.toISOString(),
        mandatoryConditions: formData.mandatoryConditions,
      };

      await tenderAPI.create(tenderData);
      setShowSuccessModal(true);
      fetchTenders(); // Refresh the list
    } catch (err) {
      console.error('Error creating tender:', err);
      setError(err.message || 'Failed to publish tender. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    setFormData({
      tenderTitle: '',
      day: '',
      month: '',
      year: '2025',
      city: '',
      pincode: '',
      estimatedAmount: '',
      mandatoryConditions: '',
    });
    setCurrentView('home');
  };

  // Home View - Two Cards
  if (currentView === 'home') {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg relative overflow-hidden">
        {/* Dark mode background decorations - matching first page */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-20 w-96 h-96 bg-accent-primary/5 dark:bg-accent-secondary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-primary/3 dark:bg-accent-primary/5 rounded-full blur-3xl" />
        </div>
        
        <Navbar />
        
        <main className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Government Portal
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {departmentName}
            </p>
          </div>

          {/* Two Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Publish Tender Card */}
            <button
              onClick={() => setCurrentView('publish')}
              className="group text-left"
            >
              <Card className="h-full p-8 hover:scale-105 transition-all duration-300 hover:shadow-2xl border-2 border-transparent hover:border-blue-500 dark:hover:border-blue-400">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  Publish a Tender
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Create and publish a new tender for companies to bid on. Fill in the details and make it live.
                </p>
                <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold group-hover:gap-3 gap-2 transition-all">
                  <span>Get Started</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </Card>
            </button>

            {/* View Past Tenders Card */}
            <button
              onClick={() => setCurrentView('past')}
              className="group text-left"
            >
              <Card className="h-full p-8 hover:scale-105 transition-all duration-300 hover:shadow-2xl border-2 border-transparent hover:border-purple-500 dark:hover:border-purple-400">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  View Past Tenders
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Review all previously published tenders, their status, and bid submissions.
                </p>
                <div className="flex items-center text-purple-600 dark:text-purple-400 font-semibold group-hover:gap-3 gap-2 transition-all">
                  <span>View History</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </Card>
            </button>
          </div>

          {/* Stats Bar */}
          <div className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 border border-gray-200 dark:border-gray-700/50 backdrop-blur-sm">
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Loading stats...</p>
              </div>
            ) : error ? (
              <div className="text-center py-4">
                <p className="text-amber-600 dark:text-amber-400 text-sm">{error}</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-8 text-center">
                <div>
                  <p className="text-3xl font-bold text-accent-primary dark:text-accent-secondary">
                    {departmentTenders.filter(t => t.status === 'active').length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Tenders</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-accent-primary dark:text-accent-secondary">
                    {departmentTenders.filter(t => t.status === 'completed').length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-accent-primary dark:text-accent-secondary">
                    {departmentTenders.length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Tenders</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Publish Tender View
  if (currentView === 'publish') {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg relative overflow-hidden">
        {/* Dark mode background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-40 right-10 w-80 h-80 bg-accent-primary/5 dark:bg-accent-secondary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-40 left-10 w-64 h-64 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl" />
        </div>
        
        <Navbar />
        
        <main className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <button
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </div>
            <span className="font-medium">Back to Portal</span>
          </button>

          <Card>
            {/* Header */}
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Publish a New Tender
                </h1>
                <p className="text-gray-600 dark:text-gray-400">Fill in the details below</p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error message */}
              {error && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Auto-generated fields */}
              <div className="p-5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-4">Auto-Generated Information</p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Tender ID</label>
                    <p className="text-xl font-mono font-bold text-gray-900 dark:text-white mt-1">Auto-generated on submit</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Department</label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">{user?.department}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{departmentName}</p>
                  </div>
                </div>
              </div>

              {/* Tender Title */}
              <Input
                label="Tender Title"
                value={formData.tenderTitle}
                onChange={(e) => setFormData({ ...formData, tenderTitle: e.target.value })}
                placeholder="e.g., Construction of Bridge over Narmada River"
                required
              />

              {/* Date of Filing */}
              <div>
                <label className="label">Date of Filing Tender <span className="text-accent-danger">*</span></label>
                <div className="grid grid-cols-3 gap-4">
                  <Select
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                    options={days}
                    placeholder="Day"
                    required
                  />
                  <Select
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    options={months}
                    placeholder="Month"
                    required
                  />
                  <Select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    options={years}
                    placeholder="Year"
                    required
                  />
                </div>
              </div>

              {/* Location */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="mb-4 relative" ref={cityInputRef}>
                  <label className="label">
                    City <span className="text-accent-danger">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleCityChange(e.target.value)}
                    onFocus={() => {
                      if (formData.city.length >= 2) {
                        const filtered = INDIAN_CITIES.filter(c => 
                          c.city.toLowerCase().startsWith(formData.city.toLowerCase())
                        ).slice(0, 8);
                        setCitySuggestions(filtered);
                        setShowCitySuggestions(filtered.length > 0);
                      }
                    }}
                    placeholder="Start typing city name..."
                    required
                    className="input-field"
                    autoComplete="off"
                  />
                  
                  {showCitySuggestions && citySuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-64 overflow-y-auto">
                      {citySuggestions.map((cityData, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleCitySelect(cityData)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between border-b border-gray-100 dark:border-gray-700 last:border-0"
                        >
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{cityData.city}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{cityData.state}</p>
                          </div>
                          <span className="text-sm font-mono text-gray-400 dark:text-gray-500">{cityData.pincode}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="mb-4">
                  <label className="label">
                    Pincode <span className="text-accent-danger">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                    placeholder="e.g., 462001"
                    required
                    className="input-field"
                  />
                </div>
              </div>

              {/* Estimated Amount */}
              <div className="mb-4">
                <label className="label">
                  Estimated Amount (in Crores) <span className="text-accent-danger">*</span>
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={formData.estimatedAmount}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, '');
                    if (val.split('.').length <= 2) {
                      setFormData({ ...formData, estimatedAmount: val });
                    }
                  }}
                  placeholder="e.g., 25.50"
                  required
                  className="input-field"
                />
              </div>

              {/* Mandatory Conditions */}
              <div className="mb-4">
                <label className="label">
                  Mandatory Conditions <span className="text-accent-danger">*</span>
                </label>
                <textarea
                  value={formData.mandatoryConditions}
                  onChange={(e) => setFormData({ ...formData, mandatoryConditions: e.target.value })}
                  placeholder="Enter all mandatory conditions and eligibility criteria for bidders..."
                  rows={5}
                  required
                  className="input-field resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button type="button" variant="secondary" onClick={() => setCurrentView('home')} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Publishing...
                    </span>
                  ) : (
                    'Publish Tender'
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </main>

        <Modal
          isOpen={showSuccessModal}
          onClose={handleSuccessClose}
          title="✅ Tender Published Successfully!"
        >
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
              Your tender has been published successfully!
            </p>
            <p className="text-gray-500 dark:text-gray-400">
              It is now visible to all registered companies and open for bidding.
            </p>
          </div>
        </Modal>
      </div>
    );
  }

  // Past Tenders View
  if (currentView === 'past') {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg relative overflow-hidden">
        {/* Dark mode background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-40 w-96 h-96 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-accent-primary/5 dark:bg-accent-secondary/10 rounded-full blur-3xl" />
        </div>
        
        <Navbar />
        
        <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <button
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </div>
            <span className="font-medium">Back to Portal</span>
          </button>

          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Past Tenders
              </h1>
              <p className="text-gray-600 dark:text-gray-400">{departmentTenders.length} tenders found</p>
            </div>
          </div>

          {isLoading ? (
            <Card>
              <div className="text-center py-16">
                <div className="animate-spin w-12 h-12 border-3 border-accent-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading tenders...</p>
              </div>
            </Card>
          ) : error ? (
            <Card>
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Could not load tenders
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
                <Button onClick={fetchTenders}>Retry</Button>
              </div>
            </Card>
          ) : departmentTenders.length === 0 ? (
            <Card>
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No tenders found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  You haven't published any tenders yet.
                </p>
                <Button onClick={() => setCurrentView('publish')}>
                  Publish Your First Tender
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {departmentTenders.map((tender) => (
                <Card key={tender.tenderId || tender._id} className="flex flex-col">
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                      tender.status === 'active' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${tender.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                      {tender.status?.charAt(0).toUpperCase() + tender.status?.slice(1)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-500 font-mono">
                      {tender.tenderId}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {tender.title || `${tender.deptName} Tender`}
                  </h3>

                  {/* Details */}
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4 flex-1">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{tender.location} - {tender.pincode}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Published: {new Date(tender.publishDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          ₹{tender.estValueInCr} Cr
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">Estimated Value</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-500 font-mono">{tender.deptName}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  return null;
};

export default Government;
