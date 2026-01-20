'use client';

import { useState } from 'react';
import Button from './Button';
import { showToast } from './Toast';
import { getStockStatus } from '@/lib/utils/price-formatting';
import { Product } from '@/types/data';
import { useCartStore } from '@/lib/store/cart-store';

interface AddToCartButtonProps {
  product: Product;
  quantity?: number;
  className?: string;
}

/**
 * Add to Cart Button Component
 * E-commerce best practice: Provides user feedback and handles stock status
 */
export default function AddToCartButton({ 
  product, 
  quantity = 1,
  className = '' 
}: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const { addItem, isLoading } = useCartStore();
  const stockStatus = getStockStatus(product.inStock);

  const handleAddToCart = async () => {
    if (!stockStatus.available || isAdding || isLoading) return;

    if (!product.id && !product.slug) {
      showToast('Product information is missing', 'error', 3000);
      return;
    }

    setIsAdding(true);

    try {
      const productId = product.id || product.slug;
      const response = await addItem(productId, quantity);

      if (response.success) {
        showToast(
          `${product.title} added to cart${quantity > 1 ? ` (${quantity})` : ''}`,
          'success',
          3000
        );
      } else {
        showToast(
          response.error || 'Failed to add item to cart. Please try again.',
          'error',
          4000
        );
      }
    } catch {
      showToast(
        'Failed to add item to cart. Please try again.',
        'error',
        4000
      );
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Button
      onClick={handleAddToCart}
      className={`w-full sm:flex-1 min-h-[44px] ${className}`}
      disabled={!stockStatus.available || isAdding || isLoading}
      aria-label={
        stockStatus.available
          ? isAdding
            ? `Adding ${product.title} to cart...`
            : `Add ${product.title} to cart`
          : `${product.title} is out of stock`
      }
      aria-disabled={!stockStatus.available || isAdding}
    >
      {isAdding
        ? 'ADDING...'
        : stockStatus.available
        ? 'ADD TO CART'
        : 'OUT OF STOCK'}
    </Button>
  );
}
