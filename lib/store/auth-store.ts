'use client';

/**
 * Authentication Store (Zustand)
 * 
 * Manages authentication state:
 * - User data
 * - Login/logout
 * - Token management
 * - Session persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiPost, apiGet, ApiResponse } from '@/lib/api/client';

export interface User {
  id: string;
  email: string;
  mobile?: string;
  countryCode?: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'admin' | 'staff';
  emailVerified: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (identifier: string, password: string) => Promise<ApiResponse>;
  register: (data: RegisterData) => Promise<ApiResponse>;
  logout: () => Promise<void>;
  verifyEmail: (otp: string, email?: string) => Promise<ApiResponse>;
  resendOTP: (email?: string) => Promise<ApiResponse>;
  resendEmailOTP: () => Promise<ApiResponse>;
  resetPassword: (identifier: string) => Promise<ApiResponse>;
  confirmResetPassword: (token: string, password: string) => Promise<ApiResponse>;
  fetchProfile: () => Promise<void>;
  clearError: () => void;
}

export interface RegisterData {
  email: string;
  firstName: string;
  lastName: string;
  mobile?: string;
  countryCode?: string;
  password: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (identifier: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiPost<{ user: User }>('/api/auth/login', {
            identifier,
            password,
          });
          
          if (response.success && response.data) {
            // Token is set in HTTP-only cookie by server
            // Store user data from login response in Zustand store
            // AuthProvider will fetch full profile data separately if needed
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            
            // Refresh cart after login to get merged cart (guest cart merged into user cart)
            // Industry standard: Cart is merged on backend, frontend needs to refresh
            const { useCartStore } = await import('./cart-store');
            const { fetchCart } = useCartStore.getState();
            await fetchCart();
          } else {
            set({
              isLoading: false,
              error: response.error || 'Login failed',
            });
          }
          
          return response;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Login failed';
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiPost<{ user: User }>('/api/auth/register', data);
          
          if (response.success && response.data) {
            set({
              user: response.data.user,
              isLoading: false,
              error: null,
            });
          } else {
            set({
              isLoading: false,
              error: response.error || 'Registration failed',
            });
          }
          
          return response;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Registration failed';
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      logout: async () => {
        set({ isLoading: true });
        
        try {
          await apiPost('/api/auth/logout');
        } catch {
          // Continue with logout even if API call fails
          // Error is non-critical, user is logged out locally regardless
        }
        
        // Clear auth state (industry standard: immediate local logout)
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });

        // Clear persisted state from localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-storage');
          // Clear any other auth-related storage
          sessionStorage.clear();
        }

        // Redirect to login page with full page reload to clear all state
        // Using window.location.href ensures cookies are cleared and page is fully refreshed
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      },

      verifyEmail: async (otp: string, email?: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Always include email from store if available (for expired token scenarios)
          // This is critical for post-registration verification when token might be expired
          const requestBody: { otp: string; email?: string } = { otp };
          const currentUser = get().user;
          
          // Priority: explicit parameter > store user email
          // Always include email if available (required for unauthenticated verification)
          // Get fresh user state at call time to ensure we have the latest data
          const emailToUse = email || currentUser?.email;
          
          if (!emailToUse) {
            // If no email available, this is an error state
            set({
              isLoading: false,
              error: 'Email is required for verification. Please try registering again.',
            });
            return { success: false, error: 'Email is required for verification' };
          }
          
          requestBody.email = emailToUse;
          
          const response = await apiPost<{ user: User }>('/api/auth/verify-email', requestBody);
          
          if (response.success && response.data) {
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            
            // Refresh cart after verification to get merged cart (guest cart merged into user cart)
            // Industry standard: Cart is merged on backend, frontend needs to refresh
            const { useCartStore } = await import('./cart-store');
            const { fetchCart } = useCartStore.getState();
            await fetchCart();
          } else {
            set({
              isLoading: false,
              error: response.error || 'OTP verification failed',
            });
          }
          
          return response;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'OTP verification failed';
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      resendOTP: async (email?: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Include email if provided or if user exists in store (for post-registration flow)
          const requestBody: { email?: string } = {};
          const currentUser = get().user;
          
          // Priority: explicit parameter > store user email
          const emailToUse = email || currentUser?.email;
          if (emailToUse) {
            requestBody.email = emailToUse;
          }
          
          const response = await apiPost('/api/auth/resend-otp', requestBody);
          set({ isLoading: false });
          return response;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to resend OTP';
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      resendEmailOTP: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiPost('/api/auth/resend-email-otp', {});
          set({ isLoading: false });
          return response;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to resend email OTP';
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      resetPassword: async (identifier: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiPost('/api/auth/reset-password', { identifier });
          set({ isLoading: false });
          return response;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to request password reset';
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      confirmResetPassword: async (token: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiPost('/api/auth/reset-password/confirm', {
            token,
            password,
          });
          set({ isLoading: false });
          return response;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to reset password';
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      fetchProfile: async () => {
        set({ isLoading: true });
        
        try {
          const response = await apiGet<{ user: User }>('/api/users/profile');
          
          if (response.success && response.data) {
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            // 401 means not authenticated, clear state
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } catch {
          // Network or other errors - don't clear auth state on network errors
          set({
            isLoading: false,
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
