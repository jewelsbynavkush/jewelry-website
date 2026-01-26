/**
 * Auth Logout API Tests
 * 
 * Tests for POST /api/auth/logout:
 * - Successful logout
 * - Session clearing
 * - Cookie removal
 * - Edge cases
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { POST } from '@/app/api/auth/logout/route';
import { createAuthenticatedRequest, createGuestRequest, getJsonResponse, expectStatus, expectSuccess } from '../../helpers/api-helpers';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import RefreshToken from '@/models/RefreshToken';
import { createTestUser } from '../../helpers/test-utils';

describe('POST /api/auth/logout', () => {
  let testUser: any;

  beforeEach(async () => {
    await connectDB();
    await RefreshToken.deleteMany({});
    testUser = await User.create(createTestUser());
  });

  describe('Successful Logout', () => {
    it('should logout authenticated user', async () => {
      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'POST',
        'http://localhost:3000/api/auth/logout'
      );

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expectSuccess(data);
      expect(data.message).toContain('Logged out successfully');
    });

    it('should clear both access and refresh token cookies', async () => {
      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'POST',
        'http://localhost:3000/api/auth/logout'
      );

      const response = await POST(request);
      
      // Industry standard: Both cookies should be cleared
      const accessTokenCookie = response.cookies.get('auth-token');
      const refreshTokenCookie = response.cookies.get('refresh-token');
      expect(accessTokenCookie?.value).toBe('');
      expect(refreshTokenCookie?.value).toBe('');
    });

    it('should revoke all refresh tokens on logout (industry standard)', async () => {
      // Create refresh tokens for user
      await RefreshToken.createToken(testUser._id.toString());
      await RefreshToken.createToken(testUser._id.toString());
      
      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'POST',
        'http://localhost:3000/api/auth/logout'
      );

      await POST(request);
      
      // Check all tokens are revoked
      const tokens = await RefreshToken.find({ userId: testUser._id });
      expect(tokens.length).toBe(2);
      expect(tokens.every(t => t.revoked)).toBe(true);
    });

    it('should logout even with invalid token', async () => {
      const request = createGuestRequest('POST', 'http://localhost:3000/api/auth/logout');

      const response = await POST(request);
      const data = await getJsonResponse(response);

      // Should still succeed (logout should always work)
      expectStatus(response, 200);
      expectSuccess(data);
    });
  });

  describe('Security Checks', () => {
    it('should apply security headers', async () => {
      const request = createGuestRequest('POST', 'http://localhost:3000/api/auth/logout');

      const response = await POST(request);
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    });
  });
});
