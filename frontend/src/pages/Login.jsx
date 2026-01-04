import { useState } from 'react';
import { useAuth, useTheme } from '../context';
import { Button, Card, Input, Select, Modal } from '../components';
import { DEPARTMENTS } from '../data/mockData';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className="fixed top-6 right-6 z-50 p-3 rounded-xl bg-white dark:bg-dark-card shadow-lg border border-light-border dark:border-dark-border hover:scale-110 transition-all duration-200"
      aria-label="Toggle theme"
    >
      {isDarkMode ? (
        <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </button>
  );
};

const StatCard = ({ value, label, icon }) => (
  <div className="group flex items-center gap-4 p-4 rounded-xl bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-accent-secondary/20 hover:border-white/50 dark:hover:border-accent-secondary/40 transition-all duration-300 hover:scale-105 hover:bg-white/15 dark:hover:bg-gray-800/70">
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/30 to-white/10 dark:from-accent-secondary/30 dark:to-accent-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-white dark:text-accent-secondary">{value}</p>
      <p className="text-sm text-white/80 dark:text-gray-400">{label}</p>
    </div>
  </div>
);

const Login = () => {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    department: '',
    password: '',
  });

  const handleLogin = (e) => {
    e.preventDefault();
    if (selectedRole === 'government') {
      login('government', {
        id: formData.id,
        department: formData.department,
        name: `${formData.department} Officer`,
      });
    } else if (selectedRole === 'company') {
      login('company', {
        id: formData.id,
        name: `Company ${formData.id}`,
      });
    } else if (selectedRole === 'authority') {
      login('authority', {
        id: formData.id,
        name: `Authority ${formData.id}`,
      });
    }
  };

  const roleCards = [
    {
      id: 'government',
      title: 'Government',
      subtitle: 'Department Portal',
      description: 'Publish and manage tenders',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: 'from-blue-500 to-indigo-600',
      hoverColor: 'group-hover:from-blue-600 group-hover:to-indigo-700',
    },
    {
      id: 'company',
      title: 'Company',
      subtitle: 'Bidder Portal',
      description: 'View tenders and submit bids',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      color: 'from-emerald-500 to-teal-600',
      hoverColor: 'group-hover:from-emerald-600 group-hover:to-teal-700',
    },
    {
      id: 'authority',
      title: 'Authority',
      subtitle: 'Audit Portal',
      description: 'Monitor and regulate',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      color: 'from-purple-500 to-pink-600',
      hoverColor: 'group-hover:from-purple-600 group-hover:to-pink-700',
    },
  ];

  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg overflow-hidden">
        <ThemeToggle />
        
        {/* Background Pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-primary/20 dark:bg-accent-primary/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -left-40 w-80 h-80 bg-accent-secondary/20 dark:bg-accent-secondary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-purple-500/20 dark:bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative min-h-screen flex flex-col lg:flex-row">
          {/* Left Section - Hero */}
          <div className="lg:w-1/2 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-8 lg:p-16 flex flex-col justify-center relative overflow-hidden">
            {/* Light mode animated gradient orbs */}
            <div className="absolute inset-0 dark:opacity-0 opacity-100 pointer-events-none">
              <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-500/40 rounded-full blur-3xl animate-pulse" />
              <div className="absolute top-1/3 -right-20 w-80 h-80 bg-indigo-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
              <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-cyan-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-3xl" />
            </div>
            
            {/* Dark mode animated gradient orbs */}
            <div className="absolute inset-0 dark:opacity-100 opacity-0 pointer-events-none">
              <div className="absolute -top-20 -left-20 w-96 h-96 bg-accent-secondary/30 rounded-full blur-3xl animate-pulse" />
              <div className="absolute top-1/3 -right-20 w-80 h-80 bg-purple-500/25 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
              <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent-primary/15 rounded-full blur-3xl" />
            </div>
            
            {/* Dark mode mesh gradient overlay */}
            <div className="absolute inset-0 dark:opacity-30 opacity-0 pointer-events-none" style={{
              backgroundImage: `radial-gradient(circle at 20% 80%, rgba(6, 182, 212, 0.3) 0%, transparent 50%),
                               radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.3) 0%, transparent 50%),
                               radial-gradient(circle at 40% 40%, rgba(34, 211, 238, 0.2) 0%, transparent 40%)`
            }} />
            
            {/* Dark mode decorative shapes */}
            <div className="absolute inset-0 dark:opacity-100 opacity-0 pointer-events-none overflow-hidden">
              {/* Floating rings */}
              <div className="absolute top-16 left-8 w-24 h-24 border-2 border-accent-secondary/30 rounded-full animate-spin-slow" />
              <div className="absolute top-24 left-16 w-16 h-16 border border-cyan-400/40 rounded-full animate-float" />
              <div className="absolute bottom-32 right-12 w-40 h-40 border-2 border-accent-secondary/20 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse' }} />
              <div className="absolute bottom-48 right-24 w-20 h-20 border border-purple-400/30 rounded-full animate-float-delayed" />
              
              {/* Geometric shapes */}
              <div className="absolute top-1/3 right-8 w-12 h-12 border-2 border-accent-secondary/25 rotate-45 animate-float" />
              <div className="absolute bottom-1/4 left-12 w-8 h-8 bg-accent-secondary/15 rotate-12 animate-float-delayed" />
              <div className="absolute top-2/3 right-1/4 w-6 h-6 bg-cyan-400/40 rounded-full animate-pulse" />
              
              {/* Floating dots */}
              <div className="absolute top-20 right-1/3 w-2 h-2 bg-accent-secondary/60 rounded-full animate-float" />
              <div className="absolute top-28 right-[38%] w-2 h-2 bg-cyan-400/50 rounded-full animate-float-delayed" />
              <div className="absolute top-36 right-[42%] w-2 h-2 bg-accent-secondary/40 rounded-full animate-float" style={{ animationDelay: '1s' }} />
              <div className="absolute bottom-40 left-1/3 w-3 h-3 bg-purple-400/50 rounded-full animate-pulse" />
              <div className="absolute bottom-48 left-[38%] w-2 h-2 bg-accent-secondary/60 rounded-full animate-float-delayed" />
              
              {/* Vertical gradient lines */}
              <div className="absolute top-1/2 left-4 w-1 h-20 bg-gradient-to-b from-accent-secondary/30 to-transparent rounded-full" />
              <div className="absolute top-[60%] left-8 w-1 h-16 bg-gradient-to-b from-cyan-400/25 to-transparent rounded-full" />
              <div className="absolute bottom-1/3 right-4 w-1 h-24 bg-gradient-to-b from-purple-400/25 to-transparent rounded-full" />
            </div>
            
            {/* Light mode mesh gradient overlay */}
            <div className="absolute inset-0 dark:opacity-0 opacity-30 pointer-events-none" style={{
              backgroundImage: `radial-gradient(circle at 20% 80%, rgba(56, 189, 248, 0.3) 0%, transparent 50%),
                               radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.3) 0%, transparent 50%),
                               radial-gradient(circle at 40% 40%, rgba(34, 211, 238, 0.2) 0%, transparent 40%)`
            }} />
            
            {/* Light mode decorative shapes */}
            <div className="absolute inset-0 dark:opacity-0 opacity-100 pointer-events-none overflow-hidden">
              {/* Floating rings */}
              <div className="absolute top-16 left-8 w-24 h-24 border-2 border-white/20 rounded-full animate-spin-slow" />
              <div className="absolute top-24 left-16 w-16 h-16 border border-cyan-400/30 rounded-full animate-float" />
              <div className="absolute bottom-32 right-12 w-40 h-40 border-2 border-white/15 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse' }} />
              <div className="absolute bottom-48 right-24 w-20 h-20 border border-blue-300/30 rounded-full animate-float-delayed" />
              
              {/* Geometric shapes */}
              <div className="absolute top-1/3 right-8 w-12 h-12 border-2 border-white/20 rotate-45 animate-float" />
              <div className="absolute bottom-1/4 left-12 w-8 h-8 bg-white/10 rotate-12 animate-float-delayed" />
              <div className="absolute top-2/3 right-1/4 w-6 h-6 bg-cyan-400/30 rounded-full animate-pulse" />
              
              {/* Floating dots */}
              <div className="absolute top-20 right-1/3 w-2 h-2 bg-white/50 rounded-full animate-float" />
              <div className="absolute top-28 right-[38%] w-2 h-2 bg-white/40 rounded-full animate-float-delayed" />
              <div className="absolute top-36 right-[42%] w-2 h-2 bg-white/30 rounded-full animate-float" style={{ animationDelay: '1s' }} />
              <div className="absolute bottom-40 left-1/3 w-3 h-3 bg-blue-400/40 rounded-full animate-pulse" />
              <div className="absolute bottom-48 left-[38%] w-2 h-2 bg-indigo-400/50 rounded-full animate-float-delayed" />
              
              {/* Additional decorative elements */}
              <div className="absolute top-1/2 left-4 w-1 h-20 bg-gradient-to-b from-white/20 to-transparent rounded-full" />
              <div className="absolute top-[60%] left-8 w-1 h-16 bg-gradient-to-b from-white/15 to-transparent rounded-full" />
              <div className="absolute bottom-1/3 right-4 w-1 h-24 bg-gradient-to-b from-cyan-400/20 to-transparent rounded-full" />
            </div>
            
            {/* Grid pattern for dark mode */}
            <div className="absolute inset-0 dark:opacity-5 opacity-0 pointer-events-none" style={{
              backgroundImage: 'linear-gradient(rgba(0,255,136,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.3) 1px, transparent 1px)',
              backgroundSize: '50px 50px'
            }} />
            
            {/* Subtle grid for light mode */}
            <div className="absolute inset-0 dark:opacity-0 opacity-[0.03] pointer-events-none" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
              backgroundSize: '60px 60px'
            }} />

            <div className="relative z-10">
              {/* Logo */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                  <span className="text-white font-bold text-2xl">T</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">TenderFlow</h1>
                  <p className="text-white/70 text-sm">e-Procurement Portal</p>
                </div>
              </div>

              {/* Main Heading */}
              <h2 className="text-4xl lg:text-5xl font-bold text-white dark:text-white mb-6 leading-tight">
                Transparent
                <span className="block text-white/90 dark:text-gray-300">Government</span>
                <span className="block bg-gradient-to-r from-yellow-300 to-orange-400 dark:from-accent-secondary dark:to-cyan-400 bg-clip-text text-transparent">
                  Procurement
                </span>
              </h2>

              <p className="text-lg text-white/80 dark:text-gray-400 mb-10 max-w-md">
                Streamline your tender management with India's most trusted 
                digital procurement platform. Secure, efficient, and completely transparent.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 max-w-md">
                <StatCard 
                  value="2,450+"
                  label="Active Tenders"
                  icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                />
                <StatCard 
                  value="₹850Cr+"
                  label="Contracts Awarded"
                  icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
                <StatCard 
                  value="1,200+"
                  label="Registered Vendors"
                  icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                />
                <StatCard 
                  value="50+"
                  label="Departments"
                  icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" /></svg>}
                />
              </div>
            </div>
          </div>

          {/* Right Section - Login Options */}
          <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center relative">
            {/* Dark mode decorative gradient */}
            <div className="absolute inset-0 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 pointer-events-none" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-primary/5 dark:bg-accent-secondary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative max-w-md mx-auto w-full">
              {/* Welcome Header */}
              <div className="mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-primary/10 dark:bg-accent-secondary/20 mb-6">
                  <span className="w-2 h-2 rounded-full bg-accent-primary dark:bg-accent-secondary animate-pulse" />
                  <span className="text-sm font-medium text-accent-primary dark:text-accent-secondary">
                    Secure Portal Access
                  </span>
                </div>
                <h3 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                  Welcome
                  <span className="block bg-gradient-to-r from-accent-primary to-accent-secondary dark:from-accent-secondary dark:to-cyan-400 bg-clip-text text-transparent">
                    Back
                  </span>
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Select your portal to access the dashboard
                </p>
              </div>

              <div className="space-y-4">
                {roleCards.map((role, index) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className="group w-full text-left"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="relative flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 hover:border-accent-primary dark:hover:border-accent-secondary/50 transition-all duration-300 hover:shadow-xl dark:hover:shadow-accent-secondary/10 hover:-translate-y-1 backdrop-blur-sm">
                      {/* Glow effect on hover */}
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${role.color} opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 transition-opacity duration-300`} />
                      
                      <div className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center text-white transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg`}>
                        {role.icon}
                      </div>
                      <div className="relative flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {role.title}
                          </h4>
                          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                            {role.subtitle}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {role.description}
                        </p>
                      </div>
                      <div className="relative w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center group-hover:bg-accent-primary dark:group-hover:bg-accent-secondary transition-all duration-300">
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Features */}
              <div className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 border border-gray-200 dark:border-gray-700/50">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-4 text-center">Why choose TenderFlow?</p>
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/25">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Secure</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">256-bit SSL</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Fast</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">Real-time</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Transparent</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">Full audit</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    );
  }

  const isGovernment = selectedRole === 'government';
  const isCompany = selectedRole === 'company';
  const isAuthority = selectedRole === 'authority';

  // Get background gradient based on role
  const getBackgroundGradient = () => {
    if (isGovernment) return 'bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-900';
    if (isCompany) return 'bg-gradient-to-br from-teal-950 via-emerald-900 to-cyan-900';
    return 'bg-gradient-to-br from-rose-950 via-red-900 to-orange-900'; // Authority
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex flex-col lg:flex-row overflow-hidden">
      <ThemeToggle />
      
      {/* Left Side - Decorative */}
      <div className={`hidden lg:flex lg:w-1/2 ${getBackgroundGradient()} dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 relative overflow-hidden`}>
        {/* Light mode animated gradient orbs - Government (Purple/Violet theme) */}
        {isGovernment && (
          <div className="absolute inset-0 dark:opacity-0 opacity-100 pointer-events-none">
            <div className="absolute -top-20 -left-20 w-96 h-96 bg-purple-500/40 rounded-full blur-3xl animate-pulse" />
            <div className="absolute top-1/3 -right-20 w-80 h-80 bg-violet-400/35 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-indigo-400/35 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-fuchsia-500/25 rounded-full blur-3xl" />
          </div>
        )}
        
        {/* Light mode animated gradient orbs - Company (Teal/Emerald theme) */}
        {isCompany && (
          <div className="absolute inset-0 dark:opacity-0 opacity-100 pointer-events-none">
            <div className="absolute -top-20 -left-20 w-96 h-96 bg-emerald-500/40 rounded-full blur-3xl animate-pulse" />
            <div className="absolute top-1/3 -right-20 w-80 h-80 bg-teal-400/35 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-cyan-400/35 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-500/25 rounded-full blur-3xl" />
          </div>
        )}
        
        {/* Light mode animated gradient orbs - Authority (Rose/Orange theme) */}
        {isAuthority && (
          <div className="absolute inset-0 dark:opacity-0 opacity-100 pointer-events-none">
            <div className="absolute -top-20 -left-20 w-96 h-96 bg-rose-500/40 rounded-full blur-3xl animate-pulse" />
            <div className="absolute top-1/3 -right-20 w-80 h-80 bg-orange-400/35 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-red-400/35 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/25 rounded-full blur-3xl" />
          </div>
        )}
        
        {/* Dark mode animated gradient orbs */}
        <div className="absolute inset-0 dark:opacity-100 opacity-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-accent-secondary/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-purple-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-accent-primary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        
        {/* Light mode mesh gradient overlay */}
        <div className={`absolute inset-0 dark:opacity-0 opacity-40 pointer-events-none`} style={{
          backgroundImage: isGovernment 
            ? `radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.3) 0%, transparent 50%),
               radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.25) 0%, transparent 50%),
               radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.2) 0%, transparent 40%)`
            : `radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.3) 0%, transparent 50%),
               radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.25) 0%, transparent 50%),
               radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.2) 0%, transparent 40%)`
        }} />
        
        {/* Light mode decorative shapes */}
        <div className="absolute inset-0 dark:opacity-0 opacity-100 pointer-events-none overflow-hidden">
          {/* Floating rings */}
          <div className={`absolute top-16 left-8 w-24 h-24 border-2 ${isGovernment ? 'border-white/30' : 'border-white/30'} rounded-full animate-spin-slow`} />
          <div className={`absolute top-24 left-16 w-16 h-16 border ${isGovernment ? 'border-white/40' : 'border-white/40'} rounded-full animate-float`} />
          <div className={`absolute bottom-32 right-12 w-40 h-40 border-2 ${isGovernment ? 'border-white/20' : 'border-white/20'} rounded-full animate-spin-slow`} style={{ animationDirection: 'reverse' }} />
          <div className={`absolute bottom-48 right-24 w-20 h-20 border ${isGovernment ? 'border-white/35' : 'border-white/35'} rounded-full animate-float-delayed`} />
          
          {/* Geometric shapes */}
          <div className={`absolute top-1/3 right-8 w-12 h-12 border-2 ${isGovernment ? 'border-white/25' : 'border-white/25'} rotate-45 animate-float`} />
          <div className={`absolute bottom-1/4 left-12 w-8 h-8 ${isGovernment ? 'bg-white/15' : 'bg-white/15'} rotate-12 animate-float-delayed`} />
          <div className={`absolute top-2/3 right-1/4 w-6 h-6 ${isGovernment ? 'bg-white/30' : 'bg-white/30'} rounded-full animate-pulse`} />
          
          {/* Floating dots */}
          <div className="absolute top-20 right-1/3 w-2 h-2 bg-white/60 rounded-full animate-float" />
          <div className="absolute top-28 right-[38%] w-2 h-2 bg-white/50 rounded-full animate-float-delayed" />
          <div className="absolute top-36 right-[42%] w-2 h-2 bg-white/40 rounded-full animate-float" style={{ animationDelay: '1s' }} />
          <div className={`absolute bottom-40 left-1/3 w-3 h-3 ${isGovernment ? 'bg-white/50' : 'bg-white/50'} rounded-full animate-pulse`} />
          <div className={`absolute bottom-48 left-[38%] w-2 h-2 ${isGovernment ? 'bg-white/60' : 'bg-white/60'} rounded-full animate-float-delayed`} />
          
          {/* Vertical gradient lines */}
          <div className="absolute top-1/2 left-4 w-1 h-20 bg-gradient-to-b from-white/30 to-transparent rounded-full" />
          <div className="absolute top-[60%] left-8 w-1 h-16 bg-gradient-to-b from-white/25 to-transparent rounded-full" />
          <div className="absolute bottom-1/3 right-4 w-1 h-24 bg-gradient-to-b from-white/25 to-transparent rounded-full" />
        </div>
        
        {/* Dark mode mesh gradient overlay */}
        <div className="absolute inset-0 dark:opacity-30 opacity-0 pointer-events-none" style={{
          backgroundImage: `radial-gradient(circle at 20% 80%, rgba(6, 182, 212, 0.3) 0%, transparent 50%),
                           radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.3) 0%, transparent 50%),
                           radial-gradient(circle at 40% 40%, rgba(34, 211, 238, 0.2) 0%, transparent 40%)`
        }} />
        
        {/* Dark mode decorative shapes with animations */}
        <div className="absolute inset-0 dark:opacity-100 opacity-0 pointer-events-none overflow-hidden">
          {/* Floating rings */}
          <div className="absolute top-16 left-8 w-24 h-24 border-2 border-accent-secondary/30 rounded-full animate-spin-slow" />
          <div className="absolute top-24 left-16 w-16 h-16 border border-cyan-400/40 rounded-full animate-float" />
          <div className="absolute bottom-32 right-12 w-40 h-40 border-2 border-accent-secondary/20 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse' }} />
          <div className="absolute bottom-48 right-24 w-20 h-20 border border-purple-400/30 rounded-full animate-float-delayed" />
          
          {/* Geometric shapes */}
          <div className="absolute top-1/3 right-8 w-12 h-12 border-2 border-accent-secondary/25 rotate-45 animate-float" />
          <div className="absolute bottom-1/4 left-12 w-8 h-8 bg-accent-secondary/15 rotate-12 animate-float-delayed" />
          <div className="absolute top-2/3 right-1/4 w-6 h-6 bg-cyan-400/40 rounded-full animate-pulse" />
          
          {/* Floating dots */}
          <div className="absolute top-20 right-1/3 w-2 h-2 bg-accent-secondary/60 rounded-full animate-float" />
          <div className="absolute top-28 right-[38%] w-2 h-2 bg-cyan-400/50 rounded-full animate-float-delayed" />
          <div className="absolute top-36 right-[42%] w-2 h-2 bg-accent-secondary/40 rounded-full animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-40 left-1/3 w-3 h-3 bg-purple-400/50 rounded-full animate-pulse" />
          <div className="absolute bottom-48 left-[38%] w-2 h-2 bg-accent-secondary/60 rounded-full animate-float-delayed" />
          
          {/* Vertical gradient lines */}
          <div className="absolute top-1/2 left-4 w-1 h-20 bg-gradient-to-b from-accent-secondary/30 to-transparent rounded-full" />
          <div className="absolute top-[60%] left-8 w-1 h-16 bg-gradient-to-b from-cyan-400/25 to-transparent rounded-full" />
          <div className="absolute bottom-1/3 right-4 w-1 h-24 bg-gradient-to-b from-purple-400/25 to-transparent rounded-full" />
        </div>
        
        {/* Grid pattern for dark mode */}
        <div className="absolute inset-0 dark:opacity-5 opacity-0 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(0,255,136,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.3) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
        
        {/* Subtle grid for light mode */}
        <div className="absolute inset-0 dark:opacity-0 opacity-[0.03] pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
        
        {/* Content - Left aligned like front page */}
        <div className="relative z-10 flex flex-col justify-center w-full p-8 lg:p-16">
          {/* Logo */}
          <div className="flex items-center gap-4 mb-8">
            <div className={`w-14 h-14 ${isGovernment ? 'bg-purple-500/30' : isCompany ? 'bg-emerald-500/30' : 'bg-rose-500/30'} backdrop-blur-sm rounded-xl flex items-center justify-center border ${isGovernment ? 'border-purple-400/30' : isCompany ? 'border-emerald-400/30' : 'border-rose-400/30'}`}>
              {isGovernment ? (
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              ) : isCompany ? (
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              ) : (
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">TenderFlow</h1>
              <p className="text-white/70 text-sm">{isGovernment ? 'Government Portal' : isCompany ? 'Bidder Portal' : 'Audit Portal'}</p>
            </div>
          </div>

          {/* Main Heading - Multi-colored like front page */}
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            {isGovernment ? 'Department' : isCompany ? 'Business' : 'Regulatory'}
            <span className="block text-white/90 dark:text-gray-300">{isGovernment ? 'Administration' : isCompany ? 'Growth' : 'Oversight'}</span>
            <span className={`block bg-gradient-to-r ${isGovernment ? 'from-pink-400 to-purple-400' : isCompany ? 'from-emerald-400 to-cyan-400' : 'from-orange-400 to-rose-400'} dark:from-accent-secondary dark:to-cyan-400 bg-clip-text text-transparent`}>
              {isGovernment ? 'Portal' : isCompany ? 'Platform' : 'Authority'}
            </span>
          </h2>

          <p className="text-lg text-white/80 dark:text-gray-400 mb-10 max-w-md">
            {isGovernment 
              ? 'Access your department dashboard to publish and manage tenders efficiently. Streamlined procurement at your fingertips.'
              : isCompany 
              ? 'Browse active tenders, submit competitive bids, and track your applications. Your gateway to government contracts.'
              : 'Monitor procurement activities, ensure compliance, and maintain transparency. Comprehensive audit and oversight tools.'}
          </p>
          
          {/* Stats Grid - like front page */}
          <div className="grid grid-cols-2 gap-4 max-w-md">
            {(isGovernment ? [
              { value: '500+', label: 'Tenders Published', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
              { value: '₹200Cr+', label: 'Budget Managed', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
              { value: '1,000+', label: 'Bids Received', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
              { value: '98%', label: 'Success Rate', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
            ] : isCompany ? [
              { value: '2,450+', label: 'Active Tenders', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
              { value: '₹50Cr+', label: 'Contracts Won', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
              { value: '150+', label: 'Successful Bids', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
              { value: '24/7', label: 'Platform Access', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
            ] : [
              { value: '1,500+', label: 'Audits Completed', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
              { value: '₹500Cr+', label: 'Monitored Value', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
              { value: '100%', label: 'Compliance Rate', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
              { value: '50+', label: 'Departments', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5' },
            ]).map((stat, idx) => (
              <StatCard 
                key={idx}
                value={stat.value}
                label={stat.label}
                icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} /></svg>}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Right Side - Form */}
      <div className="flex-1 lg:w-1/2 flex flex-col justify-center p-6 lg:p-16 relative">
        {/* Dark mode gradient background - matching first page */}
        <div className="absolute inset-0 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 pointer-events-none" />
        
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-primary/5 dark:bg-accent-secondary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-accent-primary/5 dark:bg-accent-primary/5 rounded-full blur-3xl" />
        </div>
        
        {/* Back button - Fixed at top left */}
        <button
          onClick={() => setSelectedRole(null)}
          className="absolute top-6 left-6 z-10 flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-all duration-200 font-semibold text-sm tracking-wide"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          BACK
        </button>
        
        <div className="relative max-w-md mx-auto w-full">
          {/* Mobile header - shows on small screens */}
          <div className="lg:hidden mb-8">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${isGovernment ? 'from-purple-500 to-indigo-600' : isCompany ? 'from-emerald-500 to-teal-600' : 'from-rose-500 to-orange-600'} flex items-center justify-center text-white mb-4`}>
              {isGovernment ? (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              ) : isCompany ? (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              ) : (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              )}
            </div>
          </div>

          {/* Form Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-primary/10 dark:bg-accent-secondary/20 mb-6">
              <span className="w-2 h-2 rounded-full bg-accent-primary dark:bg-accent-secondary animate-pulse" />
              <span className="text-sm font-medium text-accent-primary dark:text-accent-secondary">
                Secure Authentication
              </span>
            </div>
            
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Sign in to
              <span className="block">
                <span className={`dark:hidden bg-gradient-to-r ${isGovernment ? 'from-purple-500 to-indigo-600' : isCompany ? 'from-emerald-500 to-teal-600' : 'from-rose-500 to-orange-600'} bg-clip-text text-transparent`}>
                  {isGovernment ? 'Department Portal' : isCompany ? 'Bidder Portal' : 'Authority Portal'}
                </span>
                <span className="hidden dark:inline bg-gradient-to-r from-accent-secondary to-cyan-400 bg-clip-text text-transparent">
                  {isGovernment ? 'Department Portal' : isCompany ? 'Bidder Portal' : 'Authority Portal'}
                </span>
              </span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Enter your credentials to access the dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {isGovernment && (
              <Select
                label="Select Department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                options={DEPARTMENTS}
                placeholder="Choose your department"
                required
              />
            )}

            <Input
              label={isGovernment ? 'Department ID' : isCompany ? 'Company / Bidder ID' : 'Authority Login ID'}
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              placeholder={isGovernment ? 'e.g., PWD-12345' : isCompany ? 'e.g., BID-001' : 'e.g., AUTH-001'}
              required
            />

            {(isCompany || isAuthority) && (
              <Input
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter your password"
                required
              />
            )}

            <Button type="submit" fullWidth className="mt-8 py-4">
              Continue to Dashboard
              <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
            <p className="text-center text-sm text-gray-500 dark:text-gray-500">
              By continuing, you agree to our{' '}
              <a href="#" className="text-accent-primary dark:text-accent-secondary hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-accent-primary dark:text-accent-secondary hover:underline">Privacy Policy</a>
            </p>
          </div>
          
          {/* Help Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Need help?{' '}
              <a href="#" className="text-accent-primary dark:text-accent-secondary font-medium hover:underline">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
