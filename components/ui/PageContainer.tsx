import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';
  className?: string;
}

/**
 * Reusable Page Container component with consistent layout
 */
export default function PageContainer({ 
  children,
  maxWidth = 'full',
  className = '',
}: PageContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    full: '',
  };

  return (
    <div className="bg-[#faf8f5] min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 lg:py-24">
        {maxWidth !== 'full' ? (
          <div className={`${maxWidthClasses[maxWidth]} mx-auto ${className}`}>
            {children}
          </div>
        ) : (
          <div className={className}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

