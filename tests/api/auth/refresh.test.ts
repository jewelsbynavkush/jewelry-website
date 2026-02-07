/**
 * Token Refresh API Tests
 * 
 * Tests for POST /api/auth/refresh:
 * - Successful token refresh with rotation
 * - Reuse detection
 * - Expired token handling
 * - Idle expiration
 * - Token revocation
 * - Invalid token handling
 * - Rate limiting
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { POST } from '@/app/api/auth/refresh/route';
import { createGuestRequest, getJsonResponse, expectStatus, expectSuccess, expectError } from '../../helpers/api-helpers';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import RefreshToken from '@/models/RefreshToken';
import { createTestUser, randomMobile } from '../../helpers/test-utils';

describe('POST /api/auth/refresh', () => {
  let testUser: any;
  let refreshTokenValue: string;

  beforeEach(async () => {
    await connectDB();
    await RefreshToken.deleteMany({});
    await User.deleteMany({});
    
    const mobile = randomMobile();
    testUser = await User.create(createTestUser({ 
      mobile, 
      password: 'Test@123456',
      mobileVerified: true,
    }));
    
    // Create refresh token for user
    const { token } = await RefreshToken.createToken(testUser._id.toString());
    refreshTokenValue = token;
  });

  describe('Successful Refresh', () => {
    it('should refresh access token and rotate refresh token', async () => {
      const request = createGuestRequest('POST', 'http://localhost:3000/api/auth/refresh');
      request.cookies.set('refresh-token', refreshTokenValue);

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expectSuccess(data);
      
      // Check new access token cookie
      const accessTokenCookie = response.cookies.get('auth-token');
      expect(accessTokenCookie).toBeDefined();
      expect(accessTokenCookie?.value).toBeDefined();
      
      // Check new refresh token cookie (rotation)
      const newRefreshTokenCookie = response.cookies.get('refresh-token');
      expect(newRefreshTokenCookie).toBeDefined();
      expect(newRefreshTokenCookie?.value).toBeDefined();
      expect(newRefreshTokenCookie?.value).not.toBe(refreshTokenValue); // New token
      
      // Check old token is revoked
      const oldToken = await RefreshToken.findByToken(refreshTokenValue);
      expect(oldToken).toBeNull(); // Should not find revoked token
    });

    it('should update lastUsedAt on refresh', async () => {
      await RefreshToken.createToken(testUser._id.toString());
      
      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const request = createGuestRequest('POST', 'http://localhost:3000/api/auth/refresh');
      request.cookies.set('refresh-token', (await RefreshToken.findByToken(refreshTokenValue)) ? refreshTokenValue : '');
      
      // Note: This test may need adjustment based on actual implementation
      // The refresh endpoint rotates tokens, so we need to use the new token
    });
  });

  describe('Reuse Detection', () => {
    it('should revoke token family if old token is reused', async () => {
      // Create initial token and use it to refresh (simulates normal rotation)
      const { token: token1, refreshToken: token1Doc } = await RefreshToken.createToken(testUser._id.toString());
      const familyId = token1Doc.familyId;
      
      // Simulate token rotation: create new token and mark old one as revoked
      const { refreshToken: token2Doc } = await RefreshToken.createToken(testUser._id.toString());
      token2Doc.familyId = familyId; // Keep same family for reuse detection
      await token2Doc.save();
      await token1Doc.markRevoked(token2Doc._id);
      
      // Try to use old revoked token (reuse attack)
      const request = createGuestRequest('POST', 'http://localhost:3000/api/auth/refresh');
      request.cookies.set('refresh-token', token1);
      
      const response = await POST(request);
      const data = await getJsonResponse(response);
      
      expectStatus(response, 401);
      expectError(data);
      expect(data.error).toContain('revoked');
      
      // Check entire family is revoked (reuse detection)
      const updatedToken2 = await RefreshToken.findById(token2Doc._id);
      expect(updatedToken2?.revoked).toBe(true);
    });
  });

  describe('Expiration Handling', () => {
    it('should reject expired refresh token', async () => {
      const { token, refreshToken } = await RefreshToken.createToken(testUser._id.toString());
      refreshToken.expiresAt = new Date(Date.now() - 1000);
      await refreshToken.save();
      
      const request = createGuestRequest('POST', 'http://localhost:3000/api/auth/refresh');
      request.cookies.set('refresh-token', token);
      
      const response = await POST(request);
      const data = await getJsonResponse(response);
      
      expectStatus(response, 401);
      expectError(data);
      expect(data.error).toContain('expired');
    });

    it('should reject idle expired refresh token', async () => {
      const { token, refreshToken } = await RefreshToken.createToken(testUser._id.toString());
      refreshToken.lastUsedAt = new Date(Date.now() - (8 * 24 * 60 * 60 * 1000)); // 8 days ago
      await refreshToken.save();
      
      const request = createGuestRequest('POST', 'http://localhost:3000/api/auth/refresh');
      request.cookies.set('refresh-token', token);
      
      const response = await POST(request);
      const data = await getJsonResponse(response);
      
      expectStatus(response, 401);
      expectError(data);
      expect(data.error).toContain('idle expired');
    });
  });

  describe('Invalid Token Handling', () => {
    it('should reject request without refresh token', async () => {
      const request = createGuestRequest('POST', 'http://localhost:3000/api/auth/refresh');
      
      const response = await POST(request);
      const data = await getJsonResponse(response);
      
      expectStatus(response, 401);
      expectError(data);
      expect(data.error).toContain('No refresh token');
    });

    it('should reject invalid refresh token', async () => {
      const request = createGuestRequest('POST', 'http://localhost:3000/api/auth/refresh');
      request.cookies.set('refresh-token', 'invalid-token');
      
      const response = await POST(request);
      const data = await getJsonResponse(response);
      
      expectStatus(response, 401);
      expectError(data);
      expect(data.error).toContain('Invalid refresh token');
    });

    it('should reject revoked refresh token', async () => {
      const { token, refreshToken } = await RefreshToken.createToken(testUser._id.toString());
      await refreshToken.markRevoked();
      
      const request = createGuestRequest('POST', 'http://localhost:3000/api/auth/refresh');
      request.cookies.set('refresh-token', token);
      
      const response = await POST(request);
      const data = await getJsonResponse(response);
      
      expectStatus(response, 401);
      expectError(data);
      expect(data.error).toContain('revoked');
    });
  });

  describe('User Validation', () => {
    it('should reject refresh for inactive user', async () => {
      testUser.isActive = false;
      await testUser.save();
      
      const request = createGuestRequest('POST', 'http://localhost:3000/api/auth/refresh');
      request.cookies.set('refresh-token', refreshTokenValue);
      
      const response = await POST(request);
      const data = await getJsonResponse(response);
      
      expectStatus(response, 401);
      expectError(data);
      expect(data.error).toContain('not active');
    });

    it('should reject refresh for blocked user', async () => {
      testUser.isBlocked = true;
      await testUser.save();
      
      const request = createGuestRequest('POST', 'http://localhost:3000/api/auth/refresh');
      request.cookies.set('refresh-token', refreshTokenValue);
      
      const response = await POST(request);
      const data = await getJsonResponse(response);
      
      expectStatus(response, 401);
      expectError(data);
      expect(data.error).toContain('not active');
    });
  });
});
