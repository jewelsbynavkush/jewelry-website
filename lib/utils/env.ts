/**
 * Environment variable utilities
 * Centralized access to environment variables with validation
 * All sensitive values require environment variables and throw errors if not set
 * Includes validation to prevent security issues
 */

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
 * Uses NEXT_PUBLIC_BASE_URL environment variable.
 * Validates URL format to prevent security issues from malformed URLs.
 * 
 * @returns Base URL string (validated)
 * @throws Error if NEXT_PUBLIC_BASE_URL is not set
 */
export function getBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_BASE_URL environment variable is not set');
  }
  
  // Validate URL format to prevent security issues from malformed URLs
  if (!isValidUrl(baseUrl)) {
    throw new Error('Invalid NEXT_PUBLIC_BASE_URL format. Must be a valid http:// or https:// URL');
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
 * @throws Error if NEXT_PUBLIC_SITE_NAME is not set
 */
export function getSiteName(): string {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME;
  
  if (!siteName) {
    throw new Error('NEXT_PUBLIC_SITE_NAME environment variable is not set');
  }
  
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
 * @throws Error if NEXT_PUBLIC_ENV is not set
 */
export function getEnv(): string {
  const env = process.env.NEXT_PUBLIC_ENV;
  
  if (!env) {
    throw new Error('NEXT_PUBLIC_ENV environment variable is not set');
  }
  
  if (env !== 'development' && env !== 'production') {
    throw new Error(`Invalid NEXT_PUBLIC_ENV value: ${env}. Must be 'development' or 'production'`);
  }
  
  return env;
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
 * Get access token expiration time
 * 
 * Returns the access token expiration time from environment variables.
 * 
 * @returns Access token expiration time string (e.g., '1h', '15m')
 * @throws Error if ACCESS_TOKEN_EXPIRES_IN is not set
 */
export function getAccessTokenExpiresIn(): string {
  const expiresIn = process.env.ACCESS_TOKEN_EXPIRES_IN;
  
  if (!expiresIn) {
    throw new Error('ACCESS_TOKEN_EXPIRES_IN environment variable is not set');
  }
  
  return expiresIn;
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
 * 
 * @returns JWT secret string
 * @throws Error if JWT_SECRET is not set
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  
  if (secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long for security');
  }
  
  return secret;
}

/**
 * Get Gmail user email for SMTP authentication
 * 
 * Returns the Gmail user email from environment variables.
 * Used for sending emails via Gmail SMTP.
 * 
 * @returns Gmail user email string
 * @throws Error if GMAIL_USER is not set
 */
export function getGmailUser(): string {
  const user = process.env.GMAIL_USER;
  
  if (!user) {
    throw new Error('GMAIL_USER environment variable is not set');
  }
  
  return user;
}

/**
 * Get Gmail app password for SMTP authentication
 * 
 * Returns the Gmail app password from environment variables.
 * Used for sending emails via Gmail SMTP.
 * 
 * @returns Gmail app password string
 * @throws Error if GMAIL_APP_PASSWORD is not set
 */
export function getGmailAppPassword(): string {
  const password = process.env.GMAIL_APP_PASSWORD;
  
  if (!password) {
    throw new Error('GMAIL_APP_PASSWORD environment variable is not set');
  }
  
  return password;
}

/**
 * Get Gmail from name for email sender display
 * 
 * Returns the Gmail from name from environment variables.
 * Used as the display name for email sender.
 * 
 * @returns Gmail from name string
 * @throws Error if GMAIL_FROM_NAME is not set
 */
export function getGmailFromName(): string {
  const fromName = process.env.GMAIL_FROM_NAME;
  
  if (!fromName) {
    throw new Error('GMAIL_FROM_NAME environment variable is not set');
  }
  
  return fromName;
}

/**
 * Get obfuscation key for request obfuscation
 * 
 * Returns the obfuscation key from environment variables.
 * Used for XOR-based obfuscation of sensitive fields in client requests.
 * Priority: OBFUSCATION_KEY > NEXT_PUBLIC_OBFUSCATION_KEY > JWT_SECRET
 * 
 * @returns Obfuscation key string
 * @throws Error if none of the keys are set
 */
export function getObfuscationKey(): string {
  // Priority 1: OBFUSCATION_KEY (server-only, if set)
  const obfuscationKey = process.env.OBFUSCATION_KEY;
  if (obfuscationKey) {
    if (obfuscationKey.length < 32) {
      throw new Error('OBFUSCATION_KEY must be at least 32 characters long for security');
    }
    return obfuscationKey;
  }
  
  // Priority 2: NEXT_PUBLIC_OBFUSCATION_KEY (can be used by both client and server)
  const publicObfuscationKey = process.env.NEXT_PUBLIC_OBFUSCATION_KEY;
  if (publicObfuscationKey) {
    if (publicObfuscationKey.length < 32) {
      throw new Error('NEXT_PUBLIC_OBFUSCATION_KEY must be at least 32 characters long for security');
    }
    return publicObfuscationKey;
  }
  
  // Priority 3: JWT_SECRET (final fallback)
  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret) {
    return jwtSecret;
  }
  
  throw new Error('OBFUSCATION_KEY, NEXT_PUBLIC_OBFUSCATION_KEY, or JWT_SECRET environment variable must be set');
}

/**
 * Get contact email address
 * 
 * Returns the contact email from environment variables.
 * Used for contact page and general inquiries.
 * Optional if site settings have contact email configured.
 * 
 * @returns Contact email string, or empty string if not set
 */
export function getContactEmail(): string {
  return process.env.CONTACT_EMAIL || '';
}

/**
 * Get contact phone number
 * 
 * Returns the contact phone from environment variables.
 * Used for contact page display.
 * Optional if site settings have contact phone configured.
 * 
 * @returns Contact phone string, or empty string if not set
 */
export function getContactPhone(): string {
  return process.env.CONTACT_PHONE || '';
}

/**
 * Get contact address
 * 
 * Returns the contact address from environment variables.
 * Used for contact page display.
 * Optional if site settings have contact address configured.
 * 
 * @returns Contact address string, or empty string if not set
 */
export function getContactAddress(): string {
  return process.env.CONTACT_ADDRESS || '';
}

/**
 * Get support email address
 * 
 * Returns the support email from environment variables.
 * Used for API documentation and support communications.
 * 
 * @returns Support email string
 * @throws Error if neither SUPPORT_EMAIL nor CONTACT_EMAIL is set
 */
export function getSupportEmail(): string {
  const supportEmail = process.env.SUPPORT_EMAIL;
  if (supportEmail) {
    return supportEmail;
  }
  
  const contactEmail = process.env.CONTACT_EMAIL;
  if (contactEmail) {
    return contactEmail;
  }
  
  throw new Error('SUPPORT_EMAIL or CONTACT_EMAIL environment variable must be set');
}

/**
 * Get business hours
 * 
 * Returns the business hours from environment variables.
 * Used for contact page display.
 * Optional if site settings have business hours configured.
 * 
 * @returns Business hours string (newline-separated), or empty string if not set
 */
export function getBusinessHours(): string {
  return process.env.BUSINESS_HOURS || '';
}

/**
 * Check if Swagger UI is enabled
 * 
 * Returns true if Swagger UI should be enabled in production.
 * Defaults to false for security.
 * 
 * @returns True if Swagger UI is enabled, false otherwise
 */
export function isSwaggerEnabled(): boolean {
  return process.env.ENABLE_SWAGGER === 'true';
}

/**
 * Get Swagger IP whitelist
 * 
 * Returns the comma-separated list of IP addresses allowed to access Swagger UI.
 * 
 * @returns Array of allowed IP addresses, or empty array if not set
 */
export function getSwaggerIpWhitelist(): string[] {
  const whitelist = process.env.SWAGGER_IP_WHITELIST;
  if (!whitelist) {
    return [];
  }
  return whitelist.split(',').map(ip => ip.trim()).filter(Boolean);
}
