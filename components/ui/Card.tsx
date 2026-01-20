'use client';

import { cn } from '@/lib/utils/cn';
import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { SCALE, TRANSLATE, SPRING_CONFIG } from '@/lib/animations/constants';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'bordered';
  hoverable?: boolean;
}

/**
 * Reusable Card component with consistent styling and optional 3D hover effects
 */
export default function Card({ 
  children,
  className = '',
  padding = 'md',
  variant = 'bordered',
  hoverable = false,
}: CardProps) {
  const paddingClasses = {
    sm: 'p-4 sm:p-5',
    md: 'p-6 sm:p-8',
    lg: 'p-8 sm:p-10',
  };

  const variantClasses = {
    default: 'bg-[var(--cream)] rounded-lg',
    bordered: 'bg-[var(--cream)] rounded-lg border border-[var(--border-light)]',
  };

  if (hoverable) {
    return (
      <motion.div 
        className={cn(variantClasses[variant], paddingClasses[padding], className)}
        whileHover={{ 
          scale: SCALE.CARD_HOVER,
          y: TRANSLATE.LIFT * 2,
          transition: SPRING_CONFIG.QUICK
        }}
        whileTap={{ scale: SCALE.TAP }}
        style={{
          boxShadow: `0 4px 6px -1px var(--shadow-light)`,
        }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={cn(variantClasses[variant], paddingClasses[padding], className)}>
      {children}
    </div>
  );
}


