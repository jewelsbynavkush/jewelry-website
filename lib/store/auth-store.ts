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
  mobile: string;
  email?: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'admin' | 'staff';
  mobileVerified: boolean;
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
  verifyMobile: (otp: string, mobile?: string) => Promise<ApiResponse>;
  resendOTP: (mobile?: string) => Promise<ApiResponse>;
  verifyEmail: (otp: string, email?: string) => Promise<ApiResponse>;
  resendEmailOTP: () => Promise<ApiResponse>;
  resetPassword: (identifier: string) => Promise<ApiResponse>;
  confirmResetPassword: (token: string, password: string) => Promise<ApiResponse>;
  fetchProfile: () => Promise<void>;
  clearError: () => void;
}

export interface RegisterData {
  mobile: string;
  countryCode: string;
  firstName: string;
  lastName: string;
  email?: string;
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
            // Set user data from login response (profile will be fetched by AuthProvider if needed)
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
      },

      verifyMobile: async (otp: string, mobile?: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Always include mobile number from store if available (for expired token scenarios)
          // This is critical for post-registration verification when token might be expired
          const requestBody: { otp: string; mobile?: string } = { otp };
          const currentUser = get().user;
          
          // Priority: explicit parameter > store user mobile
          // Always include mobile if available (required for unauthenticated verification)
          // Get fresh user state at call time to ensure we have the latest data
          const mobileToUse = mobile || currentUser?.mobile;
          
          if (!mobileToUse) {
            // If no mobile available, this is an error state
            set({
              isLoading: false,
              error: 'Mobile number is required for verification. Please try registering again.',
            });
            return { success: false, error: 'Mobile number is required for verification' };
          }
          
          requestBody.mobile = mobileToUse;
          
          const response = await apiPost<{ user: User }>('/api/auth/verify-mobile', requestBody);
          
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

      resendOTP: async (mobile?: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Include mobile number if provided or if user exists in store (for post-registration flow)
          const requestBody: { mobile?: string } = {};
          const currentUser = get().user;
          
          // Priority: explicit parameter > store user mobile
          const mobileToUse = mobile || currentUser?.mobile;
          if (mobileToUse) {
            requestBody.mobile = mobileToUse;
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

      verifyEmail: async (otp: string, email?: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const requestBody: { otp: string; email?: string } = { otp };
          if (email) {
            requestBody.email = email;
          }
          
          const response = await apiPost<{ user: { id: string; email?: string; emailVerified: boolean } }>('/api/auth/verify-email', requestBody);
          
          if (response.success && response.data) {
            // Update user email verification status
            const currentUser = get().user;
            if (currentUser) {
              const updatedUser = { ...currentUser, emailVerified: response.data.user.emailVerified };
              set({
                user: updatedUser as User,
                isLoading: false,
                error: null,
              });
            } else {
              set({ isLoading: false, error: null });
            }
          } else {
            set({
              isLoading: false,
              error: response.error || 'Email verification failed',
            });
          }
          
          return response;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Email verification failed';
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
