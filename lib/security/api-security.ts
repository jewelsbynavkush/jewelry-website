/**
 * Comprehensive API Security Middleware
 * 
 * Provides unified security functions for all API routes:
 * - CORS handling
 * - CSRF protection
 * - Rate limiting
 * - Security headers
 * - Request validation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCorsHeaders, handleCorsPreflight, getCorsConfig } from './cors';
import { validateCsrf, requiresCsrfProtection } from './csrf';
import { checkRateLimit, RateLimitConfig } from './rate-limit';
import { getSecurityHeaders } from './api-headers';
import { getCorrelationId } from './error-handler';
import { SECURITY_CONFIG } from './constants';
import { isTest, isProduction } from '@/lib/utils/env';
import { enforceHttps } from './encryption';

export interface ApiSecurityConfig {
  /** Enable CORS (default: true) */
  enableCors?: boolean;
  /** Enable CSRF protection (default: true) */
  enableCsrf?: boolean;
  /** Require CSRF token (default: false, uses origin validation) */
  requireCsrfToken?: boolean;
  /** Enable rate limiting (default: true) */
  enableRateLimit?: boolean;
  /** Rate limit configuration */
  rateLimitConfig?: RateLimitConfig;
  /** Allowed HTTP methods */
  allowedMethods?: string[];
  /** Require Content-Type header */
  requireContentType?: boolean;
  /** Maximum request size in bytes */
  maxRequestSize?: number;
  /** Enforce HTTPS (default: true in production) */
  enforceHttps?: boolean;
}

const defaultConfig: ApiSecurityConfig = {
  enableCors: true,
  enableCsrf: true,
  requireCsrfToken: false,
  enableRateLimit: true,
  rateLimitConfig: SECURITY_CONFIG.RATE_LIMIT.DEFAULT,
  allowedMethods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  requireContentType: false,
  maxRequestSize: 10 * 1024 * 1024, // 10MB default
};

/**
 * Validate HTTP method against allowed methods
 * 
 * Security: Restricts endpoints to specific HTTP verbs to prevent unauthorized operations
 * 
 * @param request - Next.js request object
 * @param allowedMethods - Allowed HTTP methods
 * @returns True if method is allowed
 */
function validateMethod(request: NextRequest, allowedMethods: string[]): boolean {
  return allowedMethods.includes(request.method);
}

/**
 * Validate Content-Type header to prevent content-type confusion attacks
 * 
 * Security: Ensures request body format matches Content-Type header to prevent
 * injection attacks through content-type mismatches
 * 
 * @param request - Next.js request object
 * @param requireContentType - Whether to require Content-Type
 * @returns True if Content-Type is valid
 */
function validateContentType(request: NextRequest, requireContentType: boolean): boolean {
  if (!requireContentType) {
    return true;
  }

  // GET, HEAD, OPTIONS don't require Content-Type (no body)
  const method = request.method.toUpperCase();
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return true;
  }

  const contentType = request.headers.get('content-type');
  if (!contentType) {
    return false;
  }

  // Only allow standard API content types to prevent content-type confusion
  return contentType.includes('application/json') || contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data');
}

/**
 * Validate request size to prevent DoS attacks from oversized payloads
 * 
 * Security: Limits request body size to prevent memory exhaustion and resource exhaustion attacks
 * 
 * @param request - Next.js request object
 * @param maxSize - Maximum request size in bytes
 * @returns True if request size is valid
 */
function validateRequestSize(request: NextRequest, maxSize: number): boolean {
  const contentLength = request.headers.get('content-length');
  if (!contentLength) {
    // Unknown size - validate when reading body (fail-fast approach)
    return true;
  }

  const size = parseInt(contentLength, 10);
  return !isNaN(size) && size <= maxSize;
}

/**
 * Apply comprehensive security to API route
 * 
 * @param request - Next.js request object
 * @param config - Security configuration (optional)
 * @returns Security response or null if request should proceed
 */
