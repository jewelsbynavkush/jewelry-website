import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  validateOrigin,
  generateCsrfToken,
  validateCsrfToken,
  getCsrfTokenFromRequest,
  requiresCsrfProtection,
  validateCsrf,
} from '@/lib/security/csrf';
import type { NextRequest } from 'next/server';
import * as env from '@/lib/utils/env';

vi.mock('@/lib/utils/env', () => ({
  getBaseUrl: vi.fn(() => 'http://localhost:3000'),
  isDevelopment: vi.fn(() => true),
  isTest: vi.fn(() => true),
  isProduction: vi.fn(() => false),
}));

function createRequest(overrides: {
  origin?: string;
  referer?: string;
  host?: string;
  method?: string;
  cookies?: { 'csrf-token'?: string };
  headers?: Record<string, string>;
} = {}): NextRequest {
  const url = 'http://localhost:3000/api/test';
  const headers = new Headers({
    ...(overrides.origin && { origin: overrides.origin }),
    ...(overrides.referer && { referer: overrides.referer }),
    ...overrides.headers,
  });
  return {
    nextUrl: new URL(url),
    method: overrides.method ?? 'GET',
    headers,
    cookies: {
      get: (name: string) => {
        if (name === 'csrf-token' && overrides.cookies?.['csrf-token'])
          return { value: overrides.cookies['csrf-token'] };
        return undefined;
      },
    },
  } as unknown as NextRequest;
}

describe('csrf', () => {
  beforeEach(() => {
    vi.mocked(env.getBaseUrl).mockReturnValue('http://localhost:3000');
    vi.mocked(env.isDevelopment).mockReturnValue(true);
    vi.mocked(env.isTest).mockReturnValue(true);
    vi.mocked(env.isProduction).mockReturnValue(false);
  });

  describe('validateOrigin', () => {
    it('allows same-origin request (origin matches request host)', () => {
      const req = createRequest({ origin: 'http://localhost:3000' });
      expect(validateOrigin(req)).toBe(true);
    });

    it('allows when origin host matches after normalizing www', () => {
      const req = createRequest({ origin: 'http://www.localhost:3000' });
      (req.nextUrl as URL).host = 'localhost:3000';
      expect(validateOrigin(req)).toBe(true);
    });

    it('allows missing origin in dev/test', () => {
      const req = createRequest({});
      expect(validateOrigin(req)).toBe(true);
    });

    it('allows localhost origin in dev', () => {
      const req = createRequest({ origin: 'http://127.0.0.1:3000' });
      expect(validateOrigin(req)).toBe(true);
    });

    it('allows origin when baseUrl has www and origin does not (normalized match)', () => {
      vi.mocked(env.getBaseUrl).mockReturnValue('https://www.example.com');
      vi.mocked(env.isDevelopment).mockReturnValue(false);
      vi.mocked(env.isTest).mockReturnValue(false);
      const req = createRequest({ origin: 'https://example.com' });
      expect(validateOrigin(req)).toBe(true);
    });
  });

  describe('generateCsrfToken', () => {
    it('returns 64-char hex string', () => {
      const token = generateCsrfToken();
      expect(token).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe('validateCsrfToken', () => {
    it('returns true for matching tokens', () => {
      const token = generateCsrfToken();
      const req = createRequest();
      expect(validateCsrfToken(req, token, token)).toBe(true);
    });

    it('returns false when token is null', () => {
      const req = createRequest();
      expect(validateCsrfToken(req, null, 'session-token')).toBe(false);
    });

    it('returns false when session token is null', () => {
      const req = createRequest();
      expect(validateCsrfToken(req, 'token', null)).toBe(false);
    });

    it('returns false when lengths differ', () => {
      const req = createRequest();
      expect(validateCsrfToken(req, 'ab', 'abc')).toBe(false);
    });
  });

  describe('getCsrfTokenFromRequest', () => {
    it('returns token from X-CSRF-Token header', () => {
      const req = createRequest({ headers: { 'X-CSRF-Token': 'header-token' } });
      expect(getCsrfTokenFromRequest(req)).toBe('header-token');
    });

    it('returns token from cookie when header missing', () => {
      const req = createRequest({ cookies: { 'csrf-token': 'cookie-token' } });
      expect(getCsrfTokenFromRequest(req)).toBe('cookie-token');
    });
  });

  describe('requiresCsrfProtection', () => {
    it('returns false for GET', () => {
      expect(requiresCsrfProtection('GET')).toBe(false);
    });

    it('returns false for HEAD and OPTIONS', () => {
      expect(requiresCsrfProtection('HEAD')).toBe(false);
      expect(requiresCsrfProtection('OPTIONS')).toBe(false);
    });

    it('returns true for POST', () => {
      expect(requiresCsrfProtection('POST')).toBe(true);
    });

    it('returns true for PUT and DELETE', () => {
      expect(requiresCsrfProtection('PUT')).toBe(true);
      expect(requiresCsrfProtection('DELETE')).toBe(true);
    });
  });

  describe('validateCsrf', () => {
    it('returns valid when origin is valid and token not required', () => {
      const req = createRequest({ origin: 'http://localhost:3000' });
      expect(validateCsrf(req, false)).toEqual({ isValid: true });
    });

    it('returns invalid when origin is invalid', () => {
      vi.mocked(env.getBaseUrl).mockReturnValue('https://production.com');
      vi.mocked(env.isDevelopment).mockReturnValue(false);
      vi.mocked(env.isTest).mockReturnValue(false);
      vi.mocked(env.isProduction).mockReturnValue(true);
      const req = createRequest({ origin: 'https://evil.com' });
      expect(validateCsrf(req, false)).toEqual({
        isValid: false,
        error: 'Invalid origin. CSRF protection failed.',
      });
    });

    it('returns invalid when requireToken is true and token is missing', () => {
      const req = createRequest({ origin: 'http://localhost:3000' });
      expect(validateCsrf(req, true)).toEqual({
        isValid: false,
        error: 'Invalid CSRF token.',
      });
    });

    it('returns valid when requireToken is true and tokens match', () => {
      const token = generateCsrfToken();
      const req = createRequest({
        origin: 'http://localhost:3000',
        headers: { 'X-CSRF-Token': token },
        cookies: { 'csrf-token': token },
      });
      expect(validateCsrf(req, true)).toEqual({ isValid: true });
    });
  });
});
