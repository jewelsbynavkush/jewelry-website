/**
 * Security Constants & Configuration
 * 
 * Centralized security configuration values for consistent
 * security implementation across the entire application.
 */

/**
 * Time Duration Constants (in seconds)
 * Centralized time values for consistent usage across the application
 */
export const TIME_DURATIONS = {
  ONE_MINUTE: 60,
  ONE_HOUR: 60 * 60,
  ONE_DAY: 24 * 60 * 60,
  THIRTY_DAYS: 30 * 24 * 60 * 60,
} as const;

/**
 * Time Duration Constants (in milliseconds)
 * For rate limiting and other time-based operations
 */
export const TIME_DURATIONS_MS = {
  ONE_MINUTE: 60 * 1000,
  FIVE_MINUTES: 5 * 60 * 1000,
  TEN_MINUTES: 10 * 60 * 1000,
  FIFTEEN_MINUTES: 15 * 60 * 1000,
  ONE_HOUR: 60 * 60 * 1000,
  ONE_DAY: 24 * 60 * 60 * 1000,
} as const;

/**
 * Security Configuration
 */
export const SECURITY_CONFIG = {
  // Rate limiting presets for different endpoint types
  RATE_LIMIT: {
    // Contact form - strictest limit to prevent spam
    CONTACT_FORM: {
      windowMs: TIME_DURATIONS_MS.FIFTEEN_MINUTES,
      maxRequests: 10, // 10 requests per 15 minutes
    },
    // Authentication endpoints - moderate limit to prevent brute force
    AUTH: {
      windowMs: TIME_DURATIONS_MS.FIFTEEN_MINUTES,
      maxRequests: 50, // 50 login attempts per 15 minutes
    },
    // Token refresh - strict limit to prevent abuse
    REFRESH: {
      windowMs: TIME_DURATIONS_MS.FIFTEEN_MINUTES,
      maxRequests: 10, // 10 refreshes per 15 minutes
    },
    // Email verification - moderate limit
    AUTH_VERIFY: {
      windowMs: TIME_DURATIONS_MS.FIFTEEN_MINUTES,
      maxRequests: 50, // 50 verification attempts per 15 minutes
    },
    // OTP resend - strict limit to prevent abuse (5 minutes)
    AUTH_RESEND_OTP: {
      windowMs: TIME_DURATIONS_MS.FIVE_MINUTES,
      maxRequests: 10, // 10 resends per 5 minutes
    },
    // Logout - higher limit (logout is relatively safe operation)
    AUTH_LOGOUT: {
      windowMs: TIME_DURATIONS_MS.FIFTEEN_MINUTES,
      maxRequests: 100, // 100 logout requests per 15 minutes
    },
    // Password reset confirmation - strict limit for security
    AUTH_RESET: {
      windowMs: TIME_DURATIONS_MS.FIFTEEN_MINUTES,
      maxRequests: 10, // 10 reset confirmation attempts per 15 minutes
    },
    // Password reset request - strict limit (per hour)
    AUTH_RESET_REQUEST: {
      windowMs: TIME_DURATIONS_MS.ONE_HOUR,
      maxRequests: 10, // 10 reset requests per hour
    },
    // Password change - very strict limit for security
    PASSWORD_CHANGE: {
      windowMs: TIME_DURATIONS_MS.FIFTEEN_MINUTES,
      maxRequests: 5, // 5 password change attempts per 15 minutes
    },
    // Public browsing endpoints - higher limit for normal usage
    PUBLIC_BROWSING: {
      windowMs: TIME_DURATIONS_MS.FIFTEEN_MINUTES,
      maxRequests: 200, // 200 requests per 15 minutes
    },
    // Cart operations - moderate limit
    CART: {
      windowMs: TIME_DURATIONS_MS.FIFTEEN_MINUTES,
      maxRequests: 200, // 200 requests per 15 minutes
    },
    // Order operations - stricter limit for financial operations
    ORDER: {
      windowMs: TIME_DURATIONS_MS.FIFTEEN_MINUTES,
      maxRequests: 20, // 20 orders per 15 minutes
    },
    // Order cancellation - strict limit for financial operations
    ORDER_CANCEL: {
      windowMs: TIME_DURATIONS_MS.FIFTEEN_MINUTES,
      maxRequests: 10, // 10 cancellations per 15 minutes
    },
    // Order read operations - higher limit for user queries
    ORDER_READ: {
      windowMs: TIME_DURATIONS_MS.FIFTEEN_MINUTES,
      maxRequests: 100, // 100 read requests per 15 minutes
    },
    // Inventory read operations - moderate limit
    INVENTORY_READ: {
      windowMs: TIME_DURATIONS_MS.FIFTEEN_MINUTES,
      maxRequests: 100, // 100 read requests per 15 minutes
    },
    // Inventory write operations - stricter limit for admin operations
    INVENTORY_WRITE: {
      windowMs: TIME_DURATIONS_MS.FIFTEEN_MINUTES,
      maxRequests: 30, // 30 write requests per 15 minutes
    },
    // User profile read operations - moderate limit
    USER_PROFILE_READ: {
      windowMs: TIME_DURATIONS_MS.FIFTEEN_MINUTES,
      maxRequests: 200, // 200 read requests per 15 minutes
    },
    // User profile write operations - stricter limit
    USER_PROFILE_WRITE: {
      windowMs: TIME_DURATIONS_MS.FIFTEEN_MINUTES,
      maxRequests: 50, // 50 write requests per 15 minutes
    },
    // Test/development endpoints - very strict limit
    TEST: {
      windowMs: TIME_DURATIONS_MS.ONE_MINUTE,
      maxRequests: 10, // 10 requests per minute
    },
    // Default fallback - moderate limit
    DEFAULT: {
      windowMs: TIME_DURATIONS_MS.FIFTEEN_MINUTES,
      maxRequests: 100, // 100 requests per 15 minutes
    },
  },
  
  // OTP expiration time
  OTP_EXPIRATION_MS: TIME_DURATIONS_MS.TEN_MINUTES, // 10 minutes
  
  // Request size limits
  MAX_REQUEST_SIZE: 10 * 1024, // 10KB
  
  // Input length limits
  MAX_STRING_LENGTH: 10000, // Maximum string length for sanitization
  
  // Validation patterns
  SLUG_PATTERN: /^[a-z0-9_-]+$/i,
  SLUG_MAX_LENGTH: 100,
  PAGE_IDENTIFIER_MAX_LENGTH: 50,
  
  // IP validation patterns
  IPV4_PATTERN: /^(\d{1,3}\.){3}\d{1,3}$/,
  IPV6_PATTERN: /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/,
  
  // Rate limit store cleanup
  RATE_LIMIT_CLEANUP_THRESHOLD: 10000, // Clean up when store exceeds this
  RATE_LIMIT_CLEANUP_PROBABILITY: 0.01, // 1% chance to clean up on each request
} as const;

