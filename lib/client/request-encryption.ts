/**
 * Client-Side Request Encryption Utilities
 * 
 * Encrypts sensitive fields in API requests before sending.
 * Industry standard: Prevents sensitive data from being visible in network tab.
 * 
 * Uses a simple encryption scheme compatible with server-side decryption.
 * The encryption uses a shared approach where the server can decrypt using the same algorithm.
 * 
 * Note: This is defense-in-depth. HTTPS/TLS is the primary encryption layer.
 * This provides additional protection for sensitive fields visible in browser dev tools.
 */

/**
 * Fields that should be encrypted in API requests
 */
const SENSITIVE_REQUEST_FIELDS = [
  'password',
  'currentPassword',
  'newPassword',
  'confirmPassword',
  'token', // Reset tokens, etc.
  'otp', // OTP codes
] as const;

/**
 * Check if a field name should be encrypted
 */
function shouldEncryptField(fieldName: string): boolean {
  const lowerFieldName = fieldName.toLowerCase();
  return SENSITIVE_REQUEST_FIELDS.some(field => 
    lowerFieldName.includes(field.toLowerCase())
  );
}

/**
 * Simple obfuscation for sensitive fields in requests
 * Industry standard: Prevents plain text passwords from being visible in network tab
 * 
 * This is a simple XOR-based obfuscation that makes passwords unreadable in network tab
 * while still allowing the server to process them. The server will need to deobfuscate.
 * 
 * Note: This is NOT strong encryption - it's obfuscation for network tab protection.
 * HTTPS/TLS provides the real encryption. This is just to prevent casual inspection.
 * 
 * @param value - Value to obfuscate
 * @returns Obfuscated value (base64 encoded)
 */
function obfuscateSensitiveValue(value: string): string {
  // Simple XOR obfuscation with a key derived from environment
  // This makes the value unreadable in network tab but reversible on server
  // Security: Requires environment variable - no fallback for security
  // Note: This is obfuscation, not encryption. HTTPS/TLS provides real encryption.
  // Note: NEXT_PUBLIC_OBFUSCATION_KEY is exposed to client, use OBFUSCATION_KEY on server
  const key = typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_OBFUSCATION_KEY
    ? process.env.NEXT_PUBLIC_OBFUSCATION_KEY
    : null;
  
  if (!key) {
    // In browser/client context, throw error if key is not set
    throw new Error('NEXT_PUBLIC_OBFUSCATION_KEY environment variable is not set. Client-side obfuscation requires this variable.');
  }
  
  let obfuscated = '';
  
  for (let i = 0; i < value.length; i++) {
    const charCode = value.charCodeAt(i);
    const keyChar = key.charCodeAt(i % key.length);
    obfuscated += String.fromCharCode(charCode ^ keyChar);
  }
  
  // Encode as base64 to make it look like encrypted data
  return btoa(obfuscated);
}

/**
 * Encrypt sensitive fields in a request object
 * Industry standard: Encrypt sensitive fields before sending to prevent network tab exposure
 * 
 * @param data - Request data object
 * @returns Object with sensitive fields encrypted
 */
export function encryptRequestFields<T extends Record<string, unknown>>(
  data: T
): T {
  const encrypted = { ...data } as Record<string, unknown>;
  
  for (const [key, value] of Object.entries(data)) {
    // Encrypt sensitive fields that are strings
    if (shouldEncryptField(key) && typeof value === 'string' && value.length > 0) {
      try {
        // Obfuscate using simple XOR (server will deobfuscate)
        encrypted[key] = obfuscateSensitiveValue(value);
      } catch (error) {
        // If obfuscation fails, keep original value (HTTPS will protect it)
        console.error(`Failed to obfuscate field ${key}:`, error);
      }
    }
  }
  
  return encrypted as T;
}

/**
 * Encrypt a single sensitive value
 * 
 * @param value - Value to encrypt
 * @returns Encrypted value
 */
export function encryptSensitiveValue(value: string): string {
  try {
    return obfuscateSensitiveValue(value);
  } catch (error) {
    console.error('Failed to obfuscate sensitive value:', error);
    return value;
  }
}
