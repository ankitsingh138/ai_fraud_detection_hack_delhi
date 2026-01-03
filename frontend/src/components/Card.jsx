const Card = ({ children, className = '', hover = true, padding = true }) => {
  return (
    <div 
      className={`
        bg-light-card dark:bg-gray-900/80 backdrop-blur-sm
        rounded-xl shadow-lg dark:shadow-xl
        border border-light-border dark:border-gray-800
        transition-all duration-200
        ${hover ? 'hover:shadow-xl dark:hover:shadow-accent-secondary/5 hover:-translate-y-1 dark:hover:border-gray-700' : ''}
        ${padding ? 'p-6' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;

