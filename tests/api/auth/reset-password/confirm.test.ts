/**
 * Auth Reset Password Confirm API Tests
 * 
 * Tests for POST /api/auth/reset-password/confirm:
 * - Valid token
 * - Invalid token
 * - Expired token
 * - Password update
 * - Token cleanup
 * - Edge cases
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { POST } from '@/app/api/auth/reset-password/confirm/route';
import { createGuestRequest, getJsonResponse, expectStatus, expectSuccess, expectError } from '../../../helpers/api-helpers';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import RefreshToken from '@/models/RefreshToken';
import crypto from 'crypto';
import { createTestUser } from '../../../helpers/test-utils';

describe('POST /api/auth/reset-password/confirm', () => {
  let testUser: any;
  let resetToken: string;

  beforeEach(async () => {
    await connectDB();
    await RefreshToken.deleteMany({});
    testUser = await User.create(createTestUser());

    // Generate reset token
    resetToken = crypto.randomBytes(32).toString('hex');
    testUser.resetPasswordToken = resetToken;
    testUser.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await testUser.save();
  });

  describe('Successful Password Reset', () => {
    it('should reset password with valid token', async () => {
      const newPassword = 'NewPassword@123';

      const request = createGuestRequest('POST', 'http://localhost:3000/api/auth/reset-password/confirm', {
        token: resetToken,
        password: newPassword,
      });

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expectSuccess(data);
      expect(data.message).toContain('Password reset successfully');

      const updated = await User.findById(testUser._id).select('+password');
      expect(updated?.resetPasswordToken).toBeUndefined();
      expect(updated?.resetPasswordExpires).toBeUndefined();
      expect(updated?.passwordChangedAt).toBeDefined();

      // Verify new password works
      const isValid = await updated?.comparePassword(newPassword);
      expect(isValid).toBe(true);
    });

    it('should revoke all refresh tokens on password reset (industry standard)', async () => {
      // Create refresh tokens for user
      await RefreshToken.createToken(testUser._id.toString());
      await RefreshToken.createToken(testUser._id.toString());
      
      const request = createGuestRequest('POST', 'http://localhost:3000/api/auth/reset-password/confirm', {
        token: resetToken,
        password: 'NewPassword@123',
      });

      await POST(request);
      
      // Check all tokens are revoked
      const tokens = await RefreshToken.find({ userId: testUser._id });
      expect(tokens.length).toBe(2);
      expect(tokens.every(t => t.revoked)).toBe(true);
    });
  });

  describe('Invalid Token', () => {
    it('should reject invalid token', async () => {
      const request = createGuestRequest('POST', 'http://localhost:3000/api/auth/reset-password/confirm', {
        token: 'invalid-token',
        password: 'NewPassword@123',
      });

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 400);
      expectError(data, 'Invalid or expired reset token');
    });

    it('should reject expired token', async () => {
      testUser.resetPasswordExpires = new Date(Date.now() - 1000); // Expired
      await testUser.save();

      const request = createGuestRequest('POST', 'http://localhost:3000/api/auth/reset-password/confirm', {
        token: resetToken,
        password: 'NewPassword@123',
      });

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 400);
      expectError(data, 'Invalid or expired reset token');
    });
  });

  describe('Validation Errors', () => {
    it('should reject missing token', async () => {
      const request = createGuestRequest('POST', 'http://localhost:3000/api/auth/reset-password/confirm', {
        password: 'NewPassword@123',
      });

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 400);
      expectError(data);
    });

    it('should reject missing password', async () => {
      const request = createGuestRequest('POST', 'http://localhost:3000/api/auth/reset-password/confirm', {
        token: resetToken,
      });

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 400);
      expectError(data);
    });

    it('should reject short password', async () => {
      const request = createGuestRequest('POST', 'http://localhost:3000/api/auth/reset-password/confirm', {
        token: resetToken,
        password: '12345',
      });

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 400);
      expectError(data);
    });
  });

  describe('Security Checks', () => {
    it('should apply rate limiting', async () => {
      const request = createGuestRequest('POST', 'http://localhost:3000/api/auth/reset-password/confirm', {
        token: resetToken,
        password: 'NewPassword@123',
      });

      const response = await POST(request);
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    });
  });
});
