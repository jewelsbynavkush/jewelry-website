/**
 * Environment getters - tests for lib/utils/env.ts
 * Setup sets NODE_ENV=test, MONGODB_URI, JWT_SECRET, ACCESS_TOKEN_EXPIRES_IN, NEXT_PUBLIC_BASE_URL, NEXT_PUBLIC_ENV
 */

import { describe, it, expect } from 'vitest';
import {
  getBaseUrl,
  getSiteName,
  getEnv,
  isProduction,
  isDevelopment,
  isTest,
  getMongoDbUri,
  getAccessTokenExpiresIn,
  getPackageVersion,
  getCorsAllowedOrigins,
  getJwtSecret,
  getContactEmail,
  getContactPhone,
  getContactAddress,
  getBusinessHours,
  isSwaggerEnabled,
  getSwaggerIpWhitelist,
  getCDNBaseUrl,
  getCDNProvider,
  getSupportEmail,
  getGmailUser,
  getGmailAppPassword,
  getGmailFromName,
  getObfuscationKey,
} from '@/lib/utils/env';

function setEnv(key: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}

describe('lib/utils/env', () => {
  describe('getBaseUrl', () => {
    it('returns NEXT_PUBLIC_BASE_URL when set and valid', () => {
      expect(getBaseUrl()).toBe(process.env.NEXT_PUBLIC_BASE_URL);
      expect(getBaseUrl()).toMatch(/^https?:\/\//);
    });

    it('throws when NEXT_PUBLIC_BASE_URL is not set', () => {
      const saved = process.env.NEXT_PUBLIC_BASE_URL;
      setEnv('NEXT_PUBLIC_BASE_URL', undefined);
      expect(() => getBaseUrl()).toThrow('NEXT_PUBLIC_BASE_URL');
      setEnv('NEXT_PUBLIC_BASE_URL', saved);
    });

    it('throws when URL is invalid', () => {
      const saved = process.env.NEXT_PUBLIC_BASE_URL;
      process.env.NEXT_PUBLIC_BASE_URL = 'not-a-url';
      expect(() => getBaseUrl()).toThrow('Invalid NEXT_PUBLIC_BASE_URL');
      setEnv('NEXT_PUBLIC_BASE_URL', saved);
    });
  });

  describe('getSiteName', () => {
    it('returns and strips HTML when set', () => {
      const saved = process.env.NEXT_PUBLIC_SITE_NAME;
      process.env.NEXT_PUBLIC_SITE_NAME = '  <b>Jewels</b>  ';
      expect(getSiteName()).toBe('Jewels');
      setEnv('NEXT_PUBLIC_SITE_NAME', saved);
    });

    it('throws when not set', () => {
      const saved = process.env.NEXT_PUBLIC_SITE_NAME;
      setEnv('NEXT_PUBLIC_SITE_NAME', undefined);
      expect(() => getSiteName()).toThrow('NEXT_PUBLIC_SITE_NAME');
      setEnv('NEXT_PUBLIC_SITE_NAME', saved);
    });
  });

  describe('getEnv', () => {
    it('returns development when NEXT_PUBLIC_ENV is development', () => {
      expect(getEnv()).toBe('development');
    });

    it('throws when NEXT_PUBLIC_ENV is not set', () => {
      const saved = process.env.NEXT_PUBLIC_ENV;
      setEnv('NEXT_PUBLIC_ENV', undefined);
      expect(() => getEnv()).toThrow('NEXT_PUBLIC_ENV');
      setEnv('NEXT_PUBLIC_ENV', saved);
    });

    it('throws when value is invalid', () => {
      const saved = process.env.NEXT_PUBLIC_ENV;
      process.env.NEXT_PUBLIC_ENV = 'staging';
      expect(() => getEnv()).toThrow('Invalid NEXT_PUBLIC_ENV');
      setEnv('NEXT_PUBLIC_ENV', saved);
    });
  });

  describe('isProduction', () => {
    it('returns false when getEnv() is development', () => {
      expect(isProduction()).toBe(false);
    });
  });

  describe('isDevelopment', () => {
    it('returns true when getEnv() is development', () => {
      expect(isDevelopment()).toBe(true);
    });
  });

  describe('isTest', () => {
    it('returns true when NODE_ENV is test', () => {
      expect(isTest()).toBe(true);
    });
  });

  describe('getMongoDbUri', () => {
    it('returns MONGODB_URI when set', () => {
      expect(getMongoDbUri()).toBe(process.env.MONGODB_URI);
      expect(getMongoDbUri()).toBeTruthy();
    });

    it('throws when not set', () => {
      const saved = process.env.MONGODB_URI;
      setEnv('MONGODB_URI', undefined);
      expect(() => getMongoDbUri()).toThrow('MONGODB_URI');
      setEnv('MONGODB_URI', saved);
    });
  });

  describe('getAccessTokenExpiresIn', () => {
    it('returns value when set', () => {
      expect(getAccessTokenExpiresIn()).toBe('1h');
    });

    it('throws when not set', () => {
      const saved = process.env.ACCESS_TOKEN_EXPIRES_IN;
      setEnv('ACCESS_TOKEN_EXPIRES_IN', undefined);
      expect(() => getAccessTokenExpiresIn()).toThrow('ACCESS_TOKEN_EXPIRES_IN');
      setEnv('ACCESS_TOKEN_EXPIRES_IN', saved);
    });
  });

  describe('getPackageVersion', () => {
    it('returns string', () => {
      const v = getPackageVersion();
      expect(typeof v).toBe('string');
      expect(v.length).toBeGreaterThan(0);
    });
  });

  describe('getCorsAllowedOrigins', () => {
    it('returns empty array when not set', () => {
      const saved = process.env.CORS_ALLOWED_ORIGINS;
      setEnv('CORS_ALLOWED_ORIGINS', undefined);
      expect(getCorsAllowedOrigins()).toEqual([]);
      setEnv('CORS_ALLOWED_ORIGINS', saved);
    });

    it('returns parsed array when set', () => {
      const saved = process.env.CORS_ALLOWED_ORIGINS;
      process.env.CORS_ALLOWED_ORIGINS = 'https://a.com, https://b.com';
      expect(getCorsAllowedOrigins()).toEqual(['https://a.com', 'https://b.com']);
      setEnv('CORS_ALLOWED_ORIGINS', saved);
    });
  });

  describe('getJwtSecret', () => {
    it('returns value when set and length >= 32', () => {
      expect(getJwtSecret()).toBe(process.env.JWT_SECRET);
    });

    it('throws when not set', () => {
      const saved = process.env.JWT_SECRET;
      setEnv('JWT_SECRET', undefined);
      expect(() => getJwtSecret()).toThrow('JWT_SECRET');
      setEnv('JWT_SECRET', saved);
    });

    it('throws when length < 32', () => {
      const saved = process.env.JWT_SECRET;
      process.env.JWT_SECRET = 'short';
      expect(() => getJwtSecret()).toThrow('at least 32');
      setEnv('JWT_SECRET', saved);
    });
  });

  describe('getContactEmail', () => {
    it('returns empty string when not set', () => {
      const saved = process.env.CONTACT_EMAIL;
      setEnv('CONTACT_EMAIL', undefined);
      expect(getContactEmail()).toBe('');
      setEnv('CONTACT_EMAIL', saved);
    });

    it('returns value when set', () => {
      const saved = process.env.CONTACT_EMAIL;
      process.env.CONTACT_EMAIL = 'a@b.com';
      expect(getContactEmail()).toBe('a@b.com');
      setEnv('CONTACT_EMAIL', saved);
    });
  });

  describe('getContactPhone', () => {
    it('returns empty string when not set', () => {
      const saved = process.env.CONTACT_PHONE;
      setEnv('CONTACT_PHONE', undefined);
      expect(getContactPhone()).toBe('');
      setEnv('CONTACT_PHONE', saved);
    });
  });

  describe('getContactAddress', () => {
    it('returns empty string when not set', () => {
      const saved = process.env.CONTACT_ADDRESS;
      setEnv('CONTACT_ADDRESS', undefined);
      expect(getContactAddress()).toBe('');
      setEnv('CONTACT_ADDRESS', saved);
    });
  });

  describe('getSupportEmail', () => {
    it('returns SUPPORT_EMAIL when set', () => {
      const saved = process.env.SUPPORT_EMAIL;
      process.env.SUPPORT_EMAIL = 'support@test.com';
      expect(getSupportEmail()).toBe('support@test.com');
      setEnv('SUPPORT_EMAIL', saved);
    });

    it('falls back to CONTACT_EMAIL', () => {
      const savedSupport = process.env.SUPPORT_EMAIL;
      const savedContact = process.env.CONTACT_EMAIL;
      delete process.env.SUPPORT_EMAIL;
      process.env.CONTACT_EMAIL = 'contact@test.com';
      expect(getSupportEmail()).toBe('contact@test.com');
      setEnv('SUPPORT_EMAIL', savedSupport);
      setEnv('CONTACT_EMAIL', savedContact);
    });

    it('throws when neither set', () => {
      const savedSupport = process.env.SUPPORT_EMAIL;
      const savedContact = process.env.CONTACT_EMAIL;
      setEnv('SUPPORT_EMAIL', undefined);
      setEnv('CONTACT_EMAIL', undefined);
      expect(() => getSupportEmail()).toThrow('SUPPORT_EMAIL or CONTACT_EMAIL');
      setEnv('SUPPORT_EMAIL', savedSupport);
      setEnv('CONTACT_EMAIL', savedContact);
    });
  });

  describe('getBusinessHours', () => {
    it('returns empty string when not set', () => {
      const saved = process.env.BUSINESS_HOURS;
      setEnv('BUSINESS_HOURS', undefined);
      expect(getBusinessHours()).toBe('');
      setEnv('BUSINESS_HOURS', saved);
    });
  });

  describe('isSwaggerEnabled', () => {
    it('returns false when not "true"', () => {
      const saved = process.env.ENABLE_SWAGGER;
      setEnv('ENABLE_SWAGGER', undefined);
      expect(isSwaggerEnabled()).toBe(false);
      process.env.ENABLE_SWAGGER = 'false';
      expect(isSwaggerEnabled()).toBe(false);
      setEnv('ENABLE_SWAGGER', saved);
    });

    it('returns true when ENABLE_SWAGGER is "true"', () => {
      const saved = process.env.ENABLE_SWAGGER;
      process.env.ENABLE_SWAGGER = 'true';
      expect(isSwaggerEnabled()).toBe(true);
      setEnv('ENABLE_SWAGGER', saved);
    });
  });

  describe('getSwaggerIpWhitelist', () => {
    it('returns empty array when not set', () => {
      const saved = process.env.SWAGGER_IP_WHITELIST;
      setEnv('SWAGGER_IP_WHITELIST', undefined);
      expect(getSwaggerIpWhitelist()).toEqual([]);
      setEnv('SWAGGER_IP_WHITELIST', saved);
    });

    it('returns parsed array when set', () => {
      const saved = process.env.SWAGGER_IP_WHITELIST;
      process.env.SWAGGER_IP_WHITELIST = '127.0.0.1, 10.0.0.1';
      expect(getSwaggerIpWhitelist()).toEqual(['127.0.0.1', '10.0.0.1']);
      setEnv('SWAGGER_IP_WHITELIST', saved);
    });
  });

  describe('getCDNBaseUrl', () => {
    it('returns null when not set', () => {
      const saved = process.env.NEXT_PUBLIC_CDN_BASE_URL;
      setEnv('NEXT_PUBLIC_CDN_BASE_URL', undefined);
      expect(getCDNBaseUrl()).toBeNull();
      setEnv('NEXT_PUBLIC_CDN_BASE_URL', saved);
    });

    it('returns value when set', () => {
      const saved = process.env.NEXT_PUBLIC_CDN_BASE_URL;
      process.env.NEXT_PUBLIC_CDN_BASE_URL = 'https://cdn.example.com';
      expect(getCDNBaseUrl()).toBe('https://cdn.example.com');
      setEnv('NEXT_PUBLIC_CDN_BASE_URL', saved);
    });
  });

  describe('getCDNProvider', () => {
    it('returns empty string when not set', () => {
      const saved = process.env.NEXT_PUBLIC_CDN_PROVIDER;
      setEnv('NEXT_PUBLIC_CDN_PROVIDER', undefined);
      expect(getCDNProvider()).toBe('');
      setEnv('NEXT_PUBLIC_CDN_PROVIDER', saved);
    });
  });

  describe('getGmailUser', () => {
    it('throws when not set', () => {
      const saved = process.env.GMAIL_USER;
      setEnv('GMAIL_USER', undefined);
      expect(() => getGmailUser()).toThrow('GMAIL_USER');
      setEnv('GMAIL_USER', saved);
    });
  });

  describe('getGmailAppPassword', () => {
    it('throws when not set', () => {
      const saved = process.env.GMAIL_APP_PASSWORD;
      setEnv('GMAIL_APP_PASSWORD', undefined);
      expect(() => getGmailAppPassword()).toThrow('GMAIL_APP_PASSWORD');
      setEnv('GMAIL_APP_PASSWORD', saved);
    });
  });

  describe('getGmailFromName', () => {
    it('throws when not set', () => {
      const saved = process.env.GMAIL_FROM_NAME;
      setEnv('GMAIL_FROM_NAME', undefined);
      expect(() => getGmailFromName()).toThrow('GMAIL_FROM_NAME');
      setEnv('GMAIL_FROM_NAME', saved);
    });
  });

  describe('getObfuscationKey', () => {
    it('returns JWT_SECRET when OBFUSCATION_KEY and NEXT_PUBLIC_OBFUSCATION_KEY not set', () => {
      const savedO = process.env.OBFUSCATION_KEY;
      const savedP = process.env.NEXT_PUBLIC_OBFUSCATION_KEY;
      setEnv('OBFUSCATION_KEY', undefined);
      setEnv('NEXT_PUBLIC_OBFUSCATION_KEY', undefined);
      expect(getObfuscationKey()).toBe(process.env.JWT_SECRET);
      setEnv('OBFUSCATION_KEY', savedO);
      setEnv('NEXT_PUBLIC_OBFUSCATION_KEY', savedP);
    });

    it('throws when no key is set', () => {
      const savedO = process.env.OBFUSCATION_KEY;
      const savedP = process.env.NEXT_PUBLIC_OBFUSCATION_KEY;
      const savedJ = process.env.JWT_SECRET;
      setEnv('OBFUSCATION_KEY', undefined);
      setEnv('NEXT_PUBLIC_OBFUSCATION_KEY', undefined);
      setEnv('JWT_SECRET', undefined);
      expect(() => getObfuscationKey()).toThrow('OBFUSCATION_KEY');
      setEnv('OBFUSCATION_KEY', savedO);
      setEnv('NEXT_PUBLIC_OBFUSCATION_KEY', savedP);
      setEnv('JWT_SECRET', savedJ);
    });

    it('throws when OBFUSCATION_KEY length < 32', () => {
      const saved = process.env.OBFUSCATION_KEY;
      process.env.OBFUSCATION_KEY = 'short';
      expect(() => getObfuscationKey()).toThrow('at least 32');
      setEnv('OBFUSCATION_KEY', saved);
    });
  });
});
