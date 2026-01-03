const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  disabled = false,
  fullWidth = false,
  type = 'button',
  className = ''
}) => {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';
  
  const variants = {
    primary: 'bg-accent-primary text-white hover:bg-blue-600 dark:bg-accent-secondary dark:text-gray-900 dark:hover:bg-cyan-400 shadow-lg hover:shadow-xl dark:shadow-accent-secondary/20',
    secondary: 'border-2 border-accent-primary text-accent-primary hover:bg-accent-primary hover:text-white dark:border-accent-secondary dark:text-accent-secondary dark:hover:bg-accent-secondary dark:hover:text-gray-900',
    danger: 'bg-accent-danger text-white hover:bg-red-600 shadow-lg hover:shadow-xl',
    ghost: 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;

