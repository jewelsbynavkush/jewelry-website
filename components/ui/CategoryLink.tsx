'use client';

import Link from 'next/link';

interface CategoryLinkProps {
  name: string;
  href: string;
  variant?: 'intro' | 'products';
  showArrow?: boolean;
  index?: number;
  total?: number;
}

/**
 * Reusable Category Link component
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

  const borderStyle = {
    borderTop: index === 0 ? '1px solid var(--border-light)' : 'none',
    borderBottom: index < total - 1 ? '1px solid var(--border-light)' : 'none',
  };
  
  return (
    <div>
      <Link 
        href={href} 
        className={baseStyles} 
        style={borderStyle}
        aria-label={`View ${name} collection`}
      >
        <span className="relative z-10">
          {name}
        </span>
        
        {showArrow && (
          <span className="relative z-10">
            →
          </span>
        )}
      </Link>
    </div>
  );
}