/**
 * Security Headers Configuration
 */
export const SECURITY_HEADERS = {
  HSTS_MAX_AGE: 63072000, // 2 years in seconds
  HSTS_INCLUDE_SUBDOMAINS: true,
  HSTS_PRELOAD: true,
  
  CSP: {
    DEFAULT_SRC: "'self'",
    SCRIPT_SRC: "'self' 'unsafe-eval' 'unsafe-inline'",
    STYLE_SRC: "'self' 'unsafe-inline' https://fonts.googleapis.com",
    IMG_SRC: "'self' data: https: blob:",
    FONT_SRC: "'self' data: https://fonts.gstatic.com",
    CONNECT_SRC: "'self'",
    FRAME_ANCESTORS: "'none'",
    BASE_URI: "'self'",
    FORM_ACTION: "'self'",
    OBJECT_SRC: "'none'",
    UPGRADE_INSECURE_REQUESTS: true,
  },
} as const;

/**
 * Security Best Practices Guidelines
 * 
 * 1. Input Validation:
 *    - Always validate input with Zod schemas
 *    - Use whitelist approach for parameters
 *    - Validate length, format, and type
 * 
 * 2. Input Sanitization:
 *    - Sanitize all user input before processing
 *    - Remove HTML tags, scripts, event handlers
 *    - Remove dangerous protocols (javascript:, data:, etc.)
 * 
 * 3. Rate Limiting:
 *    - Implement rate limiting on all public APIs
 *    - Use IP-based rate limiting
 *    - Return proper rate limit headers
 * 
 * 4. CSRF Protection:
 *    - Validate Origin header
 *    - Fall back to Referer header
 *    - Stricter validation in production
 * 
 * 5. Security Headers:
 *    - Always include security headers
 *    - Use HSTS with preload
 *    - Implement comprehensive CSP
 * 
 * 6. Error Handling:
 *    - Never expose sensitive information
 *    - Use generic error messages in production
 *    - Log errors securely
 * 
 * 7. Environment Variables:
 *    - Never expose secrets in client-side code
 *    - Use NEXT_PUBLIC_ prefix only for public vars
 *    - Validate environment variables
 * 
 * 8. External Links:
 *    - Always use rel="noopener noreferrer"
 *    - Validate external URLs
 *    - Consider using a URL validator
 * 
 * 9. JSON-LD Security:
 *    - Only use server-generated JSON-LD
 *    - Sanitize all data before JSON.stringify
 *    - Escape HTML entities in JSON-LD
 * 
 * 10. API Security:
 *     - Validate all parameters
 *     - Sanitize all input
 *     - Implement rate limiting
 *     - Use security headers
 *     - Restrict HTTP methods
 */

/**
 * OWASP Top 10 Security Risks
 * 
 * A01: Broken Access Control
 * A02: Cryptographic Failures
 * A03: Injection
 * A04: Insecure Design
 * A05: Security Misconfiguration
 * A06: Vulnerable Components
 * A07: Authentication Failures
 * A08: Software and Data Integrity
 * A09: Security Logging
 * A10: Server-Side Request Forgery
 */
