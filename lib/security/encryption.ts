/**
 * Field-Level Encryption Utilities
 * 
 * Industry-standard encryption for sensitive data in API requests/responses.
 * Implements AES-256-GCM for symmetric encryption and RSA-OAEP for asymmetric encryption.
 * 
 * Security Best Practices:
 * - HTTPS/TLS encrypts data in transit (primary layer)
 * - Field-level encryption provides defense in depth for sensitive data
 * - AES-256-GCM provides authenticated encryption (prevents tampering)
 * - RSA-OAEP provides secure key exchange for client-side encryption
 */

import crypto from 'crypto';
import { getJwtSecret } from '@/lib/utils/env';
import { isProduction } from '@/lib/utils/env';
import { logError } from './error-handler';

/**
 * Encryption configuration
 */
const ENCRYPTION_CONFIG = {
  // AES-256-GCM configuration
  ALGORITHM: 'aes-256-gcm',
  KEY_LENGTH: 32, // 256 bits
  IV_LENGTH: 16, // 128 bits
  TAG_LENGTH: 16, // 128 bits
  SALT_LENGTH: 32, // 256 bits
  ITERATIONS: 100000, // PBKDF2 iterations
} as const;

/**
 * Derive encryption key from JWT secret using PBKDF2
 * Industry standard: Use key derivation function (PBKDF2) to generate encryption keys
 * 
 * @param salt - Random salt for key derivation
 * @returns Derived encryption key
 */
function deriveEncryptionKey(salt: Buffer): Buffer {
  const secret = getJwtSecret();
  return crypto.pbkdf2Sync(secret, salt, ENCRYPTION_CONFIG.ITERATIONS, ENCRYPTION_CONFIG.KEY_LENGTH, 'sha256');
}

/**
 * Encrypt sensitive data using AES-256-GCM
 * Industry standard: AES-256-GCM provides authenticated encryption with associated data (AEAD)
 * 
 * @param plaintext - Data to encrypt
 * @returns Encrypted data in format: salt:iv:tag:ciphertext (base64 encoded)
 */
