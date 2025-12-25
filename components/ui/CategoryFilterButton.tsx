'use client';

import SmoothLink from '@/components/ui/SmoothLink';

interface CategoryFilterButtonProps {
  name: string;
  href: string;
  isActive: boolean;
}

/**
 * Category filter button component (animations removed for iOS scroll compatibility)
 */
export default function CategoryFilterButton({ 
  name, 
  href, 
  isActive
}: CategoryFilterButtonProps) {
  return (
    <div>
      <SmoothLink href={href} aria-label={`Filter by ${name}`}>
        <button
          className={`px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-2 rounded-lg font-medium transition-colors text-sm sm:text-base min-h-[44px] flex items-center justify-center ${
            isActive
              ? 'bg-[var(--active-dark)] text-[var(--text-on-beige)]'
              : 'bg-[var(--beige)] text-[var(--text-on-beige)] hover:bg-[var(--beige-hover)]'
          }`}
          aria-pressed={isActive}
        >
          {name}
        </button>
      </SmoothLink>
    </div>
  );
}
