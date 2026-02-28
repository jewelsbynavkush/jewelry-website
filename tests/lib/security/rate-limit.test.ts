import { describe, it, expect } from 'vitest';
import { checkRateLimit } from '@/lib/security/rate-limit';

function createRequest(headers: Record<string, string> = {}): Request {
  return new Request('http://localhost/api', {
    headers: {
      Origin: 'http://localhost:3000',
      ...headers,
    },
  });
}

describe('rate-limit', () => {
  describe('checkRateLimit', () => {
    it('uses x-forwarded-for IPv4 as client id', async () => {
      const req = createRequest({ 'x-forwarded-for': '192.168.1.1' });
      const result = await checkRateLimit(req, { windowMs: 60000, maxRequests: 10 });
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9);
    });

    it('uses user id when provided', async () => {
      const req = createRequest();
      const result = await checkRateLimit(req, { windowMs: 60000, maxRequests: 10 }, 'user-123');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9);
    });

    it('denies when over limit', async () => {
      const req = createRequest({ 'x-forwarded-for': '10.0.0.2' });
      const config = { windowMs: 60000, maxRequests: 2 };
      await checkRateLimit(req, config);
      await checkRateLimit(req, config);
      const third = await checkRateLimit(req, config);
      expect(third.allowed).toBe(false);
      expect(third.remaining).toBe(0);
    });

    it('uses fallback id when no valid IP in headers', async () => {
      const req = createRequest();
      const result = await checkRateLimit(req, { windowMs: 60000, maxRequests: 5 });
      expect(result.allowed).toBe(true);
    });
  });
});
