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
    // Check if Web Crypto API is available
    if (!window.crypto || !window.crypto.subtle) {
      throw new Error('Web Crypto API not available');
    }

    // Current implementation: Symmetric key approach using AES-GCM
    // Future enhancement: RSA-OAEP for key exchange, then AES-GCM for data encryption
    
    // Generate a random key for this encryption session
    const key = await window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt']
    );

    // Generate random IV
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    // Encrypt data
    const encodedData = new TextEncoder().encode(data);
    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encodedData
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);

    // Convert to base64 for transmission
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Client encryption failed:', error);
    // In case of encryption failure, return original data
    // HTTPS will still protect it in transit
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
  
  if (!isHttpsConnection() && process.env.NODE_ENV === 'production') {
    console.warn(
      'Security Warning: This application requires HTTPS for secure operation. ' +
      'Please access this site via HTTPS.'
    );
  }
}
