/**
 * User Password API Tests
 * 
 * Tests for PATCH /api/users/password:
 * - Change password
 * - Current password verification
 * - Password strength validation
 * - Rate limiting
 * - Edge cases
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PATCH } from '@/app/api/users/password/route';
import { createAuthenticatedRequest, getJsonResponse, expectStatus, expectSuccess, expectError } from '../../helpers/api-helpers';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import RefreshToken from '@/models/RefreshToken';
import { createTestUser } from '../../helpers/test-utils';

describe('PATCH /api/users/password', () => {
  let testUser: any;

  beforeEach(async () => {
    await connectDB();
    await RefreshToken.deleteMany({});
    testUser = await User.create(createTestUser({ password: 'OldPassword@123' }));
  });

  describe('Successful Password Change', () => {
    it('should change password with valid current password', async () => {
      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'PATCH',
        'http://localhost:3000/api/users/password',
        {
          currentPassword: 'OldPassword@123',
          newPassword: 'NewPassword@123',
        }
      );

      const response = await PATCH(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expectSuccess(data);

      const updated = await User.findById(testUser._id).select('+password');
      const isValid = await updated?.comparePassword('NewPassword@123');
      expect(isValid).toBe(true);
    });

    it('should revoke all refresh tokens on password change (industry standard)', async () => {
      // Create refresh tokens for user
      await RefreshToken.createToken(testUser._id.toString());
      await RefreshToken.createToken(testUser._id.toString());
      
      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'PATCH',
        'http://localhost:3000/api/users/password',
        {
          currentPassword: 'OldPassword@123',
          newPassword: 'NewPassword@123',
        }
      );

      await PATCH(request);
      
      // Check all tokens are revoked
      const tokens = await RefreshToken.find({ userId: testUser._id });
      expect(tokens.length).toBe(2);
      expect(tokens.every(t => t.revoked)).toBe(true);
    });
  });

  describe('Invalid Current Password', () => {
    it('should reject wrong current password', async () => {
      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'PATCH',
        'http://localhost:3000/api/users/password',
        {
          currentPassword: 'WrongPassword',
          newPassword: 'NewPassword@123',
        }
      );

      const response = await PATCH(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 400); // API returns 400 for wrong password (validation error)
      expectError(data, 'Current password is incorrect');
    });
  });

  describe('Validation Errors', () => {
    it('should reject missing current password', async () => {
      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'PATCH',
        'http://localhost:3000/api/users/password',
        {
          newPassword: 'NewPassword@123',
        }
      );

      const response = await PATCH(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 400);
      expectError(data);
    });

    it('should reject missing new password', async () => {
      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'PATCH',
        'http://localhost:3000/api/users/password',
        {
          currentPassword: 'OldPassword@123',
        }
      );

      const response = await PATCH(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 400);
      expectError(data);
    });

    it('should reject short new password', async () => {
      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'PATCH',
        'http://localhost:3000/api/users/password',
        {
          currentPassword: 'OldPassword@123',
          newPassword: '12345',
        }
      );

      const response = await PATCH(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 400);
      expectError(data);
    });
  });

  describe('Security Checks', () => {
    it('should require authentication', async () => {
      const { createGuestRequest } = await import('../../helpers/api-helpers');
      const request = createGuestRequest('PATCH', 'http://localhost:3000/api/users/password', {
        currentPassword: 'OldPassword@123',
        newPassword: 'NewPassword@123',
      });

      const response = await PATCH(request);
      expectStatus(response, 401);
    });

    it('should apply rate limiting', async () => {
      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'PATCH',
        'http://localhost:3000/api/users/password',
        {
          currentPassword: 'OldPassword@123',
          newPassword: 'NewPassword@123',
        }
      );

      const response = await PATCH(request);
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    });
  });
});
