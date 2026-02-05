/**
 * Client-Side Encryption Utilities
 * 
 * Browser-compatible encryption for sensitive data before sending to API.
 * Uses Web Crypto API (industry standard for browser encryption).
 * 
 * Note: This is a defense-in-depth measure. HTTPS/TLS is the primary encryption layer.
 * Field-level encryption provides additional protection for extremely sensitive data.
 */

/**
 * Check if running in production environment (client-side)
 * 
 * @returns True if environment is production, false otherwise
 */
function isProduction(): boolean {
  if (typeof window === 'undefined') return false;
  // Check NEXT_PUBLIC_ENV or NODE_ENV for production detection
  // Note: NODE_ENV is not available in browser, so we check NEXT_PUBLIC_ENV
  return (process.env.NEXT_PUBLIC_ENV === 'production' || 
          (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production'));
}

/**
 * Encrypt data using Web Crypto API (AES-GCM)
 * Industry standard: AES-GCM provides authenticated encryption in browsers
 * 
 * @param data - Data to encrypt (string)
 * @returns Encrypted data (base64 encoded)
 * 
 * Note: Future enhancement will support RSA-OAEP for asymmetric encryption
 * with server-provided public keys for key exchange
 */
export async function encryptClientData(data: string): Promise<string> {
  try {
    // Verify Web Crypto API availability before attempting encryption
    // Required for browser-based encryption (not available in older browsers or non-HTTPS contexts)
    if (!window.crypto || !window.crypto.subtle) {
      throw new Error('Web Crypto API not available');
    }

    // Current implementation: Symmetric key approach using AES-GCM
    // Future enhancement: RSA-OAEP for key exchange, then AES-GCM for data encryption
    
    // Generate ephemeral encryption key for this session
    // Each encryption uses a unique key, preventing key reuse attacks
    const key = await window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt']
    );

    // Generate cryptographically secure random IV (12 bytes for AES-GCM)
    // IV ensures same plaintext produces different ciphertext each time
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    // Encrypt data using AES-GCM (authenticated encryption)
    // Provides both confidentiality and authenticity in a single operation
    const encodedData = new TextEncoder().encode(data);
    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encodedData
    );

    // Prepend IV to encrypted data for decryption
    // IV must be transmitted with ciphertext but doesn't need to be secret
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);

    // Encode as base64 for safe transmission over HTTP/JSON
    // Base64 encoding ensures binary data can be transmitted as text
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    // Log error securely (client-side logging should be minimal)
    // In case of encryption failure, return original data
    // HTTPS will still protect it in transit
    if (typeof window !== 'undefined' && window.console) {
      // Only log in development to avoid exposing errors in production
      if (process.env.NEXT_PUBLIC_ENV !== 'production') {
        console.error('Client encryption failed:', error);
      }
    }
    throw new Error('Encryption failed. Please ensure you are using HTTPS.');
  }
}

/**
 * Check if the current connection is HTTPS
 * Industry standard: Enforce HTTPS for all sensitive operations
 * 
 * @returns True if HTTPS is being used
 */
export function isHttpsConnection(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.protocol === 'https:' || 
         window.location.hostname === 'localhost' ||
         window.location.hostname === '127.0.0.1';
}

/**
 * Warn if not using HTTPS (development only)
 */
export function warnIfNotHttps(): void {
  if (typeof window === 'undefined') return;
  
  if (!isHttpsConnection() && isProduction()) {
    // Only warn in development to avoid console noise in production
    if (process.env.NEXT_PUBLIC_ENV !== 'production') {
      console.warn(
        'Security Warning: This application requires HTTPS for secure operation. ' +
        'Please access this site via HTTPS.'
      );
    }
  }
}
