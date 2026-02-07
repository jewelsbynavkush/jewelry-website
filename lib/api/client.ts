/**
 * API Client
 * 
 * Centralized API client for making requests to backend APIs.
 * Handles authentication, error handling, token refresh, and response parsing.
 * Industry standard: Automatic token refresh on 401 errors
 */

import { getBaseUrl } from '@/lib/utils/env';

/**
 * Get the API base URL for requests
 * Client-side: Uses relative URLs to avoid DNS resolution issues
 * Server-side: Uses NEXT_PUBLIC_BASE_URL for absolute URLs when needed
 */
function getApiBaseUrl(): string {
  // Client-side: Always use relative URLs (works with any domain)
  // This avoids DNS resolution issues and works automatically with Vercel deployments
  if (typeof window !== 'undefined') {
    return '';
  }
  // Server-side: Use base URL if available, otherwise relative
  return getBaseUrl();
}

export interface ApiError {
  error: string;
  details?: unknown;
  status?: number;
  retryAfter?: number; // Seconds to wait before retrying (for 429 errors)
  rateLimitReset?: number; // Unix timestamp when rate limit resets
  rateLimitRemaining?: number; // Remaining requests in current window
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  retryAfter?: number; // Seconds to wait before retrying (for 429 errors)
  rateLimitReset?: number; // Unix timestamp when rate limit resets
  rateLimitRemaining?: number; // Remaining requests in current window
}

// Track if refresh is in progress to prevent multiple simultaneous refresh calls
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

/**
 * Get authentication token from cookies
 * The token is set by the server in an HTTP-only cookie
 */
function getAuthToken(): string | null {
  // Client-side: We can't read HTTP-only cookies directly
  // The token is automatically sent with requests via credentials: 'include'
  // For client-side checks, we'll rely on the auth store state
  return null; // Token is in HTTP-only cookie, handled automatically
}

/**
 * Get session ID from cookies (for guest cart)
 */
function getSessionId(): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  const sessionCookie = cookies.find(cookie => cookie.trim().startsWith('session-id='));
  
  if (sessionCookie) {
    return sessionCookie.split('=')[1];
  }
  
  return null;
}

/**
 * Create session ID if it doesn't exist
 */
