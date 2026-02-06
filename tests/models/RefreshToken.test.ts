/**
 * RefreshToken Model Tests
 * 
 * Tests for RefreshToken model:
 * - Token creation and hashing
 * - Expiration checks (absolute and idle)
 * - Revocation
 * - Token rotation
 * - Reuse detection
 * - Family tracking
 */

import { describe, it, expect, beforeEach } from 'vitest';
import connectDB from '@/lib/mongodb';
import RefreshToken from '@/models/RefreshToken';
import User from '@/models/User';
import { createTestUser, randomMobile } from '../helpers/test-utils';

describe('RefreshToken Model', () => {
  let testUser: any;

  beforeEach(async () => {
    await connectDB();
    await RefreshToken.deleteMany({});
    await User.deleteMany({});
    
    const mobile = randomMobile();
    testUser = await User.create(createTestUser({ mobile, password: 'Test@123456' }));
  });

  describe('Token Creation', () => {
    it('should create refresh token with hashed storage', async () => {
      const { token, refreshToken } = await RefreshToken.createToken(
        testUser._id.toString(),
        'device-123',
        'Mozilla/5.0',
        '192.168.1.1'
      );

      expect(token).toBeDefined();
      expect(token.length).toBe(64); // 32 bytes hex = 64 chars
      expect(refreshToken.token).toBeDefined();
      expect(refreshToken.token).not.toBe(token); // Stored token is hashed
      expect(refreshToken.userId.toString()).toBe(testUser._id.toString());
      expect(refreshToken.deviceId).toBe('device-123');
      expect(refreshToken.userAgent).toBe('Mozilla/5.0');
      expect(refreshToken.ipAddress).toBe('192.168.1.1');
      expect(refreshToken.familyId).toBeDefined();
    });

    it('should set expiration to 30 days', async () => {
      const { refreshToken } = await RefreshToken.createToken(testUser._id.toString());
      
      const expiresAt = refreshToken.expiresAt.getTime();
      const now = Date.now();
      const expectedExpiry = now + (30 * 24 * 60 * 60 * 1000);
      
      // Allow 2 second tolerance for async operations
      expect(Math.abs(expiresAt - expectedExpiry)).toBeLessThan(2000);
    });

    it('should set lastUsedAt to current time', async () => {
      const before = Date.now();
      const { refreshToken } = await RefreshToken.createToken(testUser._id.toString());
      const after = Date.now();
      
      const lastUsed = refreshToken.lastUsedAt.getTime();
      expect(lastUsed).toBeGreaterThanOrEqual(before);
      expect(lastUsed).toBeLessThanOrEqual(after);
    });
  });

  describe('Token Validation', () => {
    it('should find token by plain token value', async () => {
      const { token } = await RefreshToken.createToken(testUser._id.toString());
      
      const found = await RefreshToken.findByToken(token);
      expect(found).toBeDefined();
      expect(found?.userId.toString()).toBe(testUser._id.toString());
    });

    it('should return null for invalid token', async () => {
      const found = await RefreshToken.findByToken('invalid-token');
      expect(found).toBeNull();
    });

    it('should return null for revoked token', async () => {
      const { token, refreshToken } = await RefreshToken.createToken(testUser._id.toString());
      await refreshToken.markRevoked();
      
      const found = await RefreshToken.findByToken(token);
      expect(found).toBeNull();
    });
  });

  describe('Expiration Checks', () => {
    it('should detect expired token (absolute expiration)', async () => {
      const { refreshToken } = await RefreshToken.createToken(testUser._id.toString());
      
      // Set expiration to past
      refreshToken.expiresAt = new Date(Date.now() - 1000);
      await refreshToken.save();
      
      expect(refreshToken.isExpired()).toBe(true);
      expect(refreshToken.isValid()).toBe(false);
    });

    it('should detect idle expired token (7 days unused)', async () => {
      const { refreshToken } = await RefreshToken.createToken(testUser._id.toString());
      
      // Set lastUsedAt to 8 days ago
      refreshToken.lastUsedAt = new Date(Date.now() - (8 * 24 * 60 * 60 * 1000));
      await refreshToken.save();
      
      expect(refreshToken.isIdleExpired()).toBe(true);
      expect(refreshToken.isValid()).toBe(false);
    });

    it('should detect valid token', async () => {
      const { refreshToken } = await RefreshToken.createToken(testUser._id.toString());
      
      expect(refreshToken.isExpired()).toBe(false);
      expect(refreshToken.isIdleExpired()).toBe(false);
      expect(refreshToken.isRevoked()).toBe(false);
      expect(refreshToken.isValid()).toBe(true);
    });
  });

  describe('Token Revocation', () => {
    it('should mark token as revoked', async () => {
      const { refreshToken } = await RefreshToken.createToken(testUser._id.toString());
      
      await refreshToken.markRevoked();
      
      expect(refreshToken.revoked).toBe(true);
      expect(refreshToken.revokedAt).toBeDefined();
    });

    it('should mark token as revoked with replacement reference', async () => {
      const { refreshToken: oldToken } = await RefreshToken.createToken(testUser._id.toString());
      const { refreshToken: newToken } = await RefreshToken.createToken(testUser._id.toString());
      
      await oldToken.markRevoked(newToken._id);
      
      expect(oldToken.revoked).toBe(true);
      expect(oldToken.replacedBy?.toString()).toBe(newToken._id.toString());
    });

    it('should revoke all user tokens', async () => {
      await RefreshToken.createToken(testUser._id.toString());
      await RefreshToken.createToken(testUser._id.toString());
      const { refreshToken: token3 } = await RefreshToken.createToken(testUser._id.toString());
      
      // Exclude token3 by its ObjectId
      await RefreshToken.revokeUserTokens(testUser._id.toString(), token3._id.toString());
      
      const tokens = await RefreshToken.find({ userId: testUser._id });
      const revokedCount = tokens.filter(t => t.revoked).length;
      expect(revokedCount).toBe(2); // 2 revoked, 1 kept
    });

    it('should revoke entire token family', async () => {
      const { refreshToken: token1 } = await RefreshToken.createToken(testUser._id.toString());
      const familyId = token1.familyId;
      
      // Create another token with same family (simulating rotation)
      const { refreshToken: token2 } = await RefreshToken.createToken(testUser._id.toString());
      token2.familyId = familyId;
      await token2.save();
      
      await RefreshToken.revokeTokenFamily(familyId);
      
      const updated1 = await RefreshToken.findById(token1._id);
      const updated2 = await RefreshToken.findById(token2._id);
      
      expect(updated1?.revoked).toBe(true);
      expect(updated2?.revoked).toBe(true);
    });
  });

  describe('Token Rotation', () => {
    it('should create new token with same family ID for rotation', async () => {
      const { refreshToken: oldToken } = await RefreshToken.createToken(testUser._id.toString());
      const oldFamilyId = oldToken.familyId;
      
      // Simulate rotation: create new token, update family ID
      const { refreshToken: newToken } = await RefreshToken.createToken(testUser._id.toString());
      newToken.familyId = oldFamilyId;
      await newToken.save();
      
      await oldToken.markRevoked(newToken._id);
      
      expect(newToken.familyId).toBe(oldFamilyId);
      expect(oldToken.revoked).toBe(true);
      expect(oldToken.replacedBy?.toString()).toBe(newToken._id.toString());
    });
  });

  describe('Cleanup', () => {
    it('should cleanup expired tokens', async () => {
      const { refreshToken } = await RefreshToken.createToken(testUser._id.toString());
      refreshToken.expiresAt = new Date(Date.now() - 1000);
      await refreshToken.save();
      
      const deletedCount = await RefreshToken.cleanupExpiredTokens();
      expect(deletedCount).toBeGreaterThan(0);
      
      const found = await RefreshToken.findById(refreshToken._id);
      expect(found).toBeNull();
    });

    it('should cleanup revoked tokens older than 7 days', async () => {
      const { refreshToken } = await RefreshToken.createToken(testUser._id.toString());
      await refreshToken.markRevoked();
      refreshToken.revokedAt = new Date(Date.now() - (8 * 24 * 60 * 60 * 1000));
      await refreshToken.save();
      
      const deletedCount = await RefreshToken.cleanupExpiredTokens();
      expect(deletedCount).toBeGreaterThan(0);
    });
  });
});
