/**
 * Server-Side Request Decryption Utilities
 * 
 * Decrypts/deobfuscates sensitive fields in API requests.
 * Industry standard: Reverses client-side obfuscation to process sensitive data.
 * 
 * This reverses the simple XOR obfuscation applied on the client side.
 */

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
  // Hex tokens (like reset tokens) contain only 0-9a-fA-F and are typically 64 chars
  // Pure hex strings are NOT obfuscated (they're tokens)
  const hexPattern = /^[0-9a-fA-F]+$/;
  if (hexPattern.test(value)) {
    return false; // Pure hex = token, not obfuscated
  }
  
  // Plain 6-digit OTPs are exactly 6 digits (0-9 only)
  // Obfuscated OTPs are base64 encoded (8 chars) and contain letters
  const plainOtpPattern = /^[0-9]{6}$/;
  if (plainOtpPattern.test(value)) {
    return false; // Plain 6-digit OTP, not obfuscated
  }
  
  // Check if it's valid base64 pattern (contains only base64 chars and padding)
  // Base64 can be A-Za-z0-9+/ with optional = padding
  const base64Pattern = /^[A-Za-z0-9+/]+=*$/;
  if (!base64Pattern.test(value)) {
    return false; // Not valid base64 = plain text
  }
  
  // For passwords: Must be long enough (>= 10 chars) to be obfuscated
  // For OTPs: Can be shorter (6-digit OTP obfuscated = 8 base64 chars)
  // If it's valid base64, not hex, not plain OTP, and has reasonable length, it's likely obfuscated
  if (value.length < 8) {
    return false; // Too short to be obfuscated (even OTPs need at least 8 chars when obfuscated)
  }
  
  // If it's valid base64, not pure hex, not plain OTP, and long enough, it's likely obfuscated
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
  // Return plain text values unchanged for backward compatibility (tests, direct API calls)
  if (!looksLikeObfuscated(obfuscatedValue)) {
    return obfuscatedValue;
  }
  
  try {
    // Decode base64 to binary before XOR deobfuscation
    const decoded = Buffer.from(obfuscatedValue, 'base64').toString('binary');
    
    // Reverse XOR obfuscation using same key as client-side
    // XOR is symmetric: (A XOR K) XOR K = A
    const key = 'JWELRY_NAVKUSH_2025_SECURE_KEY';
    let deobfuscated = '';
    
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i);
      const keyChar = key.charCodeAt(i % key.length);
      deobfuscated += String.fromCharCode(charCode ^ keyChar);
    }
    
    return deobfuscated;
  } catch {
    // Return original value if deobfuscation fails (invalid base64, etc.)
    // Handles edge cases: direct API calls, test data, client-side obfuscation failures
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
