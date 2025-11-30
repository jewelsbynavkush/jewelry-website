import React from 'react';

interface SectionHeadingProps {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'section';
}

/**
 * Reusable Section Heading component with consistent styling
 */
export default function SectionHeading({ 
  as: Component = 'h1',
  children,
  align = 'center',
  className = '',
  size = 'section',
}: SectionHeadingProps) {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  const sizeClasses = {
    xs: 'text-heading-xs',
    sm: 'text-heading-sm sm:text-heading-md md:text-heading-lg',
    md: 'text-heading-md sm:text-heading-lg md:text-heading-xl',
    lg: 'text-heading-lg sm:text-heading-xl md:text-heading-2xl',
    xl: 'text-heading-xl sm:text-heading-2xl md:text-heading-3xl',
    section: 'font-section-heading',
  };

  const marginClasses = {
    xs: 'mb-3 sm:mb-4',
    sm: 'mb-3 sm:mb-4',
    md: 'mb-4 sm:mb-6',
    lg: 'mb-4 sm:mb-6',
    xl: 'mb-4 sm:mb-6',
    section: 'mb-8 sm:mb-10 md:mb-12',
  };

  const textColor = size === 'section' ? '' : 'text-[#2a2a2a]';
  const fontWeight = size === 'md' || size === 'lg' || size === 'xl' ? 'font-playfair font-bold' : '';

  return (
    <Component 
      className={`${sizeClasses[size]} ${alignClasses[align]} ${textColor} ${fontWeight} ${marginClasses[size]} ${className}`}
    >
      {children}
    </Component>
  );
}

