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
  // Prevent deep recursion
  if (depth > 10) return data;
  
  if (data === null || data === undefined) return data;
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => maskSensitiveFields(item, fieldsToMask, depth + 1)) as T;
  }
  
  // Handle objects
  if (typeof data === 'object') {
    const masked = {} as T;
    
    for (const [key, value] of Object.entries(data)) {
      // Check if field should be masked
      const shouldMask = fieldsToMask 
        ? fieldsToMask.includes(key)
        : Object.values(SENSITIVE_FIELD_PATTERNS).some(pattern => pattern.test(key));
      
      if (shouldMask && typeof value === 'string' && value.length > 0) {
        // Mask the value
        const maskingType = getMaskingType(key);
        (masked as Record<string, unknown>)[key] = maskSensitiveData(value, maskingType);
      } else if (typeof value === 'object' && value !== null) {
        // Recursively mask nested objects
        (masked as Record<string, unknown>)[key] = maskSensitiveFields(value, fieldsToMask, depth + 1);
      } else {
        // Copy value as-is
        (masked as Record<string, unknown>)[key] = value;
      }
    }
    
    return masked;
  }
  
  // Primitive values - return as-is
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
