'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, ChangeEvent } from 'react';
import { cn } from '@/lib/utils/cn';

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'newest';

interface ProductSortProps {
  className?: string;
}

/**
 * Product sorting component for e-commerce (animations removed for iOS scroll compatibility)
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
      <label 
        htmlFor="sort" 
        className="text-[var(--text-secondary)] text-body-sm sm:text-body-base font-medium whitespace-nowrap"
      >
        Sort by:
      </label>
      <div className="relative">
        <select
          id="sort"
          value={sort}
          onChange={handleSortChange}
          className="appearance-none px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-2 rounded-lg font-medium text-body-sm sm:text-body-base min-h-[44px] touch-target bg-[var(--beige)] text-[var(--text-on-beige)] hover:bg-[var(--beige-hover)] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--beige-hover)] focus:ring-offset-2 pr-8 sm:pr-10"
          aria-label="Sort products"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 0.75rem center',
            backgroundSize: '12px',
          }}
        >
          <option value="default" className="bg-[var(--beige)] text-[var(--text-on-beige)]">Default</option>
          <option value="price-asc" className="bg-[var(--beige)] text-[var(--text-on-beige)]">Price: Low to High</option>
          <option value="price-desc" className="bg-[var(--beige)] text-[var(--text-on-beige)]">Price: High to Low</option>
          <option value="name-asc" className="bg-[var(--beige)] text-[var(--text-on-beige)]">Name: A to Z</option>
          <option value="name-desc" className="bg-[var(--beige)] text-[var(--text-on-beige)]">Name: Z to A</option>
          <option value="newest" className="bg-[var(--beige)] text-[var(--text-on-beige)]">Newest First</option>
        </select>
      </div>
    </div>
  );
}
