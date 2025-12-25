'use client';

import { ReactNode, ButtonHTMLAttributes } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  children: ReactNode;
  href?: string;
}

/**
 * Reusable Button component with professional 3D hover effects
 */
export default function Button({ 
  variant = 'primary', 
  children, 
  className = '',
  href,
  ...props 
}: ButtonProps) {
  const baseStyles = 'inline-block px-6 sm:px-7 md:px-8 py-2.5 sm:py-3 rounded-full text-button transition-all min-h-[44px] flex items-center justify-center text-center relative overflow-hidden';
  
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

  const buttonProps = {
    className: cn(baseStyles, className),
    style: variants[variant].style,
    whileHover: { 
      scale: 1.05,
      boxShadow: `0 10px 25px -5px var(--shadow-dark)`,
    },
    whileTap: { scale: 0.98 },
    transition: { 
      type: 'spring' as const,
      stiffness: 400,
      damping: 17
    },
  };

  const shineEffect = (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      initial={{ x: '-100%' }}
      whileHover={{ x: '100%' }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      style={{
        background: `linear-gradient(90deg, transparent, var(--white-opacity-30), transparent)`,
      }}
    />
  );

  if (href) {
    return (
      <Link href={href} className="inline-block">
        <motion.div {...buttonProps}>
          {shineEffect}
          <span className="relative z-10">{children}</span>
        </motion.div>
      </Link>
    );
  }

  const { disabled, type = 'button', onClick } = props;
  
  return (
    <motion.button
      type={type}
      onClick={onClick}
      {...buttonProps}
      whileHover={disabled ? {} : buttonProps.whileHover}
      whileTap={disabled ? {} : buttonProps.whileTap}
      disabled={disabled}
      aria-disabled={disabled}
    >
      {!disabled && shineEffect}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
