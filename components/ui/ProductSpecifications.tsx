'use client';

import { ReactNode } from 'react';
import { Product } from '@/types/data';
import SmoothLink from './SmoothLink';
import { formatPrice, getStockStatus } from '@/lib/utils/price-formatting';

interface ProductSpecificationsProps {
  product: Product;
}

/**
 * Product specifications component
 * Displays detailed product information for e-commerce
 */
export default function ProductSpecifications({ product }: ProductSpecificationsProps) {
  const specifications = [
    product.material && {
      label: 'Material',
      value: product.material,
    },
    product.category && {
      label: 'Category',
      value: (
        <SmoothLink
          href={`/designs?category=${product.category}`}
          className="text-[var(--text-secondary)] hover:text-[var(--text-on-cream)]"
        >
          {product.category}
        </SmoothLink>
      ),
    },
    product.price && {
      label: 'Price',
      value: formatPrice(product.price),
    },
    {
      label: 'Availability',
      value: (() => {
        const stockStatus = getStockStatus(product.inStock);
        return (
          <span className={`${stockStatus.color} font-medium`} aria-label={stockStatus.ariaLabel}>
            {stockStatus.text}
          </span>
        );
      })(),
    },
    {
      label: 'SKU',
      value: product.id,
    },
  ].filter(Boolean) as Array<{ label: string; value: string | ReactNode }>;

  return (
    <div className="standard-space-y-small">
      <h3 className="text-[var(--text-on-cream)] text-body-lg sm:text-heading-sm font-bold font-playfair">
        Product Specifications
      </h3>
      <dl className="grid grid-cols-1 sm:grid-cols-2 standard-gap-small">
        {specifications.map((spec, index) => (
          <div key={index} className="border-b border-[var(--border-light)] pb-2 sm:pb-3">
            <dt className="text-[var(--text-secondary)] text-body-sm sm:text-body-base font-medium mb-1">
              {spec.label}
            </dt>
            <dd className="text-[var(--text-on-cream)] text-body-sm sm:text-body-base">
              {spec.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

