'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ 
        duration: ANIMATION_3D.ENTRY.DURATION, 
        delay: index * 0.1,
        ease: ANIMATION_3D.ENTRY.EASE
      }}
    >
      <Link href={href} aria-label={`Filter by ${name}`}>
        <motion.button
          className={`px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-2 rounded-lg font-medium transition-colors text-sm sm:text-base min-h-[44px] flex items-center justify-center ${
            isActive
              ? 'bg-[#4a4a4a] text-white'
              : 'bg-[#CCC4BA] text-white hover:bg-[#b8afa3]'
          }`}
          aria-pressed={isActive}
          whileHover={{ 
            scale: 1.05,
            boxShadow: '0 8px 20px -5px rgba(0, 0, 0, 0.25)',
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
      </Link>
    </motion.div>
  );
}

