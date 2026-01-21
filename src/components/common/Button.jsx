import React from 'react';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  loading = false,
  className = '',
  fullWidth = false,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-bold transition-all duration-200 active:scale-95 disabled:active:scale-100 disabled:cursor-not-allowed outline-none select-none";
  
  const variants = {
    primary: "bg-toss-blue text-white hover:bg-blue-600 disabled:bg-blue-200",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-300",
    danger: "bg-red-50 text-toss-red hover:bg-red-100 disabled:bg-red-25 disabled:text-red-200",
    ghost: "bg-transparent text-toss-blue hover:bg-blue-50 disabled:bg-transparent disabled:text-blue-200",
    outline: "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:bg-white disabled:text-gray-300"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-lg",
    md: "px-5 py-3 text-sm rounded-xl",
    lg: "px-6 py-4 text-base rounded-[18px]"
  };

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseStyles} 
        ${variants[variant]} 
        ${sizes[size]} 
        ${widthStyle} 
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>처리 중...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
