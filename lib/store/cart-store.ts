'use client';

/**
 * Cart Store (Zustand)
 * 
 * Manages shopping cart state:
 * - Cart items
 * - Totals calculation
 * - Guest and authenticated cart support
 * - API integration
 */

import { create } from 'zustand';
import { apiGet, apiPost, apiPatch, apiDelete, ApiResponse } from '@/lib/api/client';
import { ECOMMERCE } from '@/lib/constants';

export interface CartItem {
  productId: string;
  sku: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
}

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity: number) => Promise<ApiResponse>;
  updateQuantity: (productId: string, quantity: number) => Promise<ApiResponse>;
  removeItem: (productId: string) => Promise<ApiResponse>;
  clearCart: () => Promise<ApiResponse>;
  refreshCart: () => Promise<void>;
  clearError: () => void;
}

const initialCart: Cart = {
  items: [],
  subtotal: 0,
  tax: 0,
  shipping: 0,
  discount: 0,
  total: 0,
  currency: ECOMMERCE.currency,
};

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isLoading: false,
  error: null,

  fetchCart: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await apiGet<{ cart: Cart }>('/api/cart');
      
      if (response.success && response.data) {
        set({
          cart: response.data.cart,
          isLoading: false,
        });
      } else {
        set({
          cart: initialCart,
          isLoading: false,
          error: response.error || 'Failed to load cart',
        });
      }
    } catch (error) {
      set({
        cart: initialCart,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load cart',
      });
    }
  },

  addItem: async (productId: string, quantity: number) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await apiPost<{ cart: Cart }>('/api/cart', {
        productId,
        quantity,
      });
      
      if (response.success && response.data) {
        set({
          cart: response.data.cart,
          isLoading: false,
        });
      } else {
        set({
          isLoading: false,
          error: response.error || 'Failed to add item to cart',
        });
      }
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add item to cart';
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  updateQuantity: async (productId: string, quantity: number) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await apiPatch<{ cart: Cart }>(`/api/cart/${productId}`, {
        quantity,
      });
      
      if (response.success && response.data) {
        set({
          cart: response.data.cart,
          isLoading: false,
        });
      } else {
        set({
          isLoading: false,
          error: response.error || 'Failed to update quantity',
        });
      }
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update quantity';
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  removeItem: async (productId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await apiDelete<{ cart: Cart }>(`/api/cart/${productId}`);
      
      if (response.success && response.data) {
        set({
          cart: response.data.cart,
          isLoading: false,
        });
      } else {
        set({
          isLoading: false,
          error: response.error || 'Failed to remove item',
        });
      }
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove item';
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  clearCart: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await apiDelete<{ cart: Cart }>('/api/cart');
      
      if (response.success && response.data) {
        set({
          cart: response.data.cart,
          isLoading: false,
        });
      } else {
        set({
          isLoading: false,
          error: response.error || 'Failed to clear cart',
        });
      }
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to clear cart';
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  refreshCart: async () => {
    await get().fetchCart();
  },

  clearError: () => {
    set({ error: null });
  },
}));
