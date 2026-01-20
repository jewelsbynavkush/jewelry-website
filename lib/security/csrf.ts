/**
 * CSRF (Cross-Site Request Forgery) Protection
 * 
 * Implements CSRF protection using origin/referer validation
 * and optional CSRF tokens for state-changing operations
 */

import { NextRequest } from 'next/server';
import crypto from 'crypto';

/**
 * Validate request origin for CSRF protection
 * 
 * @param request - Next.js request object
 * @param strict - If true, requires origin/referer in production (default: true)
 * @returns True if origin is valid, false otherwise
 */
export function validateOrigin(request: NextRequest, strict: boolean = true): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  
  // Use Referer as fallback since same-origin requests may omit Origin header
  const originToCheck = origin || referer;
  
  if (!originToCheck) {
    // Missing both headers could indicate same-origin request or direct API call
    // Strict validation in production prevents unauthorized access
    if (strict && process.env.NODE_ENV === 'production') {
      return false;
    }
    // Allow in development and test environments for testing convenience
    return process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (baseUrl) {
    try {
      const baseUrlObj = new URL(baseUrl);
      const originObj = new URL(originToCheck);
      // Same-origin requests are always allowed
      if (originObj.origin === baseUrlObj.origin) {
        return true;
      }
    } catch {
      // Invalid URL format indicates potential attack
      return false;
    }
  }
  
  // Allow localhost in development and test environments for local testing
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    try {
      const originObj = new URL(originToCheck);
      if (originObj.hostname === 'localhost' || originObj.hostname === '127.0.0.1') {
        return true;
      }
    } catch {
      return false;
    }
  }
  
  // Production: only same-origin requests allowed
  return false;
}

/**
 * Generate CSRF token
 * 
 * @returns CSRF token string
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Validate CSRF token
 * 
 * @param request - Next.js request object
 * @param token - CSRF token from request
 * @param sessionToken - CSRF token from session
 * @returns True if token is valid, false otherwise
 */
export function validateCsrfToken(
  request: NextRequest,
  token: string | null,
  sessionToken: string | null
): boolean {
  if (!token || !sessionToken) {
    return false;
  }

  // Tokens must be same length for timing-safe comparison
  if (token.length !== sessionToken.length) {
    return false;
  }

  // Use timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(token),
      Buffer.from(sessionToken)
    );
  } catch {
    return false;
  }
}

/**
 * Get CSRF token from request
 * 
 * @param request - Next.js request object
 * @returns CSRF token or null
 */
export function getCsrfTokenFromRequest(request: NextRequest): string | null {
  // Try header first
  const headerToken = request.headers.get('X-CSRF-Token');
  if (headerToken) {
    return headerToken;
  }

  // Try cookie
  const cookieToken = request.cookies.get('csrf-token');
  if (cookieToken?.value) {
    return cookieToken.value;
  }

  // Try body (for form submissions)
  // Note: This requires parsing the body, which should be done in the route handler
  return null;
}

/**
 * Check if request method requires CSRF protection
 * 
 * @param method - HTTP method
 * @returns True if method requires CSRF protection
 */
export function requiresCsrfProtection(method: string): boolean {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  return !safeMethods.includes(method.toUpperCase());
}

/**
 * Validate CSRF protection for request
 * 
 * @param request - Next.js request object
 * @param requireToken - Whether to require CSRF token (default: false, uses origin validation)
 * @returns Object with isValid and error message
 */
export function validateCsrf(
  request: NextRequest,
  requireToken: boolean = false
): { isValid: boolean; error?: string } {
  // Check origin validation (always required)
  if (!validateOrigin(request)) {
    return {
      isValid: false,
      error: 'Invalid origin. CSRF protection failed.',
    };
  }

  // If token is required, validate it
  if (requireToken) {
    const requestToken = getCsrfTokenFromRequest(request);
    const sessionToken = request.cookies.get('csrf-token')?.value || null;

    if (!validateCsrfToken(request, requestToken, sessionToken)) {
      return {
        isValid: false,
        error: 'Invalid CSRF token.',
      };
    }
  }

  return { isValid: true };
}
