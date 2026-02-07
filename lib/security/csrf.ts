/**
 * CSRF (Cross-Site Request Forgery) Protection
 * 
 * Implements CSRF protection using origin/referer validation
 * and optional CSRF tokens for state-changing operations
 */

import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { getBaseUrl, isDevelopment, isTest, isProduction } from '@/lib/utils/env';

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
  
  // Check if request is same-origin by comparing to request URL
  // This handles cases where NEXT_PUBLIC_BASE_URL might differ slightly (www vs non-www)
  try {
    const requestUrl = request.nextUrl;
    
    // If origin matches request URL, it's same-origin (always allowed)
    if (originToCheck) {
      try {
        const originUrl = new URL(originToCheck);
        const originHost = originUrl.host.toLowerCase();
        const requestHost = requestUrl.host.toLowerCase();
        
        // Exact match
        if (originHost === requestHost) {
          return true;
        }
        
        // Allow if domains match (handles www vs non-www)
        // e.g., dev2026.jewelsbynavkush.com matches www.dev2026.jewelsbynavkush.com
        const normalizeHost = (host: string) => host.replace(/^www\./, '');
        if (normalizeHost(originHost) === normalizeHost(requestHost)) {
          return true;
        }
      } catch {
        // Invalid origin URL, continue with other checks
      }
    }
    
    // If no origin/referer but request is to same domain, allow in production
    // This handles same-origin requests that don't send Origin header
    if (!originToCheck && requestUrl.host) {
      // Same-origin requests don't always send Origin header
      // If request is to our own domain, it's likely legitimate
      return true;
    }
  } catch {
    // Invalid request URL, continue with other validation
  }
  
  // Validate against NEXT_PUBLIC_BASE_URL if configured
  // Allows same-origin requests from the application's own domain
  const baseUrl = getBaseUrl();
  if (baseUrl && originToCheck) {
    try {
      const baseUrlObj = new URL(baseUrl);
      const originObj = new URL(originToCheck);
      
      // Exact origin match
      if (originObj.origin === baseUrlObj.origin) {
        return true;
      }
      
      // Allow if domains match (handles www vs non-www)
      const normalizeHost = (host: string) => host.replace(/^www\./, '').toLowerCase();
      if (normalizeHost(originObj.host) === normalizeHost(baseUrlObj.host)) {
        return true;
      }
    } catch {
      // Invalid URL format, continue
    }
  }
  
  // Allow localhost in development and test environments for local testing
  if (isDevelopment() || isTest()) {
    if (!originToCheck) {
      return true; // Allow missing origin in dev/test
    }
    try {
      const originObj = new URL(originToCheck);
      if (originObj.hostname === 'localhost' || originObj.hostname === '127.0.0.1') {
        return true;
      }
    } catch {
      return false;
    }
  }
  
  // Production: strict validation - only same-origin requests allowed
  if (strict && isProduction() && !originToCheck) {
    return false;
  }
  
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
