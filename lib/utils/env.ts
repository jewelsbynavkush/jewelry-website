/**
 * Environment variable utilities
 * Centralized access to environment variables with consistent fallbacks
 * Includes validation to prevent security issues
 */

import logger from '@/lib/utils/logger';

/**
 * Validates URL format to ensure it uses http or https protocol
 * Prevents security issues from malformed URLs in environment variables
 * 
 * @param url - URL string to validate
 * @returns True if URL is valid and uses http/https protocol, false otherwise
 */
function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'https:' || urlObj.protocol === 'http:';
  } catch {
    return false;
  }
}

/**
 * Get the base URL for the application
 * 
 * Uses NEXT_PUBLIC_BASE_URL environment variable or falls back to a default.
 * Validates URL format to prevent security issues from malformed URLs.
 * 
 * @returns Base URL string (validated or default fallback)
 */
export function getBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  
  if (!baseUrl) {
    // Warn in production since missing base URL affects SEO and absolute URLs
    if (isProduction()) {
      logger.warn('NEXT_PUBLIC_BASE_URL is not set. Using default fallback.');
    }
    return 'https://yourdomain.com';
  }
  
  // Validate URL format to prevent security issues from malformed URLs
  if (!isValidUrl(baseUrl)) {
    logger.error('Invalid NEXT_PUBLIC_BASE_URL format. Using default fallback.');
    return 'https://yourdomain.com';
  }
  
  return baseUrl;
}

/**
 * Get the site name (brand name)
 * 
 * Can be extended to fetch from CMS if needed.
 * Sanitizes output to prevent XSS attacks if environment variable is compromised.
 * 
 * @returns Sanitized site name string
 */
export function getSiteName(): string {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Jewels by NavKush';
  
  // Remove HTML tags to prevent XSS if environment variable is compromised
  return siteName.replace(/<[^>]*>/g, '').trim();
}

/**
 * Get environment-specific configuration
 * 
 * Returns the current environment ('development' or 'production')
 * based on NEXT_PUBLIC_ENV environment variable.
 * 
 * @returns Environment string ('development' or 'production')
 */
export function getEnv(): string {
  return process.env.NEXT_PUBLIC_ENV || 'development';
}

/**
 * Check if running in production environment
 * 
 * @returns True if environment is production, false otherwise
 */
export function isProduction(): boolean {
  return getEnv() === 'production';
}

/**
 * Check if running in development environment
 * 
 * @returns True if environment is development, false otherwise
 */
export function isDevelopment(): boolean {
  return getEnv() === 'development' || process.env.NODE_ENV === 'development';
}

/**
 * Check if running in test environment
 * 
 * @returns True if environment is test, false otherwise
 */
export function isTest(): boolean {
  return process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';
}

/**
 * Get MongoDB connection URI
 * 
 * Returns the MongoDB Atlas connection string from environment variables.
 * This should be set separately for dev and prod environments.
 * 
 * @returns MongoDB connection URI string
 */
export function getMongoDbUri(): string {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }
  
  return uri;
}

/**
 * Get Zoho Mail API key
 * 
 * Returns the Zoho Mail API key from environment variables.
 * Used for sending transactional emails.
 * 
 * @returns Zoho Mail API key string
 */
export function getZohoMailApiKey(): string {
  return process.env.ZOHO_MAIL_API_KEY || '';
}

/**
 * Get access token expiration time
 * 
 * Returns the access token expiration time from environment variables.
 * Defaults to '1h' (1 hour) if not set.
 * 
 * @returns Access token expiration time string (e.g., '1h', '15m')
 */
export function getAccessTokenExpiresIn(): string {
  return process.env.ACCESS_TOKEN_EXPIRES_IN || '1h';
}

/**
 * Get CORS allowed origins
 * 
 * Returns the CORS allowed origins from environment variables.
 * Supports multiple origins separated by commas.
 * 
 * @returns Array of allowed origin strings, or empty array if not set
 */
export function getCorsAllowedOrigins(): string[] {
  const envOrigins = process.env.CORS_ALLOWED_ORIGINS;
  if (!envOrigins) {
    return [];
  }
  return envOrigins.split(',').map((origin) => origin.trim()).filter(Boolean);
}

/**
 * Get package version
 * 
 * Returns the package version from npm_package_version environment variable.
 * This is automatically set by npm/yarn during build.
 * 
 * @returns Package version string, or default '0.1.0' if not set
 */
export function getPackageVersion(): string {
  return process.env.npm_package_version || '0.1.0';
}

/**
 * Get JWT secret for token signing
 * 
 * Returns the JWT secret from environment variables.
 * Throws an error in production if not set, warns in development.
 * 
 * @returns JWT secret string
 * @throws Error if JWT_SECRET is not set in production
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET environment variable is not set in production');
    }
    if (process.env.NODE_ENV === 'development') {
      logger.warn('JWT_SECRET environment variable is not set. Using a default for development.');
    }
    return 'dev-secret-key-do-not-use-in-production';
  }
  
  return secret;
}
