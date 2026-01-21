import React from 'react';

const Input = ({
  label,
  error,
  type = 'text',
  value,
  onChange,
  placeholder,
  className = '',
  containerClassName = '',
  id,
  helperText,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`}>
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-bold text-toss-dark ml-0.5"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`
            w-full p-4 bg-toss-grey rounded-xl outline-none 
            transition-all duration-200
            placeholder:text-gray-400
            focus:ring-2 focus:ring-toss-blue/50
            border border-transparent
            ${error ? 'border-red-200 bg-red-25' : 'hover:bg-gray-100'}
            ${className}
          `}
          {...props}
        />
      </div>

      {(error || helperText) && (
        <div className="mt-1 ml-0.5">
          {error ? (
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-red-50 text-red-600 text-[11px] font-bold">
              {error}
            </div>
          ) : (
            <span className="text-[11px] font-bold text-gray-400">{helperText}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default Input;
