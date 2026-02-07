'use client';

import SmoothLink from './SmoothLink';
import { formatPrice } from '@/lib/utils/price-formatting';
import { ECOMMERCE } from '@/lib/constants';

/**
 * Trust badges component for e-commerce credibility
 * Displays security, shipping, and guarantee information
 */
export default function TrustBadges() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 py-4 sm:py-6 border-t border-[var(--border-light)]">
      <div className="flex items-center gap-2 text-[var(--text-secondary)] text-body-xs sm:text-body-sm">
        <svg
          className="w-5 h-5 text-[var(--accent-success)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
        <span>Secure Checkout</span>
      </div>
      <div className="flex items-center gap-2 text-[var(--text-secondary)] text-body-xs sm:text-body-sm">
        <svg
          className="w-5 h-5 text-[var(--accent-info)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
        <span>Free Shipping Over {formatPrice(ECOMMERCE.freeShippingThreshold, { currencyCode: ECOMMERCE.currency })}</span>
      </div>
      <div className="flex items-center gap-2 text-[var(--text-secondary)] text-body-xs sm:text-body-sm">
        <svg
          className="w-5 h-5 text-[var(--accent-info)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        <SmoothLink href="/shipping" className="hover:text-[var(--text-on-cream)]">
          30-Day Returns
        </SmoothLink>
      </div>
      <div className="flex items-center gap-2 text-[var(--text-secondary)] text-body-xs sm:text-body-sm">
        <svg
          className="w-5 h-5 text-[var(--accent-warning)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>Lifetime Warranty</span>
      </div>
    </div>
  );
}

