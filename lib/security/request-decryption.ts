/**
 * Server-Side Request Decryption Utilities
 * 
 * Decrypts/deobfuscates sensitive fields in API requests.
 * Industry standard: Reverses client-side obfuscation to process sensitive data.
 * 
 * This reverses the simple XOR obfuscation applied on the client side.
 */

/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Check if a string looks like base64-encoded obfuscated data
 * Base64 strings are typically longer and contain only base64 characters
 * Distinguishes between hex tokens (0-9a-fA-F only) and obfuscated data
 * 
 * Strategy:
 * 1. Must be valid base64 pattern (A-Za-z0-9+/ with optional = padding)
 * 2. Must NOT be pure hex (hex tokens are 0-9a-fA-F only)
 * 3. Must NOT be a plain 6-digit OTP (0-9 only, exactly 6 digits)
 * 4. For passwords: Must be long enough (>= 10 chars) to be obfuscated
 * 5. For OTPs: Can be shorter (6-digit OTP obfuscated = 8 base64 chars)
 * 6. If it's valid base64 and not hex/plain OTP, it's likely obfuscated
 */
function looksLikeObfuscated(value: string): boolean {
  // Pure hex strings are NOT obfuscated (they're tokens)
  const hexPattern = /^[0-9a-fA-F]+$/;
  if (hexPattern.test(value)) {
    return false;
  }
  
  // Obfuscated OTPs are base64 encoded (8 chars) and contain letters
  const plainOtpPattern = /^[0-9]{6}$/;
  if (plainOtpPattern.test(value)) {
    return false;
  }
  
  // Base64 can be A-Za-z0-9+/ with optional = padding
  const base64Pattern = /^[A-Za-z0-9+/]+=*$/;
  if (!base64Pattern.test(value)) {
    return false;
  }
  
  // For OTPs: 6-digit OTP obfuscated = 8 base64 chars
  if (value.length < 8) {
    return false;
  }
  
  return true;
}

/**
 * Deobfuscate sensitive value that was obfuscated on client side
 * 
 * Reverses XOR-based obfuscation with Base64 encoding to restore original value.
 * Maintains backward compatibility by returning plain text values unchanged.
 * 
 * @param obfuscatedValue - Obfuscated value (base64 encoded) or plain text
 * @returns Original plaintext value
 */
export function deobfuscateSensitiveValue(obfuscatedValue: string): string {
  // Backward compatibility: tests and direct API calls may send plain text
  if (!looksLikeObfuscated(obfuscatedValue)) {
    return obfuscatedValue;
  }
  
  try {
    const decoded = Buffer.from(obfuscatedValue, 'base64').toString('binary');
    
    // XOR is symmetric: (A XOR K) XOR K = A
    // Security: Uses environment variable if available, fallback for backward compatibility
    // Note: This is obfuscation, not encryption. HTTPS/TLS provides real encryption.
    // Use dynamic import to avoid circular dependencies
    const { getObfuscationKey } = require('@/lib/utils/env');
    const key = getObfuscationKey();
    let deobfuscated = '';
    
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i);
      const keyChar = key.charCodeAt(i % key.length);
      deobfuscated += String.fromCharCode(charCode ^ keyChar);
    }
    
    // Validate deobfuscated result: check if it contains only printable ASCII characters
    // If deobfuscation fails (wrong key), result will contain non-printable characters
    const hasNonPrintableChars = /[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/.test(deobfuscated);
    if (hasNonPrintableChars) {
      // Likely wrong key - deobfuscation produced garbage
      // Log error but return original to allow backward compatibility
      // Use dynamic import to avoid circular dependencies
      const logger = require('@/lib/utils/logger').default;
      logger.warn('Deobfuscation may have failed - result contains non-printable characters. Check if NEXT_PUBLIC_OBFUSCATION_KEY matches OBFUSCATION_KEY or JWT_SECRET.');
      // Still return the deobfuscated value - let password comparison fail naturally
      // This allows the system to work even if keys don't match (backward compatibility)
    }
    
    return deobfuscated;
  } catch (error) {
    // Handles edge cases: direct API calls, test data, client-side obfuscation failures
    const logger = require('@/lib/utils/logger').default;
    logger.warn('Deobfuscation failed, treating as plain text', { error: error instanceof Error ? error.message : 'Unknown error' });
    return obfuscatedValue;
  }
}

/**
 * Deobfuscate sensitive fields in a request object
 * 
 * Processes specified fields through deobfuscation while preserving other fields unchanged.
 * Maintains backward compatibility by handling both obfuscated and plain text values.
 * 
 * @param data - Request data object with obfuscated fields
 * @param fieldsToDeobfuscate - Array of field names to deobfuscate
 * @returns Object with deobfuscated fields
 */
export function deobfuscateRequestFields<T>(
  data: T,
  fieldsToDeobfuscate: string[]
): T {
  const deobfuscated = { ...data } as Record<string, unknown>;
  
  for (const field of fieldsToDeobfuscate) {
    const value = deobfuscated[field];
    if (value !== undefined && value !== null && typeof value === 'string') {
      try {
        deobfuscated[field] = deobfuscateSensitiveValue(value);
      } catch {
        // Keep original value if deobfuscation fails (may be plain text)
      }
    }
  }
  
  return deobfuscated as T;
}
