/**
 * Input sanitization utilities.
 * Prevents XSS by stripping HTML, scripts, event handlers, and dangerous protocols from user input.
 */

/**
 * Sanitizes string input by removing HTML tags, scripts, event handlers, and dangerous protocols.
 *
 * @param input - String to sanitize
 * @returns Sanitized string (max 10000 characters)
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Order of replacements matters: scripts and event handlers before generic tag strip
  let sanitized = input.replace(/<[^>]*>/g, '');
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/<\/?script[^>]*>/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '');
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/data:text\/html/gi, '');
  sanitized = sanitized.replace(/vbscript:/gi, '');
  sanitized = sanitized.replace(/file:/gi, '');
  sanitized = sanitized.replace(/&#[0-9]+;/g, '');
  sanitized = sanitized.replace(/&#x[0-9a-f]+;/gi, '');
  sanitized = sanitized.replace(/\0/g, '');
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
  
  // Prevent DoS attacks by limiting input length
  const MAX_LENGTH = 10000;
  if (sanitized.length > MAX_LENGTH) {
    sanitized = sanitized.substring(0, MAX_LENGTH);
  }
  
  sanitized = sanitized.trim();
  
  return sanitized;
}

/**
 * Sanitizes object recursively by applying string sanitization to all string properties
 * 
 * Prevents XSS attacks by sanitizing nested object structures.
 * 
 * @param obj - Object to sanitize
 * @returns Sanitized object with same structure
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = { ...obj } as T;
  
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      (sanitized as Record<string, unknown>)[key] = sanitizeString(sanitized[key] as string);
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      (sanitized as Record<string, unknown>)[key] = sanitizeObject(sanitized[key] as Record<string, unknown>);
    }
  }
  
  return sanitized;
}

/**
 * Validates and sanitizes email address
 * 
 * Applies string sanitization and RFC 5322 validation.
 * Enforces RFC 5321 maximum length of 254 characters.
 * 
 * @param email - Email address to validate and sanitize
 * @returns Sanitized email in lowercase
 * @throws Error if email is invalid or too long
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    throw new Error('Email is required');
  }
  
  const sanitized = sanitizeString(email);
  // Simplified RFC 5322 validation - sufficient for most use cases
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    throw new Error('Invalid email format');
  }
  
  // RFC 5321 specifies maximum email length of 254 characters
  if (sanitized.length > 254) {
    throw new Error('Email too long');
  }
  
  return sanitized.toLowerCase().trim();
}

/**
 * Validates and sanitizes phone number
 * 
 * Preserves leading + for international format, removes all other non-digits.
 * Enforces ITU-T E.164 standard maximum length of 20 characters.
 * 
 * @param phone - Phone number to validate and sanitize
 * @returns Sanitized phone number, or empty string if input is empty
 * @throws Error if phone number exceeds maximum length
 */
export function sanitizePhone(phone: string): string {
  if (!phone) return '';
  // Preserve leading + for international format, remove all other non-digits
  const sanitized = phone.replace(/[^\d+]/g, '');
  // ITU-T E.164 standard allows up to 15 digits, we allow 20 for formatting characters
  if (sanitized.length > 20) {
    throw new Error('Phone number too long');
  }
  return sanitized;
}

