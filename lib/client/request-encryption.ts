/**
 * Client-Side Request Encryption Utilities
 *
 * Encrypts sensitive fields in API requests before sending.
 * Prefers RSA-OAEP (public key) when NEXT_PUBLIC_AUTH_PUBLIC_KEY is set; falls back to XOR obfuscation.
 * RSA: no secret in client; only server can decrypt. XOR: legacy obfuscation when RSA not configured.
 */

import { getAuthPublicKey, getObfuscationKey } from '@/lib/utils/env';

const RSA_PREFIX = 'RSA:';

function pemToBinary(pem: string): ArrayBuffer {
  const base64 = pem
    .replace(/-----BEGIN PUBLIC KEY-----/i, '')
    .replace(/-----END PUBLIC KEY-----/i, '')
    .replace(/\s/g, '');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function encryptWithRsa(plaintext: string, publicKeyPem: string): Promise<string> {
  const keyBinary = pemToBinary(publicKeyPem);
  const key = await crypto.subtle.importKey(
    'spki',
    keyBinary,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['encrypt']
  );
  const data = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, key, data);
  const base64 = btoa(String.fromCharCode(...new Uint8Array(ciphertext)));
  return RSA_PREFIX + base64;
}

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

function obfuscateSensitiveValue(value: string): string {
  let key: string | null = null;
  try {
    key = getObfuscationKey();
  } catch {
    key = null;
  }
  if (!key) {
    throw new Error('NEXT_PUBLIC_OBFUSCATION_KEY environment variable is not set. Client-side obfuscation requires this variable.');
  }
  let obfuscated = '';
  for (let i = 0; i < value.length; i++) {
    const charCode = value.charCodeAt(i);
    const keyChar = key.charCodeAt(i % key.length);
    obfuscated += String.fromCharCode(charCode ^ keyChar);
  }
  return btoa(obfuscated);
}

async function encryptSensitiveValueInternal(value: string): Promise<string> {
  const publicKeyPem = getAuthPublicKey();
  if (publicKeyPem) {
    try {
      return await encryptWithRsa(value, publicKeyPem);
    } catch (error) {
      console.error('RSA encrypt failed, falling back to obfuscation:', error);
    }
  }
  return obfuscateSensitiveValue(value);
}

/**
 * Encrypt sensitive fields in a request object. Uses RSA-OAEP when NEXT_PUBLIC_AUTH_PUBLIC_KEY is set, else XOR obfuscation.
 */
export async function encryptRequestFields<T extends Record<string, unknown>>(
  data: T
): Promise<T> {
  const encrypted = { ...data } as Record<string, unknown>;
  for (const [key, value] of Object.entries(data)) {
    if (shouldEncryptField(key) && typeof value === 'string' && value.length > 0) {
      try {
        encrypted[key] = await encryptSensitiveValueInternal(value);
      } catch (error) {
        console.error(`Failed to encrypt field ${key}:`, error);
      }
    }
  }
  return encrypted as T;
}

/**
 * Encrypt a single sensitive value. Uses RSA-OAEP when public key is set, else XOR obfuscation.
 */
export async function encryptSensitiveValue(value: string): Promise<string> {
  try {
    return await encryptSensitiveValueInternal(value);
  } catch (error) {
    console.error('Failed to encrypt sensitive value:', error);
    return value;
  }
}
