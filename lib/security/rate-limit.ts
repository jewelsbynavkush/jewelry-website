/**
 * In-memory rate limiter for API routes
 * 
 * Note: Resets on server restart. For production with multiple instances,
 * consider implementing distributed rate limiting with Redis or similar.
 */

import { SECURITY_CONFIG } from './constants';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  /** Time window in milliseconds for rate limiting */
  windowMs: number;
  /** Maximum number of requests allowed within the time window */
  maxRequests: number;
}

const defaultConfig: RateLimitConfig = SECURITY_CONFIG.RATE_LIMIT.DEFAULT;

/**
 * Gets client identifier from request headers (IP address)
 * 
 * Sanitizes IP address to prevent injection attacks.
 * Validates IPv4 and IPv6 formats before returning.
 * For localhost/development, uses a combination of user agent and origin to differentiate clients.
 * 
 * @param request - Request object to extract client identifier from
 * @returns Sanitized IP address or fallback identifier for localhost
 */
function getClientId(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const rawIp = forwarded?.split(',')[0]?.trim() || realIp?.trim();
  
  // Validate IP format to prevent injection attacks through malformed IP addresses
  // Security: Ensures only valid IPv4 or IPv6 addresses are used for rate limiting keys
  if (rawIp) {
    const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Pattern = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
    
    if (ipv4Pattern.test(rawIp) || ipv6Pattern.test(rawIp) || rawIp.startsWith('::')) {
      return rawIp;
    }
  }
  
  // For localhost/development: Use user agent + origin as fallback identifier
  // Prevents all localhost requests from sharing the same rate limit bucket
  // Security: Differentiates between different browsers/devices on localhost
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const origin = request.headers.get('origin') || request.headers.get('referer') || 'unknown';
  
  // Generate rate limit key from user agent and origin for guest users
  // Security: Prevents rate limit bypass by changing IP address
  // Creates unique identifier for each browser/device combination
  const fallbackId = `${userAgent.slice(0, 20)}-${origin.slice(0, 20)}`.replace(/[^a-zA-Z0-9-]/g, '');
  
  return fallbackId || 'localhost-unknown';
}

/**
 * Checks if request should be rate limited
 * 
 * Uses time-windowed keys to automatically expire old entries.
 * Performs periodic cleanup to prevent unbounded memory growth.
 * Industry standard: Uses IP/user-agent for unauthenticated, user ID for authenticated.
 * 
 * @param request - Request object to check rate limit for
 * @param config - Rate limit configuration (window and max requests)
 * @param userId - Optional user ID for authenticated requests (uses IP if not provided)
 * @returns Object with allowed status, remaining requests, and reset time
 */
export function checkRateLimit(
  request: Request,
  config: RateLimitConfig = defaultConfig,
  userId?: string
): { allowed: boolean; remaining: number; resetTime: number } {
  // Industry standard: Use user ID for authenticated requests, IP/user-agent for unauthenticated
  // Provides per-user rate limiting for authenticated endpoints and per-device for guests
  const clientId = userId ? `user:${userId}` : getClientId(request);
  const now = Date.now();
  // Create time-windowed key to automatically expire old entries
  // Performance: Key changes every windowMs milliseconds, causing old entries to be ignored automatically
  const key = `${clientId}:${Math.floor(now / config.windowMs)}`;

  // Periodic cleanup prevents unbounded memory growth
  // Trigger cleanup when store exceeds threshold or randomly (1% chance)
  if (Object.keys(store).length > 10000 || Math.random() < 0.01) {
    Object.keys(store).forEach((k) => {
      if (store[k].resetTime < now) {
        delete store[k];
      }
    });
  }

  // Initialize rate limit entry for this time window if it doesn't exist
  // Each time window gets its own counter, automatically resetting after windowMs
  if (!store[key]) {
    store[key] = {
      count: 0,
      resetTime: now + config.windowMs,
    };
  }

  store[key].count++;

  const remaining = Math.max(0, config.maxRequests - store[key].count);
  const allowed = store[key].count <= config.maxRequests;

  return {
    allowed,
    remaining,
    resetTime: store[key].resetTime,
  };
}


