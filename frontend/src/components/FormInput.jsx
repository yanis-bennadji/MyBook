import React, { useState } from 'react';

const FormInput = ({ 
  label, 
  type = 'text', 
  name, 
  value, 
  onChange, 
  required = false, 
  placeholder,
  error 
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="mb-6 animate-fade-in">
      <label 
        htmlFor={name}
        className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
          isFocused ? 'text-[#FFB100]' : 'text-[#0F3D3E]'
        }`}
      >
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={value ? '' : placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 ${
            error 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
              : 'border-[#0F3D3E]/20 focus:border-[#FFB100] focus:ring-[#FFB100]/20'
          } focus:outline-none focus:ring-2`}
        />
        {error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-shake">
            <svg 
              className="w-5 h-5 text-red-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-500 animate-slide-in">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormInput; 