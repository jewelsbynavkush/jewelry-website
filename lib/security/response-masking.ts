/**
 * Response Data Masking Utilities
 * 
 * Industry standard: Mask sensitive data in API responses to prevent exposure.
 * Only authorized users should see full sensitive data.
 */

import { maskSensitiveData } from './encryption';

/**
 * Sensitive field patterns for automatic masking
 */
const SENSITIVE_FIELD_PATTERNS = {
  password: /password|pwd|pass/i,
  email: /email|e-mail/i,
  phone: /phone|mobile|tel/i,
  card: /card|credit|debit|number/i,
  ssn: /ssn|social|security/i,
  token: /token|secret|key|api[_-]?key/i,
  address: /address/i,
} as const;

/**
 * Determine masking type from field name
 */
function getMaskingType(fieldName: string): 'email' | 'phone' | 'card' | 'ssn' | 'default' {
  if (SENSITIVE_FIELD_PATTERNS.email.test(fieldName)) return 'email';
  if (SENSITIVE_FIELD_PATTERNS.phone.test(fieldName)) return 'phone';
  if (SENSITIVE_FIELD_PATTERNS.card.test(fieldName)) return 'card';
  if (SENSITIVE_FIELD_PATTERNS.ssn.test(fieldName)) return 'ssn';
  return 'default';
}

/**
 * Mask sensitive fields in an object recursively
 * 
 * @param data - Data object to mask
 * @param fieldsToMask - Optional array of specific field names to mask (if not provided, auto-detect)
 * @param depth - Current recursion depth (prevents infinite loops)
 * @returns Masked data object
 */
export function maskSensitiveFields<T>(
  data: T,
  fieldsToMask?: string[],
  depth: number = 0
): T {
  // Prevent infinite recursion by limiting depth to 10 levels
  // Protects against deeply nested objects that could cause stack overflow
  if (depth > 10) return data;
  
  if (data === null || data === undefined) return data;
  
  // Recursively process array elements to mask sensitive fields in nested structures
  if (Array.isArray(data)) {
    return data.map(item => maskSensitiveFields(item, fieldsToMask, depth + 1)) as T;
  }
  
  // Process object properties: mask sensitive fields, recurse into nested objects, preserve primitives
  if (typeof data === 'object') {
    const masked = {} as T;
    
    for (const [key, value] of Object.entries(data)) {
      // Determine if field should be masked: explicit list takes precedence, otherwise auto-detect via patterns
      const shouldMask = fieldsToMask 
        ? fieldsToMask.includes(key)
        : Object.values(SENSITIVE_FIELD_PATTERNS).some(pattern => pattern.test(key));
      
      if (shouldMask && typeof value === 'string' && value.length > 0) {
        // Apply type-specific masking (email, phone, card, etc.) based on field name patterns
        const maskingType = getMaskingType(key);
        (masked as Record<string, unknown>)[key] = maskSensitiveData(value, maskingType);
      } else if (typeof value === 'object' && value !== null) {
        // Recursively process nested objects to mask sensitive fields at any depth
        (masked as Record<string, unknown>)[key] = maskSensitiveFields(value, fieldsToMask, depth + 1);
      } else {
        // Preserve non-sensitive primitive values without modification
        (masked as Record<string, unknown>)[key] = value;
      }
    }
    
    return masked;
  }
  
  // Primitive values (strings, numbers, booleans) are returned unchanged
  // Only object properties are masked, not the primitives themselves
  return data;
}

/**
 * Fields that should always be masked in user responses
 */
export const USER_SENSITIVE_FIELDS = [
  'password',
  'passwordHash',
  'emailVerificationOTP',
  'resetToken',
  'resetTokenExpires',
  'lastLoginIP',
] as const;

/**
 * Fields that should be masked in order responses
 */
export const ORDER_SENSITIVE_FIELDS = [
  'paymentMethod',
  'paymentDetails',
  'billingAddress',
  'shippingAddress',
] as const;

/**
 * Mask user data in API responses
 * 
 * @param userData - User data object
 * @returns Masked user data
 */
export function maskUserData<T extends Record<string, unknown>>(userData: T): T {
  return maskSensitiveFields(userData, [...USER_SENSITIVE_FIELDS, 'email', 'mobile']);
}

/**
 * Mask order data in API responses
 * 
 * @param orderData - Order data object
 * @returns Masked order data
 */
export function maskOrderData<T extends Record<string, unknown>>(orderData: T): T {
  return maskSensitiveFields(orderData, [...ORDER_SENSITIVE_FIELDS]);
}

/**
 * Mask address data in API responses
 * Industry standard: Partially mask addresses to prevent full exposure
 * 
 * @param address - Address object (any type with phone, addressLine1, addressLine2 fields - required or optional)
 * @returns Masked address object (preserves original type)
 */
export function maskAddress<T>(address: T | null | undefined): T | null | undefined {
  if (!address || typeof address !== 'object') return address;
  
  const addressObj = address as Record<string, unknown>;
  
  return {
    ...addressObj,
    // Mask phone number to show only last 4 digits (e.g., "******1234")
    // Prevents full phone number exposure while maintaining partial identification
    phone: addressObj.phone && typeof addressObj.phone === 'string' 
      ? maskSensitiveData(addressObj.phone, 'phone') 
      : addressObj.phone,
    // Partially mask address line 1 to show first and last few characters
    // Balances privacy with usability (e.g., "123 Main St***" becomes "123***St")
    addressLine1: addressObj.addressLine1 && typeof addressObj.addressLine1 === 'string'
      ? maskSensitiveData(addressObj.addressLine1, 'default')
      : addressObj.addressLine1,
    // Mask address line 2 if present (apartment numbers, building names, etc.)
    // Additional address details are fully masked for privacy
    addressLine2: addressObj.addressLine2 && typeof addressObj.addressLine2 === 'string'
      ? maskSensitiveData(addressObj.addressLine2, 'default')
      : addressObj.addressLine2,
  } as T;
}

/**
 * Mask array of addresses
 * 
 * @param addresses - Array of address objects
 * @returns Array of masked addresses
 */
export function maskAddresses<T extends unknown[]>(addresses: T): T {
  return addresses.map(addr => maskAddress(addr)) as T;
}
