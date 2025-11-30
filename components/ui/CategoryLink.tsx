'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { COLORS } from '@/lib/constants';

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
    ? 'flex items-center justify-between text-white hover:text-[#f5f1eb] transition-colors w-full py-3 sm:py-3.5 md:py-4 lg:py-5 uppercase text-heading-sm min-h-[44px] sm:min-h-[48px] relative overflow-hidden'
    : 'flex items-center justify-between text-white hover:text-[#f5f1eb] transition-colors w-full py-2.5 sm:py-3 md:py-3.5 lg:py-4 uppercase text-category-link min-h-[44px] relative overflow-hidden';

  const borderStyle = {
    borderTop: index === 0 ? `1px solid ${COLORS.borderLight}` : 'none',
    borderBottom: index < total - 1 ? `1px solid ${COLORS.borderLight}` : 'none',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: [0.25, 0.1, 0.25, 1]
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
            background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
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
