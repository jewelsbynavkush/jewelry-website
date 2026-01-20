/**
 * CORS (Cross-Origin Resource Sharing) Configuration
 * 
 * Handles CORS headers for API routes
 * Supports configurable allowed origins, methods, and headers
 */

import { NextResponse } from 'next/server';

export interface CorsConfig {
  /** Allowed origins (use '*' for all, or specific domains) */
  allowedOrigins?: string[];
  /** Allowed HTTP methods */
  allowedMethods?: string[];
  /** Allowed headers */
  allowedHeaders?: string[];
  /** Whether to allow credentials */
  allowCredentials?: boolean;
  /** Max age for preflight cache */
  maxAge?: number;
}

const defaultConfig: CorsConfig = {
  allowedOrigins: [],
  allowedMethods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  allowCredentials: true,
  maxAge: 86400, // 24 hours
};

/**
 * Get allowed origin based on request origin
 * 
 * @param requestOrigin - Origin from request header
 * @param config - CORS configuration
 * @returns Allowed origin or null
 */
function getAllowedOrigin(requestOrigin: string | null, config: CorsConfig): string | null {
  if (!requestOrigin) {
    return null;
  }

  // If no origins specified, allow same-origin only
  if (!config.allowedOrigins || config.allowedOrigins.length === 0) {
    return null;
  }

  // Allow all origins (use with caution)
  if (config.allowedOrigins.includes('*')) {
    return '*';
  }

  // Check if request origin is in allowed list
  if (config.allowedOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }

  // Check for wildcard subdomain matching (e.g., *.example.com)
  for (const allowedOrigin of config.allowedOrigins) {
    if (allowedOrigin.startsWith('*.')) {
      const domain = allowedOrigin.slice(2);
      try {
        const requestUrl = new URL(requestOrigin);
        if (requestUrl.hostname.endsWith(domain)) {
          return requestOrigin;
        }
      } catch {
        // Invalid URL
        continue;
      }
    }
  }

  return null;
}

/**
 * Get CORS headers for response
 * 
 * @param request - Next.js request object
 * @param config - CORS configuration (optional)
 * @returns CORS headers object
 */
export function getCorsHeaders(
  request: Request,
  config: CorsConfig = {}
): Record<string, string> {
  const corsConfig = { ...defaultConfig, ...config };
  const requestOrigin = request.headers.get('origin');
  const allowedOrigin = getAllowedOrigin(requestOrigin, corsConfig);

  const headers: Record<string, string> = {};

  // Access-Control-Allow-Origin
  if (allowedOrigin) {
    headers['Access-Control-Allow-Origin'] = allowedOrigin;
  }

  // Access-Control-Allow-Credentials
  if (corsConfig.allowCredentials && allowedOrigin) {
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  // Access-Control-Allow-Methods
  if (corsConfig.allowedMethods && corsConfig.allowedMethods.length > 0) {
    headers['Access-Control-Allow-Methods'] = corsConfig.allowedMethods.join(', ');
  }

  // Access-Control-Allow-Headers
  if (corsConfig.allowedHeaders && corsConfig.allowedHeaders.length > 0) {
    headers['Access-Control-Allow-Headers'] = corsConfig.allowedHeaders.join(', ');
  }

  // Access-Control-Max-Age
  if (corsConfig.maxAge) {
    headers['Access-Control-Max-Age'] = corsConfig.maxAge.toString();
  }

  // Access-Control-Expose-Headers (for client to read)
  headers['Access-Control-Expose-Headers'] = 'X-RateLimit-Remaining, X-RateLimit-Reset, X-RateLimit-Limit';

  return headers;
}

/**
 * Handle CORS preflight request
 * 
 * @param request - Next.js request object
 * @param config - CORS configuration (optional)
 * @returns Response for OPTIONS request or null
 */
export function handleCorsPreflight(
  request: Request,
  config: CorsConfig = {}
): NextResponse | null {
  if (request.method !== 'OPTIONS') {
    return null;
  }

  const corsHeaders = getCorsHeaders(request, config);
  const securityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
  };

  return new NextResponse(null, {
    status: 204,
    headers: {
      ...corsHeaders,
      ...securityHeaders,
    },
  });
}

/**
 * Get CORS configuration based on environment
 * 
 * @returns CORS configuration
 */
export function getCorsConfig(): CorsConfig {
  const allowedOrigins: string[] = [];

  // Get allowed origins from environment
  const envOrigins = process.env.CORS_ALLOWED_ORIGINS;
  if (envOrigins) {
    allowedOrigins.push(...envOrigins.split(',').map((origin) => origin.trim()));
  } else {
    // Default: allow same-origin and localhost in development
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (baseUrl) {
      try {
        const url = new URL(baseUrl);
        allowedOrigins.push(url.origin);
      } catch {
        // Invalid URL
      }
    }

    // Allow localhost in development
    if (process.env.NODE_ENV === 'development') {
      allowedOrigins.push('http://localhost:3000', 'http://127.0.0.1:3000');
    }
  }

  return {
    allowedOrigins,
    allowedMethods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
    allowCredentials: true,
    maxAge: 86400,
  };
}
