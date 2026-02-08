'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { SCALE, SPRING_CONFIG } from '@/lib/animations/constants';

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'newest';

interface ProductSortProps {
  className?: string;
}

/**
 * Product sorting component for e-commerce
 * 
 * Provides dropdown interface for sorting products by price, name, or date.
 * Updates URL query parameters to maintain sort state across page refreshes.
 * Animations removed for iOS scroll compatibility.
 */
export default function ProductSort({ className = '' }: ProductSortProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sort, setSort] = useState<SortOption>(
    (searchParams.get('sort') as SortOption) || 'default'
  );

  const handleSortChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value as SortOption;
    setSort(newSort);
    
    const params = new URLSearchParams(searchParams.toString());
    if (newSort === 'default') {
      params.delete('sort');
    } else {
      params.set('sort', newSort);
    }
    
    router.push(`/designs?${params.toString()}`);
  };

  return (
    <div className={cn('flex items-center gap-2 sm:gap-3', className)}>
      <motion.label 
        htmlFor="sort" 
        className="text-[var(--text-secondary)] text-body-sm sm:text-body-base font-medium whitespace-nowrap"
        whileHover={{ scale: SCALE.HOVER }}
      >
        Sort by:
      </motion.label>
      <motion.div 
        className="relative"
        whileHover={{ scale: SCALE.CARD_HOVER }}
        whileTap={{ scale: SCALE.TAP }}
      >
        <motion.select
          id="sort"
          value={sort}
          onChange={handleSortChange}
          className="appearance-none px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-2 rounded-lg font-medium text-body-sm sm:text-body-base min-h-[44px] touch-target bg-[var(--beige)] text-[var(--text-on-beige)] hover:bg-[var(--beige-hover)] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--beige-hover)] focus:ring-offset-2 pr-8 sm:pr-10"
          aria-label="Sort products"
          style={{
            // Dropdown arrow: white to match var(--text-on-beige) on beige background
            // CSS variables cannot be used in data URLs; hex is the design-system equivalent
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 0.75rem center',
            backgroundSize: '12px',
          }}
          whileFocus={{ scale: SCALE.HOVER }}
          transition={SPRING_CONFIG.QUICK}
        >
          <option value="default" className="bg-[var(--beige)] text-[var(--text-on-beige)]">Default</option>
          <option value="price-asc" className="bg-[var(--beige)] text-[var(--text-on-beige)]">Price: Low to High</option>
          <option value="price-desc" className="bg-[var(--beige)] text-[var(--text-on-beige)]">Price: High to Low</option>
          <option value="name-asc" className="bg-[var(--beige)] text-[var(--text-on-beige)]">Name: A to Z</option>
          <option value="name-desc" className="bg-[var(--beige)] text-[var(--text-on-beige)]">Name: Z to A</option>
          <option value="newest" className="bg-[var(--beige)] text-[var(--text-on-beige)]">Newest First</option>
        </motion.select>
      </motion.div>
    </div>
  );
}
