'use client';

import React from 'react';

interface GradientButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'filled' | 'outline';
  href?: string;
  loading?: boolean;
}

const GradientButton: React.FC<GradientButtonProps> = ({
  children,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  size = 'md',
  variant = 'outline',
  href,
  loading = false,
}) => {
  const baseClasses = `
    relative inline-flex items-center justify-center font-semibold
    rounded-full transition-all duration-300 overflow-hidden
    focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    group
  `;

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const variantClasses = {
    outline: `
      bg-black/10 border-2 border-transparent text-white
      hover:text-white hover:shadow-lg hover:shadow-purple-500/25
      hover:-translate-y-0.5
    `,
    filled: `
      bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600
      text-white border-2 border-transparent
      hover:from-pink-600 hover:via-purple-700 hover:to-blue-700
      hover:shadow-lg hover:shadow-purple-500/25
      hover:-translate-y-0.5
    `,
  };

  const combinedClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${className}
  `;

  const gradientBorderStyle = {
    background: variant === 'outline' 
      ? 'linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1)) padding-box, linear-gradient(135deg, #ec4899, #8b5cf6, #3b82f6) border-box'
      : undefined,
  };

  const LoadingSpinner = () => (
    <svg 
      className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  // Hover fill overlay for outline variant
  const HoverOverlay = () => (
    <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
  );

  const buttonContent = (
    <>
      {variant === 'outline' && <HoverOverlay />}
      <span className="relative z-10 flex items-center justify-center">
        {loading && <LoadingSpinner />}
        {children}
      </span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className={combinedClasses}
        style={gradientBorderStyle}
        onClick={onClick}
      >
        {buttonContent}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={combinedClasses}
      style={gradientBorderStyle}
    >
      {buttonContent}
    </button>
  );
};

export default GradientButton;
