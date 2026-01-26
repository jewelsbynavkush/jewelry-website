'use client';

/**
 * Cart Item Component
 * 
 * Displays individual cart item with:
 * - Product image, title, price
 * - Quantity selector
 * - Remove button
 * - Stock status
 */

import { useState } from 'react';
import Image from 'next/image';
import { CartItem as CartItemType } from '@/lib/store/cart-store';
import { formatPrice } from '@/lib/utils/price-formatting';
import { useCartStore } from '@/lib/store/cart-store';
import { ECOMMERCE } from '@/lib/constants';

interface CartItemProps {
  item: CartItemType;
  currency?: string; // Cart currency for consistent formatting
}

export default function CartItem({ item, currency = ECOMMERCE.currency }: CartItemProps) {
  const { updateQuantity, removeItem, isLoading } = useCartStore();
  const [localQuantity, setLocalQuantity] = useState(item.quantity);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) {
      await removeItem(item.productId);
      return;
    }

    if (newQuantity > 100) {
      return; // Max quantity limit
    }

    setLocalQuantity(newQuantity);
    setIsUpdating(true);

    const response = await updateQuantity(item.productId, newQuantity);

    if (!response.success) {
      // Revert on error
      setLocalQuantity(item.quantity);
      // Show error toast for better UX
      const { showToast } = await import('@/components/ui/Toast');
      showToast(response.error || 'Failed to update quantity', 'error', 4000);
    } else {
      // Show success feedback for quantity updates
      const { showToast } = await import('@/components/ui/Toast');
      showToast('Cart updated', 'success', 2000);
    }

    setIsUpdating(false);
  };

  const handleRemove = async () => {
    const response = await removeItem(item.productId);
    if (response.success) {
      // Show success feedback
      const { showToast } = await import('@/components/ui/Toast');
      showToast(`${item.title} removed from cart`, 'success', 2000);
    }
  };

  return (
    <div className="flex gap-4 sm:gap-6 p-4 sm:p-6 border-b border-[var(--border-light)] last:border-b-0">
      {/* Product Image */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
        <Image
          src={item.image || '/images/placeholder.png'}
          alt={`${item.title} - ${item.sku} - Handcrafted jewelry piece in shopping cart`}
          fill
          className="object-cover rounded"
          sizes="(max-width: 640px) 80px, 96px"
        />
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-[var(--text-on-cream)] font-medium text-base sm:text-lg mb-1">
              {item.title}
            </h3>
            <p className="text-[var(--text-secondary)] text-sm mb-2">
              SKU: {item.sku}
            </p>
            <p className="text-[var(--text-on-cream)] font-semibold text-lg sm:text-xl">
              {formatPrice(item.price, { currencyCode: currency })}
            </p>
          </div>

          {/* Remove Button */}
          <button
            onClick={handleRemove}
            disabled={isLoading || isUpdating}
            className="text-[var(--text-secondary)] hover:text-[var(--error-text)] transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 touch-target"
            aria-label={`Remove ${item.title} from cart`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Quantity Selector */}
        <div className="mt-4 flex items-center gap-4">
          <label className="text-[var(--text-secondary)] text-sm">Quantity:</label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleQuantityChange(localQuantity - 1)}
              disabled={isLoading || isUpdating || localQuantity <= 1}
              className="w-10 h-10 flex items-center justify-center border border-[var(--border-light)] rounded-lg bg-[var(--cream)] text-[var(--text-on-cream)] hover:bg-[var(--beige)] hover:text-[var(--text-on-beige)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <input
              type="number"
              id={`quantity-${item.productId}`}
              min={1}
              max={100}
              value={localQuantity}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                if (!isNaN(value) && value >= 1 && value <= 100) {
                  handleQuantityChange(value);
                }
              }}
              disabled={isLoading || isUpdating}
              className="w-16 h-10 text-center border border-[var(--border-light)] rounded-lg bg-[var(--cream)] text-[var(--text-on-cream)] font-medium focus:outline-none focus:border-[var(--beige)] disabled:opacity-50"
              aria-label={`Quantity for ${item.title}`}
            />
            <button
              type="button"
              onClick={() => handleQuantityChange(localQuantity + 1)}
              disabled={isLoading || isUpdating || localQuantity >= 100}
              className="w-10 h-10 flex items-center justify-center border border-[var(--border-light)] rounded-lg bg-[var(--cream)] text-[var(--text-on-cream)] hover:bg-[var(--beige)] hover:text-[var(--text-on-beige)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <div className="ml-auto text-[var(--text-on-cream)] font-medium">
            {formatPrice(item.subtotal, { currencyCode: currency })}
          </div>
        </div>
      </div>
    </div>
  );
}
