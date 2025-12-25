'use client';

import { ReactNode, ButtonHTMLAttributes } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  children: ReactNode;
  href?: string;
}

/**
 * Reusable Button component with variants (primary, secondary, outline)
 * Can render as button or link based on href prop
 */
export default function Button({ 
  variant = 'primary', 
  children, 
  className = '',
  href,
  ...props 
}: ButtonProps) {
  const baseStyles = 'inline-block px-6 sm:px-7 md:px-8 py-2.5 sm:py-3 rounded-full text-button transition-colors min-h-[44px] flex items-center justify-center text-center relative overflow-hidden';
  
  const variants = {
    primary: {
      style: {
        backgroundColor: 'var(--active-dark)',
        color: 'var(--text-on-beige)',
      },
    },
    secondary: {
      style: {
        backgroundColor: 'transparent',
        color: 'var(--text-on-cream)',
        border: '2px solid var(--text-on-cream)',
      },
    },
    outline: {
      style: {
        backgroundColor: 'transparent',
        color: 'var(--text-on-cream)',
        border: '2px solid var(--text-on-cream)',
      },
    },
  };

  if (href) {
    return (
      <Link href={href} className={cn(baseStyles, className)} style={variants[variant].style}>
        {children}
      </Link>
    );
  }

  const { disabled, type = 'button', onClick } = props;
  
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(baseStyles, className)}
      style={variants[variant].style}
      disabled={disabled}
      aria-disabled={disabled}
    >
      {children}
    </button>
  );
}