export function applyApiSecurity(
  request: NextRequest,
  config: ApiSecurityConfig = {}
): NextResponse | null {
  const securityConfig = { ...defaultConfig, ...config };

  // Enforce HTTPS for sensitive operations (production only)
  // Industry standard: HTTPS/TLS is the primary encryption layer
  if (securityConfig.enforceHttps !== false && isProduction()) {
    const httpsResponse = enforceHttps(request);
    if (httpsResponse) {
      return NextResponse.json(
        { error: 'HTTPS required for this operation' },
        {
          status: 403,
          headers: {
            ...getSecurityHeaders(),
            ...(securityConfig.enableCors ? getCorsHeaders(request, getCorsConfig()) : {}),
          },
        }
      );
    }
  }

  // Handle CORS preflight requests (OPTIONS) before processing actual request
  // Preflight allows browsers to check if cross-origin request is allowed
  if (securityConfig.enableCors) {
    const corsConfig = getCorsConfig();
    const preflightResponse = handleCorsPreflight(request, corsConfig);
    if (preflightResponse) {
      return preflightResponse;
    }
  }

  // Validate HTTP method against allowed methods to prevent unauthorized operations
  // Security: Restricts endpoints to specific HTTP verbs (GET, POST, etc.)
  if (securityConfig.allowedMethods && !validateMethod(request, securityConfig.allowedMethods)) {
    return NextResponse.json(
      { error: 'Method not allowed' },
      {
        status: 405,
        headers: {
          ...getSecurityHeaders(),
          ...(securityConfig.enableCors ? getCorsHeaders(request, getCorsConfig()) : {}),
          Allow: securityConfig.allowedMethods.join(', '),
        },
      }
    );
  }

  // Validate Content-Type header when required to ensure proper request format
  // Security: Prevents content-type confusion attacks
  if (securityConfig.requireContentType && !validateContentType(request, securityConfig.requireContentType)) {
    return NextResponse.json(
      { error: 'Content-Type header required' },
      {
        status: 400,
        headers: {
          ...getSecurityHeaders(),
          ...(securityConfig.enableCors ? getCorsHeaders(request, getCorsConfig()) : {}),
        },
      }
    );
  }

  // Validate request size to prevent DoS attacks from oversized payloads
  // Security: Limits request body size to prevent memory exhaustion
  if (securityConfig.maxRequestSize && !validateRequestSize(request, securityConfig.maxRequestSize)) {
    return NextResponse.json(
      { error: 'Request too large' },
      {
        status: 413,
        headers: {
          ...getSecurityHeaders(),
          ...(securityConfig.enableCors ? getCorsHeaders(request, getCorsConfig()) : {}),
        },
      }
    );
  }

  // CSRF protection
  if (securityConfig.enableCsrf && requiresCsrfProtection(request.method)) {
    const csrfValidation = validateCsrf(request, securityConfig.requireCsrfToken);
    if (!csrfValidation.isValid) {
      return NextResponse.json(
        { error: csrfValidation.error || 'CSRF validation failed' },
        {
          status: 403,
          headers: {
            ...getSecurityHeaders(),
            ...(securityConfig.enableCors ? getCorsHeaders(request, getCorsConfig()) : {}),
          },
        }
      );
    }
  }

  // Rate limiting (disabled in test environment)
  if (securityConfig.enableRateLimit && !isTest()) {
    const rateLimit = checkRateLimit(request, securityConfig.rateLimitConfig);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            ...getSecurityHeaders(),
            ...(securityConfig.enableCors ? getCorsHeaders(request, getCorsConfig()) : {}),
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': securityConfig.rateLimitConfig?.maxRequests?.toString() || '100',
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': Math.ceil(rateLimit.resetTime / 1000).toString(),
          },
        }
      );
    }
  }

  // Request is valid, return null to proceed
  return null;
}

/**
 * Get security headers for API response
 * 
 * @param request - Next.js request object
 * @param config - Security configuration (optional)
 * @returns Security headers object
 */
export function getApiSecurityHeaders(
  request: NextRequest,
  config: ApiSecurityConfig = {}
): Record<string, string> {
  const securityConfig = { ...defaultConfig, ...config };
  const headers: Record<string, string> = { ...getSecurityHeaders() };

  // Add correlation ID for request tracking
  const correlationId = getCorrelationId(request);
  headers['X-Correlation-ID'] = correlationId;

  // Add CORS headers to allow cross-origin requests from configured domains
  if (securityConfig.enableCors) {
    const corsHeaders = getCorsHeaders(request, getCorsConfig());
    Object.assign(headers, corsHeaders);
  }

  // Add rate limit headers to inform clients of current rate limit status
  // Helps clients implement proper rate limiting on their end
  if (securityConfig.enableRateLimit) {
    const rateLimit = checkRateLimit(request, securityConfig.rateLimitConfig);
    headers['X-RateLimit-Limit'] = (securityConfig.rateLimitConfig?.maxRequests || 100).toString();
    headers['X-RateLimit-Remaining'] = rateLimit.remaining.toString();
    headers['X-RateLimit-Reset'] = Math.ceil(rateLimit.resetTime / 1000).toString();
  }

  return headers;
}

/**
 * Create secure API response
 * 
 * @param data - Response data
 * @param status - HTTP status code
 * @param request - Next.js request object
 * @param config - Security configuration (optional)
 * @returns NextResponse with security headers
 */
export function createSecureResponse(
  data: unknown,
  status: number = 200,
  request: NextRequest,
  config: ApiSecurityConfig = {}
): NextResponse {
  const headers = getApiSecurityHeaders(request, config);
  return NextResponse.json(data, { status, headers });
}

/**
 * Create secure error response
 * 
 * @param error - Error message
 * @param status - HTTP status code
 * @param request - Next.js request object
 * @param config - Security configuration (optional)
 * @returns NextResponse with security headers
 */
export function createSecureErrorResponse(
  error: string,
  status: number = 500,
  request: NextRequest,
  config: ApiSecurityConfig = {}
): NextResponse {
  const headers = getApiSecurityHeaders(request, config);
  return NextResponse.json({ error }, { status, headers });
}

/**
 * Check rate limit for authenticated user
 * Industry standard: Per-user rate limiting for authenticated endpoints
 * 
 * @param request - Next.js request object
 * @param userId - User ID from authentication
 * @param config - Rate limit configuration
 * @returns Rate limit response or null if allowed
 */
export function checkUserRateLimit(
  request: NextRequest,
  userId: string,
  config: RateLimitConfig
): NextResponse | null {
  const rateLimit = checkRateLimit(request, config, userId);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          ...getSecurityHeaders(),
          ...getCorsHeaders(request, getCorsConfig()),
          'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': Math.ceil(rateLimit.resetTime / 1000).toString(),
        },
      }
    );
  }
  return null;
}
