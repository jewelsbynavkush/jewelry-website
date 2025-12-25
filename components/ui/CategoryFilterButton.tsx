'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import SmoothLink from '@/components/ui/SmoothLink';
import { ANIMATION_3D } from '@/lib/animations/constants';

interface CategoryFilterButtonProps {
  name: string;
  href: string;
  isActive: boolean;
  index?: number;
}

/**
 * Animated category filter button with 3D effects
 */
export default function CategoryFilterButton({ 
  name, 
  href, 
  isActive, 
  index = 0 
}: CategoryFilterButtonProps) {
  // Professional animation: always visible, subtle entrance on scroll
  const ref = useRef<HTMLDivElement>(null);
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: ANIMATION_3D.ENTRY.INITIAL_OPACITY, y: ANIMATION_3D.ENTRY.INITIAL_Y }}
      whileInView={{ opacity: 1, y: 0 }}
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
      <SmoothLink href={href} aria-label={`Filter by ${name}`}>
        <motion.button
          className={`px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-2 rounded-lg font-medium transition-colors text-sm sm:text-base min-h-[44px] flex items-center justify-center ${
            isActive
              ? 'bg-[var(--active-dark)] text-[var(--text-on-beige)]' /* Active state uses dark gray for contrast */
              : 'bg-[var(--beige)] text-[var(--text-on-beige)] hover:bg-[var(--beige-hover)]' /* Standardized hover color */
          }`}
          aria-pressed={isActive}
          whileHover={{ 
            scale: 1.05,
            boxShadow: `0 8px 20px -5px var(--shadow-medium)`,
          }}
          whileTap={{ scale: 0.98 }}
          transition={{ 
            type: 'spring',
            stiffness: 400,
            damping: 17
          }}
        >
          {name}
        </motion.button>
      </SmoothLink>
    </motion.div>
  );
}

