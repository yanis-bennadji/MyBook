import React from 'react';

/**
 * ! Button Component
 * A reusable button component with customizable styles and behavior.
 * Supports different variants through className props.
 * 
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Button content
 * @param {Function} props.onClick - Click handler function
 * @param {string} props.type - Button type (button, submit, reset)
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.className - Additional CSS classes
 */
const Button = ({ children, onClick, type = 'button', disabled = false, className = '' }) => {
  /**
   * * Base Styles
   * Core styling applied to all button variants
   */
  const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  /**
   * ? Variant Style Resolver
   * Determines additional styles based on className props
   * @returns {string} CSS classes for the specific variant
   */
  const getVariantStyles = () => {
    if (className.includes('bg-[#0F3D3E]')) {
      // Primary button (dark teal)
      return 'bg-[#0F3D3E] text-white hover:bg-[#0F3D3E]/90 focus:ring-[#0F3D3E]';
    } else if (className.includes('bg-gray-100')) {
      // Secondary/ghost button
      return 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-300';
    } else if (className.includes('bg-red-')) {
      // Danger/alert button
      return 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500';
    }
    return '';
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${getVariantStyles()} ${className} ${
        disabled ? 'opacity-50 cursor-not-allowed hover:scale-100' : ''
      }`}
    >
      {children}
    </button>
  );
};

export default Button;