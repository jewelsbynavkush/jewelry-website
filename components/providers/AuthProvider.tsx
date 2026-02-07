'use client';

/**
 * Auth Provider Component
 * 
 * Initializes auth state on mount:
 * - Fetches user profile if token exists
 * - Syncs auth state with server
 * - Handles token expiration events (industry standard: automatic logout on token expiration)
 */

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { fetchProfile, logout, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Only fetch profile once on mount if not already fetched
    // Prevents infinite loops from dependency changes
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  useEffect(() => {
    // Listen for token expiration events from API client
    // Industry standard: Automatically logout when token refresh fails
    const handleTokenExpired = async () => {
      if (isAuthenticated) {
        await logout();
        // Redirect to login with current path as redirect
        const currentPath = window.location.pathname;
        if (currentPath !== '/auth/login' && currentPath !== '/auth/register') {
          router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
        }
      }
    };

    window.addEventListener('auth:token-expired', handleTokenExpired);

    return () => {
      window.removeEventListener('auth:token-expired', handleTokenExpired);
    };
  }, [isAuthenticated, logout, router]);

  return <>{children}</>;
}