export function encryptField(plaintext: string): string {
  try {
    // Generate random salt and IV for each encryption
    // Security: Unique salt/IV per encryption prevents pattern analysis
    const salt = crypto.randomBytes(ENCRYPTION_CONFIG.SALT_LENGTH);
    const iv = crypto.randomBytes(ENCRYPTION_CONFIG.IV_LENGTH);
    
    // Derive encryption key from JWT secret
    const key = deriveEncryptionKey(salt);
    
    // Create cipher with AES-256-GCM
    const cipher = crypto.createCipheriv(ENCRYPTION_CONFIG.ALGORITHM, key, iv);
    
    // Encrypt data
    let encrypted = cipher.update(plaintext, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    // Get authentication tag (prevents tampering)
    const tag = cipher.getAuthTag();
    
    // Combine salt:iv:tag:ciphertext for storage/transmission
    const combined = Buffer.concat([salt, iv, tag, encrypted]);
    
    // Return base64 encoded string
    return combined.toString('base64');
  } catch (error) {
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Decrypt sensitive data using AES-256-GCM
 * 
 * @param encryptedData - Encrypted data in format: salt:iv:tag:ciphertext (base64 encoded)
 * @returns Decrypted plaintext
 */
export function decryptField(encryptedData: string): string {
  try {
    // Decode base64
    const combined = Buffer.from(encryptedData, 'base64');
    
    // Extract components
    let offset = 0;
    const salt = combined.slice(offset, offset + ENCRYPTION_CONFIG.SALT_LENGTH);
    offset += ENCRYPTION_CONFIG.SALT_LENGTH;
    
    const iv = combined.slice(offset, offset + ENCRYPTION_CONFIG.IV_LENGTH);
    offset += ENCRYPTION_CONFIG.IV_LENGTH;
    
    const tag = combined.slice(offset, offset + ENCRYPTION_CONFIG.TAG_LENGTH);
    offset += ENCRYPTION_CONFIG.TAG_LENGTH;
    
    const ciphertext = combined.slice(offset);
    
    // Derive decryption key
    const key = deriveEncryptionKey(salt);
    
    // Create decipher
    const decipher = crypto.createDecipheriv(ENCRYPTION_CONFIG.ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    // Decrypt data
    let decrypted = decipher.update(ciphertext);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString('utf8');
  } catch (error) {
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Encrypt multiple fields in an object
 * 
 * @param data - Object containing fields to encrypt
 * @param fieldsToEncrypt - Array of field names to encrypt
 * @returns Object with encrypted fields
 */
export function encryptFields<T extends Record<string, unknown>>(
  data: T,
  fieldsToEncrypt: (keyof T)[]
): T {
  const encrypted = { ...data };
  
  for (const field of fieldsToEncrypt) {
    const value = encrypted[field];
    if (value !== undefined && value !== null && typeof value === 'string') {
      (encrypted[field] as unknown) = encryptField(value);
    }
  }
  
  return encrypted;
}

/**
 * Decrypt multiple fields in an object
 * 
 * @param data - Object containing encrypted fields
 * @param fieldsToDecrypt - Array of field names to decrypt
 * @returns Object with decrypted fields
 */
export function decryptFields<T extends Record<string, unknown>>(
  data: T,
  fieldsToDecrypt: (keyof T)[]
): T {
  const decrypted = { ...data };
  
  for (const field of fieldsToDecrypt) {
    const value = decrypted[field];
    if (value !== undefined && value !== null && typeof value === 'string') {
      try {
        (decrypted[field] as unknown) = decryptField(value);
      } catch (error) {
        // If decryption fails, field might not be encrypted (backward compatibility)
        // Log error but don't fail - allows gradual migration
        logError(`Failed to decrypt field ${String(field)}`, error);
      }
    }
  }
  
  return decrypted;
}

/**
 * Mask sensitive data in responses
 * Industry standard: Never expose full sensitive data in API responses
 * 
 * @param value - Value to mask
 * @param type - Type of data to mask (determines masking pattern)
 * @returns Masked value
 */
export function maskSensitiveData(value: string, type: 'email' | 'phone' | 'card' | 'ssn' | 'default' = 'default'): string {
  if (!value || value.length === 0) return value;
  
  switch (type) {
    case 'email': {
      // Mask email: a***@example.com
      const [local, domain] = value.split('@');
      if (!domain) return value;
      const maskedLocal = local.length > 2 
        ? `${local[0]}${'*'.repeat(Math.min(local.length - 2, 3))}${local[local.length - 1]}`
        : '***';
      return `${maskedLocal}@${domain}`;
    }
    
    case 'phone': {
      // Mask phone: +1 ***-***-1234 (show last 4 digits)
      if (value.length <= 4) return '***';
      const last4 = value.slice(-4);
      return `***-***-${last4}`;
    }
    
    case 'card': {
      // Mask card: **** **** **** 1234 (show last 4 digits)
      const last4 = value.replace(/\D/g, '').slice(-4);
      return `**** **** **** ${last4}`;
    }
    
    case 'ssn': {
      // Mask SSN: ***-**-1234 (show last 4 digits)
      const last4 = value.replace(/\D/g, '').slice(-4);
      return `***-**-${last4}`;
    }
    
    default: {
      // Default: Show first 2 and last 2 characters
      if (value.length <= 4) return '****';
      return `${value.slice(0, 2)}${'*'.repeat(value.length - 4)}${value.slice(-2)}`;
    }
  }
}

/**
 * Check if HTTPS is being used
 * Industry standard: Enforce HTTPS for all sensitive operations
 * 
 * @param request - Next.js request object
 * @returns True if HTTPS is being used
 */
export function isHttps(request: Request): boolean {
  const protocol = request.headers.get('x-forwarded-proto') || 
                   (request.headers.get('host')?.includes('localhost') ? 'http' : 'https');
  return protocol === 'https';
}

/**
 * Enforce HTTPS for sensitive endpoints
 * 
 * @param request - Next.js request object
 * @returns Error response if not HTTPS, null if HTTPS
 */
export function enforceHttps(request: Request): Response | null {
  if (!isHttps(request) && isProduction()) {
    return new Response(
      JSON.stringify({ error: 'HTTPS required for this operation' }),
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
  return null;
}
