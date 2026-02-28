/**
 * Rate limiter for API routes.
 * Uses pluggable store from rate-limit-store (in-memory by default).
 * For multi-instance production, set a Redis-backed store via setRateLimitStore (see docs/PRODUCTION_CHECKLIST.md).
 */

import { SECURITY_CONFIG } from './constants';
import { getRateLimitStore } from './rate-limit-store';

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

function getClientId(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const rawIp = forwarded?.split(',')[0]?.trim() || realIp?.trim();

  if (rawIp) {
    const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Pattern = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
    if (ipv4Pattern.test(rawIp) || ipv6Pattern.test(rawIp) || rawIp.startsWith('::')) {
      return rawIp;
    }
  }

  const userAgent = request.headers.get('user-agent') || 'unknown';
  const origin = request.headers.get('origin') || request.headers.get('referer') || 'unknown';
  const fallbackId = `${userAgent.slice(0, 20)}-${origin.slice(0, 20)}`.replace(/[^a-zA-Z0-9-]/g, '');
  return fallbackId || 'localhost-unknown';
}

/**
 * Checks if request should be rate limited. Uses getRateLimitStore() for persistence (in-memory or Redis).
 */
export async function checkRateLimit(
  request: Request,
  config: RateLimitConfig = defaultConfig,
  userId?: string
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const clientId = userId ? `user:${userId}` : getClientId(request);
  const store = getRateLimitStore();
  const { count, resetTime } = await store.incr(clientId, config.windowMs);
  const remaining = Math.max(0, config.maxRequests - count);
  const allowed = count <= config.maxRequests;
  return { allowed, remaining, resetTime };
}


