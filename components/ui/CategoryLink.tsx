'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRef } from 'react';
import { COLORS } from '@/lib/constants';
import { ANIMATION_3D } from '@/lib/animations/constants';

interface CategoryLinkProps {
  name: string;
  href: string;
  variant?: 'intro' | 'products';
  showArrow?: boolean;
  index?: number;
  total?: number;
}

/**
 * Reusable Category Link component with professional hover animations
 */
export default function CategoryLink({
  name,
  href,
  variant = 'intro',
  showArrow = true,
  index = 0,
  total = 0,
}: CategoryLinkProps) {
  const isProductsVariant = variant === 'products';
  
  const baseStyles = isProductsVariant
    ? 'flex items-center justify-between text-[var(--text-on-beige)] hover:text-[var(--text-on-beige-hover)] transition-colors w-full py-3 sm:py-3.5 md:py-4 lg:py-5 uppercase text-heading-sm min-h-[44px] sm:min-h-[48px] relative overflow-hidden'
    : 'flex items-center justify-between text-[var(--text-on-beige)] hover:text-[var(--text-on-beige-hover)] transition-colors w-full py-2.5 sm:py-3 md:py-3.5 lg:py-4 uppercase text-category-link min-h-[44px] relative overflow-hidden';

  const borderStyle = {
    borderTop: index === 0 ? `1px solid ${COLORS.borderLight}` : 'none',
    borderBottom: index < total - 1 ? `1px solid ${COLORS.borderLight}` : 'none',
  };

  // Professional animation: always visible, subtle entrance on scroll
  const ref = useRef<HTMLDivElement>(null);
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: ANIMATION_3D.ENTRY.INITIAL_OPACITY, x: -ANIMATION_3D.ENTRY.INITIAL_Y }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ 
        once: ANIMATION_3D.VIEWPORT.ONCE, 
        margin: ANIMATION_3D.VIEWPORT.MARGIN,
        amount: ANIMATION_3D.VIEWPORT.AMOUNT 
      }}
      transition={{ 
        duration: ANIMATION_3D.ENTRY.DURATION, 
        delay: index * ANIMATION_3D.STAGGER.SECTION,
        ease: ANIMATION_3D.ENTRY.EASE,
        type: 'tween' as const,
      }}
    >
      <Link 
        href={href} 
        className={baseStyles} 
        style={borderStyle}
        aria-label={`View ${name} collection`}
      >
        {/* Hover background effect */}
        <motion.div
          className="absolute inset-0 z-0"
          initial={{ x: '-100%' }}
          whileHover={{ x: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{
            background: `linear-gradient(90deg, var(--white-opacity-20), var(--white-opacity-30))`,
          }}
        />
        
        {/* Content */}
        <motion.span 
          className="relative z-10"
          whileHover={{ x: 5 }}
          transition={{ duration: 0.2 }}
        >
          {name}
        </motion.span>
        
        {showArrow && (
          <motion.span 
            className="relative z-10"
            whileHover={{ x: 5, scale: 1.2 }}
            transition={{ duration: 0.2 }}
          >
            →
          </motion.span>
        )}
      </Link>
    </motion.div>
  );
}
