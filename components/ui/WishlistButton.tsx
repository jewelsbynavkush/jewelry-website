'use client';

import { useState, useEffect } from 'react';
import Button from './Button';
import { showToast } from './Toast';
import { Product } from '@/types/data';
import { useAuthStore } from '@/lib/store/auth-store';
import { useWishlistStore } from '@/lib/store/wishlist-store';

interface WishlistButtonProps {
  product: Product;
  className?: string;
}

export default function WishlistButton({
  product,
  className = '',
}: WishlistButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const {
    fetched,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  } = useWishlistStore();

  useEffect(() => {
    if (isAuthenticated && !fetched) {
      fetchWishlist();
    }
  }, [isAuthenticated, fetched, fetchWishlist]);

  const inWishlist = isInWishlist(product.id);

  const handleWishlist = async () => {
    if (isAdding) return;

    if (!isAuthenticated) {
      showToast('Sign in to save items to your wishlist', 'info', 3000);
      return;
    }

    setIsAdding(true);
    try {
      if (inWishlist) {
        const response = await removeFromWishlist(product.id);
        if (response.success) {
          showToast(`${product.title} removed from wishlist`, 'info', 3000);
        } else {
          showToast(response.error || 'Failed to remove from wishlist', 'error', 4000);
        }
      } else {
        const response = await addToWishlist(product.id);
        if (response.success) {
          showToast(`${product.title} added to wishlist`, 'info', 3000);
        } else {
          showToast(response.error || 'Failed to add to wishlist', 'error', 4000);
        }
      }
    } catch {
      showToast('Failed to update wishlist. Please try again.', 'error', 4000);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Button
      onClick={handleWishlist}
      variant="outline"
      className={`w-full sm:w-auto min-h-[44px] ${className}`}
      disabled={isAdding}
      aria-label={
        inWishlist
          ? `Remove ${product.title} from wishlist`
          : `Add ${product.title} to wishlist`
      }
      aria-pressed={inWishlist}
    >
      {isAdding ? '...' : inWishlist ? '✓ WISHLISTED' : 'WISHLIST'}
    </Button>
  );
}
