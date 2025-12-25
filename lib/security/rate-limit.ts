/**
 * In-memory rate limiter for API routes
 * 
 * Note: Resets on server restart. For production with multiple instances,
 * consider Redis-based rate limiting (Upstash, Vercel KV) or Edge Config.
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
 * Sanitizes IP address to prevent injection
 */
function getClientId(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const rawIp = forwarded?.split(',')[0]?.trim() || realIp?.trim() || 'unknown';
  
  if (rawIp === 'unknown') return 'unknown';
  
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Pattern = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
  
  if (ipv4Pattern.test(rawIp) || ipv6Pattern.test(rawIp) || rawIp.startsWith('::')) {
    return rawIp;
  }
  
  return 'unknown';
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

  // Clean up old entries periodically (prevent memory leaks)
  // Clean up when store gets large or periodically
  if (Object.keys(store).length > 10000 || Math.random() < 0.01) {
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


