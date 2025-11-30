'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  children: React.ReactNode;
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
        backgroundColor: 'rgb(42, 42, 42)',
        color: 'rgb(255, 255, 255)',
      },
    },
    secondary: {
      style: {
        backgroundColor: 'transparent',
        color: 'rgb(42, 42, 42)',
        border: '2px solid rgb(42, 42, 42)',
      },
    },
    outline: {
      style: {
        backgroundColor: 'transparent',
        color: 'rgb(42, 42, 42)',
        border: '2px solid rgb(42, 42, 42)',
      },
    },
  };

  const buttonContent = (
    <motion.div
      className={`${baseStyles} ${className}`}
      style={variants[variant].style}
      whileHover={{ 
        scale: 1.05,
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ 
        type: 'spring',
        stiffness: 400,
        damping: 17
      }}
    >
      {/* Shine effect on hover */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
        }}
      />
      <span className="relative z-10">{children}</span>
    </motion.div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block">
        {buttonContent}
      </Link>
    );
  }

  const { disabled, type = 'button', onClick } = props;
  
  return (
    <motion.button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${className}`}
      style={variants[variant].style}
      whileHover={disabled ? {} : { 
        scale: 1.05,
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
      }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      transition={{ 
        type: 'spring',
        stiffness: 400,
        damping: 17
      }}
      disabled={disabled}
      aria-disabled={disabled}
    >
      {/* Shine effect on hover */}
      {!disabled && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
          }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
