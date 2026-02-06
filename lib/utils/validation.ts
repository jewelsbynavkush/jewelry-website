/**
 * Validation Utilities
 * 
 * Centralized validation functions for consistent validation across the application
 * Prevents code duplication and ensures consistent validation patterns
 */

import { SECURITY_CONFIG } from '@/lib/security/constants';

/**
 * Validate slug format (alphanumeric, hyphens, underscores only)
 * Used for product slugs, category slugs, and similar identifiers
 * 
 * @param slug - Slug string to validate
 * @param maxLength - Maximum length (default: 100)
 * @returns True if slug is valid, false otherwise
 */
export function isValidSlug(slug: string, maxLength: number = SECURITY_CONFIG.SLUG_MAX_LENGTH): boolean {
  if (!slug || typeof slug !== 'string') {
    return false;
  }
  return SECURITY_CONFIG.SLUG_PATTERN.test(slug) && slug.length <= maxLength;
}

/**
 * Validate page identifier format
 * Used for content page identifiers (alphanumeric, hyphens, underscores)
 * 
 * @param page - Page identifier string to validate
 * @param maxLength - Maximum length (default: 50)
 * @returns True if page identifier is valid, false otherwise
 */
export function isValidPageIdentifier(page: string, maxLength: number = SECURITY_CONFIG.PAGE_IDENTIFIER_MAX_LENGTH): boolean {
  if (!page || typeof page !== 'string') {
    return false;
  }
  return SECURITY_CONFIG.SLUG_PATTERN.test(page) && page.length <= maxLength;
}

/**
 * Validate ObjectId format (MongoDB)
 * 
 * @param id - ObjectId string to validate
 * @returns True if ObjectId format is valid, false otherwise
 */
export function isValidObjectId(id: string): boolean {
  if (!id || typeof id !== 'string') {
    return false;
  }
  return /^[0-9a-fA-F]{24}$/.test(id);
}
