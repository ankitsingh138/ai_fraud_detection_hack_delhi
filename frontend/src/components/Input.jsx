const Input = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  readOnly = false,
  error,
  className = '',
  id,
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
          {required && <span className="text-accent-danger ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        className={`input-field ${readOnly ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''} ${error ? 'border-accent-danger focus:ring-accent-danger' : ''}`}
      />
      {error && (
        <p className="mt-1 text-sm text-accent-danger">{error}</p>
      )}
    </div>
  );
};

export default Input;

