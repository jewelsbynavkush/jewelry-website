import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'bordered';
}

/**
 * Reusable Card component with consistent styling
 */
export default function Card({ 
  children,
  className = '',
  padding = 'md',
  variant = 'bordered',
}: CardProps) {
  const paddingClasses = {
    sm: 'p-4 sm:p-5',
    md: 'p-6 sm:p-8',
    lg: 'p-8 sm:p-10',
  };

  const variantClasses = {
    default: 'bg-[#faf8f5] rounded-lg',
    bordered: 'bg-[#faf8f5] rounded-lg border border-[#e8e5e0]',
  };

  return (
    <div className={`${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
}