function ensureSessionId(): string {
  if (typeof document === 'undefined') {
    return `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
  
  let sessionId = getSessionId();
  
  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    document.cookie = `session-id=${sessionId}; path=/; max-age=${60 * 60 * 24 * 30}`; // 30 days
  }
  
  return sessionId;
}

/**
 * Refresh authentication token
 * Industry standard: Silent token refresh to maintain user session
 */
async function refreshToken(): Promise<boolean> {
  // If already refreshing, wait for existing refresh to complete
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const baseUrl = getApiBaseUrl();
      const response = await fetch(`${baseUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        return true;
      }

      // Refresh failed - token is invalid or user is no longer active
      // Clear auth state (will be handled by auth store)
      if (typeof window !== 'undefined') {
        // Dispatch custom event to notify auth store
        window.dispatchEvent(new CustomEvent('auth:token-expired'));
      }
      return false;
    } catch (error) {
      logError('Token refresh failed', error);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:token-expired'));
      }
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

import logger from '@/lib/utils/logger';

/**
 * Log error (client-side safe)
 */
function logError(message: string, error: unknown): void {
  logger.error(`API Client: ${message}`, error);
}

/**
 * Make API request with authentication, automatic token refresh, and error handling
 * Industry standard: Automatically refresh token on 401 and retry request
 */
async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
  retryCount: number = 0
): Promise<ApiResponse<T>> {
  try {
    getAuthToken(); // Token is in HTTP-only cookie, sent automatically
    ensureSessionId(); // Session ID is set in cookie automatically
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    // Note: Auth token is in HTTP-only cookie, sent automatically with credentials: 'include'
    // Session ID is also in cookie, sent automatically
    
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include', // Include cookies in requests
    });
    
    // Handle 401 Unauthorized - token expired or invalid
    // Industry standard: Automatically refresh token and retry request
    if (response.status === 401 && retryCount === 0) {
      // Skip refresh for specific auth endpoints to prevent infinite loops
      // But allow refresh for endpoints that need authentication (like email OTP)
      const skipRefreshEndpoints = [
        '/api/auth/refresh',
        '/api/auth/logout',
        '/api/auth/login',
        '/api/auth/register',
        '/api/auth/verify-email',
        '/api/auth/resend-otp',
      ];
      
      const shouldSkipRefresh = skipRefreshEndpoints.some(path => endpoint.startsWith(path));
      
      if (!shouldSkipRefresh) {
        const refreshSuccess = await refreshToken();
        
        if (refreshSuccess) {
          // Retry original request with refreshed token
          return apiRequest<T>(endpoint, options, retryCount + 1);
        }
      }
      
      // Refresh failed or skip refresh endpoint - return error silently for expected 401s
      // Expected 401s (e.g., profile fetch when not authenticated) should not log errors
      const isExpected401 = endpoint === '/api/users/profile' && retryCount === 0;
      const data = await response.json().catch(() => ({ error: 'Unauthorized' }));
      
      // Only log unexpected 401 errors (not profile fetch when not authenticated)
      if (!isExpected401) {
        logError(`API request failed: ${endpoint}`, new Error(data.error || 'Authentication required'));
      }
      
      return {
        success: false,
        error: data.error || 'Authentication required',
      };
    }
    
    // Handle 429 Too Many Requests - rate limiting
    if (response.status === 429) {
      const retryAfter = response.headers.get('retry-after');
      const rateLimitReset = response.headers.get('x-ratelimit-reset');
      const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
      
      const data = await response.json().catch(() => ({ error: 'Too many requests. Please try again later.' }));
      
      // Calculate wait time in seconds
      let waitSeconds: number | undefined;
      if (retryAfter) {
        waitSeconds = parseInt(retryAfter, 10);
      } else if (rateLimitReset) {
        const resetTime = parseInt(rateLimitReset, 10);
        waitSeconds = Math.max(0, resetTime - Math.floor(Date.now() / 1000));
      }
      
      return {
        success: false,
        error: data.error || 'Too many requests. Please try again later.',
        retryAfter: waitSeconds,
        rateLimitReset: rateLimitReset ? parseInt(rateLimitReset, 10) : undefined,
        rateLimitRemaining: rateLimitRemaining ? parseInt(rateLimitRemaining, 10) : undefined,
      };
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || `Request failed with status ${response.status}`,
      };
    }
    
    return {
      success: true,
      data: data,
      message: data.message,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
}

/**
 * GET request
 */
export async function apiGet<T = unknown>(endpoint: string): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, { method: 'GET' });
}

/**
 * POST request
 * Industry standard: Automatically encrypts sensitive fields before sending
 */
export async function apiPost<T = unknown>(
  endpoint: string,
  body?: unknown
): Promise<ApiResponse<T>> {
  // Encrypt sensitive fields in request body before sending
  // Prevents passwords and other sensitive data from being visible in network tab
  let encryptedBody = body;
  if (body && typeof body === 'object' && !Array.isArray(body)) {
    const { encryptRequestFields } = await import('@/lib/client/request-encryption');
    encryptedBody = encryptRequestFields(body as Record<string, unknown>);
  }
  
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: encryptedBody ? JSON.stringify(encryptedBody) : undefined,
  });
}

/**
 * PATCH request
 * Industry standard: Automatically encrypts sensitive fields before sending
 */
export async function apiPatch<T = unknown>(
  endpoint: string,
  body?: unknown
): Promise<ApiResponse<T>> {
  // Encrypt sensitive fields in request body before sending
  // Prevents passwords and other sensitive data from being visible in network tab
  let encryptedBody = body;
  if (body && typeof body === 'object' && !Array.isArray(body)) {
    const { encryptRequestFields } = await import('@/lib/client/request-encryption');
    encryptedBody = encryptRequestFields(body as Record<string, unknown>);
  }
  
  return apiRequest<T>(endpoint, {
    method: 'PATCH',
    body: encryptedBody ? JSON.stringify(encryptedBody) : undefined,
  });
}

/**
 * DELETE request
 */
export async function apiDelete<T = unknown>(endpoint: string): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, { method: 'DELETE' });
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}

/**
 * Get current session ID
 */
export function getCurrentSessionId(): string {
  return ensureSessionId();
}
