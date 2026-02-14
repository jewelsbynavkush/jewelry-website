import { describe, it, expect, vi } from 'vitest';
import {
  encryptField,
  decryptField,
  encryptFields,
  decryptFields,
  maskSensitiveData,
  isHttps,
  enforceHttps,
} from '@/lib/security/encryption';

vi.mock('@/lib/utils/env', () => ({
  getJwtSecret: () => 'test-jwt-secret-minimum-32-characters-long',
  isProduction: vi.fn(() => false),
}));

vi.mock('@/lib/security/error-handler', () => ({
  logError: vi.fn(),
}));

describe('encryption', () => {
  describe('encryptField / decryptField', () => {
    it('encrypts and decrypts plaintext', () => {
      const plain = 'secret-data';
      const encrypted = encryptField(plain);
      expect(encrypted).toBeTruthy();
      expect(encrypted).not.toBe(plain);
      expect(encrypted.length).toBeGreaterThan(plain.length);
      const decrypted = decryptField(encrypted);
      expect(decrypted).toBe(plain);
    });

    it('produces different ciphertext for same plaintext (unique salt/IV)', () => {
      const plain = 'same';
      const a = encryptField(plain);
      const b = encryptField(plain);
      expect(a).not.toBe(b);
      expect(decryptField(a)).toBe(plain);
      expect(decryptField(b)).toBe(plain);
    });

    it('throws on decryption of invalid base64', () => {
      expect(() => decryptField('not-valid-base64!!!')).toThrow(/Decryption failed/);
    });

    it('throws on decryption of tampered ciphertext', () => {
      const encrypted = encryptField('secret');
      const buf = Buffer.from(encrypted, 'base64');
      buf[buf.length - 1] ^= 0xff;
      expect(() => decryptField(buf.toString('base64'))).toThrow(/Decryption failed/);
    });
  });

  describe('encryptFields / decryptFields', () => {
    it('encrypts and decrypts specified string fields', () => {
      const data = { a: 'one', b: 'two', c: 3 };
      const encrypted = encryptFields(data, ['a', 'b']);
      expect(encrypted.a).not.toBe('one');
      expect(encrypted.b).not.toBe('two');
      expect(encrypted.c).toBe(3);
      const decrypted = decryptFields(encrypted, ['a', 'b']);
      expect(decrypted.a).toBe('one');
      expect(decrypted.b).toBe('two');
      expect(decrypted.c).toBe(3);
    });

    it('skips undefined and null values', () => {
      const data = { a: 'x', b: undefined, c: null };
      const encrypted = encryptFields(data, ['a', 'b', 'c']);
      expect(encrypted.a).not.toBe('x');
      expect(encrypted.b).toBeUndefined();
      expect(encrypted.c).toBeNull();
    });

    it('leaves field unchanged when decryption fails (backward compatibility)', () => {
      const data = { a: 'not-valid-encrypted-data' };
      const result = decryptFields(data, ['a']);
      expect(result.a).toBe('not-valid-encrypted-data');
    });
  });

  describe('maskSensitiveData', () => {
    it('returns empty string for empty value', () => {
      expect(maskSensitiveData('')).toBe('');
    });

    it('masks email', () => {
      expect(maskSensitiveData('ab@x.com', 'email')).toBe('***@x.com');
      expect(maskSensitiveData('a@domain.com', 'email')).toBe('***@domain.com');
      expect(maskSensitiveData('abc@x.com', 'email')).toMatch(/^a\*c@x\.com$/);
    });

    it('masks phone', () => {
      expect(maskSensitiveData('+11234567890', 'phone')).toBe('***-***-7890');
      expect(maskSensitiveData('1234', 'phone')).toBe('***');
    });

    it('masks card', () => {
      expect(maskSensitiveData('4111111111111234', 'card')).toBe('**** **** **** 1234');
    });

    it('masks ssn', () => {
      expect(maskSensitiveData('123-45-6789', 'ssn')).toBe('***-**-6789');
    });

    it('default mask shows first 2 and last 2', () => {
      expect(maskSensitiveData('hello', 'default')).toBe('he*lo');
      expect(maskSensitiveData('longer', 'default')).toBe('lo**er');
      expect(maskSensitiveData('ab', 'default')).toBe('****');
    });
  });

  describe('isHttps', () => {
    it('returns true when x-forwarded-proto is https', () => {
      const req = new Request('https://example.com', {
        headers: { 'x-forwarded-proto': 'https' },
      });
      expect(isHttps(req)).toBe(true);
    });

    it('returns false when x-forwarded-proto is http', () => {
      const req = new Request('http://example.com', {
        headers: { 'x-forwarded-proto': 'http' },
      });
      expect(isHttps(req)).toBe(false);
    });
  });

  describe('enforceHttps', () => {
    it('returns null when not production', async () => {
      const req = new Request('http://example.com', {
        headers: { 'x-forwarded-proto': 'http' },
      });
      expect(enforceHttps(req)).toBeNull();
    });

    it('returns 403 response when production and not https', async () => {
      const { isProduction } = await import('@/lib/utils/env');
      vi.mocked(isProduction).mockReturnValueOnce(true);
      const req = new Request('http://example.com', {
        headers: { 'x-forwarded-proto': 'http' },
      });
      const res = enforceHttps(req);
      expect(res).not.toBeNull();
      expect(res!.status).toBe(403);
      const body = await res!.json();
      expect(body.error).toContain('HTTPS');
    });
  });
});
