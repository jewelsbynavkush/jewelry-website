'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ANIMATION_PRESETS, SCALE } from '@/lib/animations/constants';

interface CategoryLinkProps {
  name: string;
  href: string;
  variant?: 'intro' | 'products';
  showArrow?: boolean;
  index?: number;
  total?: number;
}

/**
 * Reusable Category Link component with 3D animations
 * Supports intro and products variants with conditional styling
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

  // Use white border with higher opacity for beige background (products variant)
  // 50% opacity provides better visibility on beige background
  // Use light border for cream background (intro variant)
  const borderColor = isProductsVariant 
    ? 'border-[var(--white-opacity-50)]' 
    : 'border-[var(--border-light)]';
  
  // Products variant: Always show both top and bottom borders for all items
  // This ensures all category links have visible borders on beige background
  // Intro variant: Show top border for first item, bottom border for all except last
  const borderClasses = isProductsVariant
    ? `border-t ${borderColor} border-b ${borderColor}` // Always show both borders for products variant
    : [
        index === 0 ? `border-t ${borderColor}` : '',
        index < total - 1 ? `border-b ${borderColor}` : '',
      ].filter(Boolean).join(' ');
  
  return (
    <motion.div
      whileHover={ANIMATION_PRESETS.MENU_ITEM_HOVER}
      whileTap={ANIMATION_PRESETS.TAP}
    >
      <Link 
        href={href} 
        className={`${baseStyles} ${borderClasses}`}
        aria-label={`View ${name} collection`}
      >
        <motion.span 
          className="relative z-10"
          whileHover={{ scale: SCALE.HOVER }}
        >
          {name}
        </motion.span>
        
        {showArrow && (
          <motion.span 
            className="relative z-10"
            whileHover={{ x: 4 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            →
          </motion.span>
        )}
        {/* Hover background effect */}
        <motion.div
          className="absolute inset-0 bg-[var(--beige)] opacity-0 -z-0"
          whileHover={{ opacity: 0.05 }}
          transition={{ duration: 0.2 }}
        />
      </Link>
    </motion.div>
  );
}
