'use client';

import { ReactNode, ButtonHTMLAttributes, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { DURATION, OPACITY, EASING, ANIMATION_PRESETS } from '@/lib/animations/constants';

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
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  
  const baseStyles = 'inline-block px-6 sm:px-7 md:px-8 py-2.5 sm:py-3 rounded-full text-button min-h-[44px] flex items-center justify-center text-center relative overflow-hidden cursor-pointer disabled:cursor-not-allowed';
  
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

  const buttonContent = (
    <>
      {/* Shine effect on hover */}
      {isHovered && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ x: '-100%', opacity: 0 }}
          animate={{ x: '100%', opacity: [0, OPACITY.SHINE, 0] }}
          transition={{
            duration: DURATION.SHINE,
            ease: EASING.EASE_IN_OUT,
          }}
          style={{
            background: `linear-gradient(90deg, transparent 0%, var(--white-opacity-40) 50%, transparent 100%)`,
          }}
        />
      )}
      {/* Ripple effect on click */}
      {isPressed && (
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-full"
          initial={{ scale: 0, opacity: OPACITY.RIPPLE }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: DURATION.SCALE * 2 }}
          style={{
            background: `radial-gradient(circle, var(--white-opacity-30) 0%, transparent 70%)`,
          }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </>
  );

  if (href) {
    return (
      <motion.div
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onTapStart={() => setIsPressed(true)}
        onTap={() => setIsPressed(false)}
        onTapCancel={() => setIsPressed(false)}
        whileHover={ANIMATION_PRESETS.HOVER}
        whileTap={ANIMATION_PRESETS.TAP}
      >
        <Link 
          href={href} 
          className={cn(baseStyles, className)} 
          style={variants[variant].style}
        >
          {buttonContent}
        </Link>
      </motion.div>
    );
  }

  const { disabled, type = 'button', onClick } = props;
  
  return (
    <motion.button
      type={type}
      onClick={onClick}
      className={cn(baseStyles, className)}
      style={variants[variant].style}
      disabled={disabled}
      aria-disabled={disabled}
      onHoverStart={() => !disabled && setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onMouseDown={() => !disabled && setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => {
        setIsPressed(false);
        setIsHovered(false);
      }}
      whileHover={!disabled ? ANIMATION_PRESETS.HOVER : {}}
      whileTap={!disabled ? ANIMATION_PRESETS.TAP : {}}
    >
      {buttonContent}
    </motion.button>
  );
}
