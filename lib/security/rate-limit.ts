/**
 * Simple in-memory rate limiter for API routes
 * For production, consider using Redis or a dedicated service
 */

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
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

const defaultConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
};

/**
 * Get client identifier (IP address or custom identifier)
 */
function getClientId(request: Request): string {
  // Try to get IP from headers (Vercel, Cloudflare, etc.)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';
  return ip;
}

/**
 * Check if request should be rate limited
 */
export function checkRateLimit(
  request: Request,
  config: RateLimitConfig = defaultConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  const clientId = getClientId(request);
  const now = Date.now();
  const key = `${clientId}:${Math.floor(now / config.windowMs)}`;

  // Clean up old entries (simple cleanup)
  if (Object.keys(store).length > 10000) {
    Object.keys(store).forEach((k) => {
      if (store[k].resetTime < now) {
        delete store[k];
      }
    });
  }

  // Check or create entry
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

