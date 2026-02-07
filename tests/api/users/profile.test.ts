/**
 * User Profile API Tests
 * 
 * Tests for User Profile operations:
 * - GET /api/users/profile (get profile)
 * - PATCH /api/users/profile (update profile)
 * - Email uniqueness
 * - Email verification reset
 * - Edge cases
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GET, PATCH } from '@/app/api/users/profile/route';
import { createAuthenticatedRequest, getJsonResponse, expectStatus, expectSuccess, expectError } from '../../helpers/api-helpers';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { createTestUser, randomEmail } from '../../helpers/test-utils';

describe('User Profile API', () => {
  let testUser: any;

  beforeEach(async () => {
    await connectDB();
    testUser = await User.create(createTestUser());
  });

  describe('GET /api/users/profile', () => {
    it('should get user profile', async () => {
      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'GET',
        'http://localhost:3000/api/users/profile'
      );

      const response = await GET(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expect(data.user).toBeDefined();
      expect(data.user.id).toBe(testUser._id.toString());
      expect(data.user.email).toBe(testUser.email);
      expect(data.user.firstName).toBe(testUser.firstName);
    });

    it('should require authentication', async () => {
      const { createGuestRequest } = await import('../../helpers/api-helpers');
      const request = createGuestRequest('GET', 'http://localhost:3000/api/users/profile');

      const response = await GET(request);
      expectStatus(response, 401);
    });
  });

  describe('PATCH /api/users/profile', () => {
    it('should update profile fields', async () => {
      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'PATCH',
        'http://localhost:3000/api/users/profile',
        {
          firstName: 'Updated',
          lastName: 'Name',
        }
      );

      const response = await PATCH(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expectSuccess(data);
      expect(data.user.firstName).toBe('Updated');
      expect(data.user.lastName).toBe('Name');

      const updated = await User.findById(testUser._id);
      expect(updated?.firstName).toBe('Updated');
    });

    it('should update email and reset verification', async () => {
      const newEmail = randomEmail();
      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'PATCH',
        'http://localhost:3000/api/users/profile',
        {
          email: newEmail,
        }
      );

      const response = await PATCH(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expect(data.user.email).toBe(newEmail);
      expect(data.user.emailVerified).toBe(false);

      const updated = await User.findById(testUser._id);
      expect(updated?.email).toBe(newEmail);
      expect(updated?.emailVerified).toBe(false);
      expect(updated?.emailVerificationOTP).toBeDefined();
      expect(updated?.emailVerificationOTPExpires).toBeDefined();
    });

    it('should reject duplicate email', async () => {
      await User.create(createTestUser({ email: 'existing@example.com' }));

      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'PATCH',
        'http://localhost:3000/api/users/profile',
        {
          email: 'existing@example.com',
        }
      );

      const response = await PATCH(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 400);
      expectError(data, 'Email already in use');
    });

    it('should allow updating to same email', async () => {
      testUser.email = 'test@example.com';
      await testUser.save();

      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'PATCH',
        'http://localhost:3000/api/users/profile',
        {
          email: 'test@example.com',
        }
      );

      const response = await PATCH(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expect(data.user.email).toBe('test@example.com');
    });

    it('should validate email format', async () => {
      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'PATCH',
        'http://localhost:3000/api/users/profile',
        {
          email: 'invalid-email',
        }
      );

      const response = await PATCH(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 400);
      expectError(data);
    });
  });
});
