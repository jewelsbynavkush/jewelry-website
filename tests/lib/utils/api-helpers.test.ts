import { describe, it, expect } from 'vitest';
import { getPaginationParams } from '@/lib/utils/api-helpers';
import { validateObjectIdParam, validateSlugParam, getSessionId } from '@/lib/utils/api-helpers';
import type { NextRequest } from 'next/server';
import mongoose from 'mongoose';

describe('api-helpers', () => {
  describe('getPaginationParams', () => {
    it('returns default limit 20 and page 1 when no params', () => {
      const params = new URLSearchParams();
      const result = getPaginationParams(params);
      expect(result).toEqual({ limit: 20, page: 1 });
    });

    it('uses limit and page from search params', () => {
      const params = new URLSearchParams({ limit: '10', page: '2' });
      const result = getPaginationParams(params);
      expect(result).toEqual({ limit: 10, page: 2 });
    });

    it('clamps limit to max 100', () => {
      const params = new URLSearchParams({ limit: '200' });
      const result = getPaginationParams(params);
      expect(result.limit).toBe(100);
    });

    it('clamps limit to min 1', () => {
      const params = new URLSearchParams({ limit: '0' });
      const result = getPaginationParams(params);
      expect(result.limit).toBe(1);
    });

    it('clamps page to min 1', () => {
      const params = new URLSearchParams({ page: '0' });
      const result = getPaginationParams(params);
      expect(result.page).toBe(1);
    });

    it('handles invalid limit string with fallback to 20', () => {
      const params = new URLSearchParams({ limit: 'invalid' });
      const result = getPaginationParams(params);
      expect(result.limit).toBe(20);
    });
  });

  describe('validateObjectIdParam', () => {
    function mockRequest(): NextRequest {
      return {
        nextUrl: new URL('http://localhost/api'),
        url: 'http://localhost/api',
        method: 'GET',
        headers: new Headers(),
      } as unknown as NextRequest;
    }

    it('returns value for valid ObjectId', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const result = await validateObjectIdParam(id, 'id', mockRequest());
      expect('value' in result && result.value).toBe(id);
    });

    it('returns error response for invalid ObjectId', async () => {
      const result = await validateObjectIdParam('not-valid', 'id', mockRequest());
      expect('error' in result).toBe(true);
      const res = (result as { error: Response }).error;
      expect(res.status).toBe(400);
    });
  });

  describe('validateSlugParam', () => {
    function mockRequest(): NextRequest {
      return {
        nextUrl: new URL('http://localhost/api'),
        url: 'http://localhost/api',
        method: 'GET',
        headers: new Headers(),
      } as unknown as NextRequest;
    }

    it('returns value for valid slug', async () => {
      const result = await validateSlugParam('valid-slug', 'slug', mockRequest());
      expect('value' in result && result.value).toBe('valid-slug');
    });

    it('returns error for invalid slug', async () => {
      const result = await validateSlugParam('invalid slug!', 'slug', mockRequest());
      expect('error' in result).toBe(true);
      const res = (result as { error: Response }).error;
      expect(res.status).toBe(400);
    });
  });

  describe('getSessionId', () => {
    it('returns session-id from cookie when present', () => {
      const request = {
        cookies: {
          get: (name: string) => (name === 'session-id' ? { value: 'existing-session' } : undefined),
        },
      } as unknown as NextRequest;
      expect(getSessionId(request)).toBe('existing-session');
    });

    it('returns new ObjectId string when no session cookie', () => {
      const request = {
        cookies: { get: () => undefined },
      } as unknown as NextRequest;
      const id = getSessionId(request);
      expect(id).toBeTruthy();
      expect(mongoose.Types.ObjectId.isValid(id)).toBe(true);
    });
  });
});
