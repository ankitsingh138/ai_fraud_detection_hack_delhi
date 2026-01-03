const Tabs = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="border-b border-light-border dark:border-dark-border mb-6">
      <nav className="flex gap-4 -mb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              py-4 px-2 font-medium text-sm transition-all duration-200
              border-b-2 
              ${activeTab === tab.id 
                ? 'border-accent-primary dark:border-accent-secondary text-accent-primary dark:text-accent-secondary' 
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Tabs;

