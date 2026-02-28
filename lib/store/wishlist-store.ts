'use client';

/**
 * Wishlist Store (Zustand)
 *
 * Persists wishlist product IDs for authenticated users via API.
 */

import { create } from 'zustand';
import { apiGet, apiPost, apiDelete, ApiResponse } from '@/lib/api/client';
import type { GetWishlistResponse, WishlistResponse } from '@/types/api';

interface WishlistState {
  productIds: string[];
  isLoading: boolean;
  fetched: boolean;

  fetchWishlist: () => Promise<void>;
  addToWishlist: (productId: string) => Promise<ApiResponse<WishlistResponse>>;
  removeFromWishlist: (productId: string) => Promise<ApiResponse<WishlistResponse>>;
  isInWishlist: (productId: string) => boolean;
  reset: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  productIds: [],
  isLoading: false,
  fetched: false,

  fetchWishlist: async () => {
    set({ isLoading: true });
    try {
      const response = await apiGet<GetWishlistResponse>('/api/wishlist');
      if (response.success && response.data) {
        set({ productIds: response.data.productIds || [], fetched: true });
      } else {
        set({ productIds: [], fetched: true });
      }
    } catch {
      set({ productIds: [], fetched: true });
    } finally {
      set({ isLoading: false });
    }
  },

  addToWishlist: async (productId: string) => {
    const response = await apiPost<WishlistResponse>('/api/wishlist', { productId });
    if (response.success && response.data?.productIds) {
      set({ productIds: response.data.productIds });
    }
    return response;
  },

  removeFromWishlist: async (productId: string) => {
    const response = await apiDelete<WishlistResponse>(`/api/wishlist/${productId}`);
    if (response.success && response.data?.productIds) {
      set({ productIds: response.data.productIds });
    }
    return response;
  },

  isInWishlist: (productId: string) => {
    return get().productIds.includes(productId);
  },

  reset: () => set({ productIds: [], fetched: false }),
}));
