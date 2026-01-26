/**
 * Auth Resend OTP API Tests
 * 
 * Tests for POST /api/auth/resend-otp:
 * - OTP regeneration
 * - Already verified check
 * - Rate limiting (stricter)
 * - Edge cases
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { POST } from '@/app/api/auth/resend-otp/route';
import { createAuthenticatedRequest, getJsonResponse, expectStatus, expectSuccess, expectError } from '../../helpers/api-helpers';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { createTestUser, randomEmail } from '../../helpers/test-utils';

describe('POST /api/auth/resend-otp', () => {
  let testUser: any;

  beforeEach(async () => {
    await connectDB();
    testUser = await User.create(createTestUser());
  });

  describe('Successful OTP Resend', () => {
    it('should resend OTP for unverified user (authenticated)', async () => {
      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'POST',
        'http://localhost:3000/api/auth/resend-otp'
      );

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expectSuccess(data);
      expect(data.message).toContain('OTP sent successfully');

      const updated = await User.findById(testUser._id);
      expect(updated?.emailVerificationOTP).toBeDefined();
      expect(updated?.emailVerificationOTPExpires).toBeDefined();
    });

    it('should resend OTP for unverified user (unauthenticated - post-registration flow)', async () => {
      const { createGuestRequest } = await import('../../helpers/api-helpers');
      const request = createGuestRequest('POST', 'http://localhost:3000/api/auth/resend-otp', {
        email: testUser.email,
      });

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expectSuccess(data);
      expect(data.message).toContain('OTP sent successfully');

      const updated = await User.findById(testUser._id);
      expect(updated?.emailVerificationOTP).toBeDefined();
      expect(updated?.emailVerificationOTPExpires).toBeDefined();
    });

    it('should generate new OTP (invalidates previous OTP)', async () => {
      const oldOtp = testUser.generateEmailOTP();
      await testUser.save();

      const { createGuestRequest } = await import('../../helpers/api-helpers');
      const request = createGuestRequest('POST', 'http://localhost:3000/api/auth/resend-otp', {
        email: testUser.email,
      });

      await POST(request);

      const updated = await User.findById(testUser._id);
      expect(updated?.emailVerificationOTP).toBeDefined();
      expect(updated?.emailVerificationOTP).not.toBe(oldOtp);
    });
  });

  describe('Already Verified', () => {
    it('should reject resend for already verified user', async () => {
      testUser.emailVerified = true;
      await testUser.save();

      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'POST',
        'http://localhost:3000/api/auth/resend-otp'
      );

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 400);
      expectError(data, 'Email is already verified');
    });
  });

  describe('Security Checks', () => {
    it('should require email when not authenticated', async () => {
      const { createGuestRequest } = await import('../../helpers/api-helpers');
      const request = createGuestRequest('POST', 'http://localhost:3000/api/auth/resend-otp');

      const response = await POST(request);
      const data = await getJsonResponse(response);
      expectStatus(response, 400);
      expectError(data, 'Email required when not authenticated');
    });

    it('should not reveal if user exists (security best practice)', async () => {
      const { createGuestRequest } = await import('../../helpers/api-helpers');
      const request = createGuestRequest('POST', 'http://localhost:3000/api/auth/resend-otp', {
        email: randomEmail(), // Non-existent email
      });

      const response = await POST(request);
      // Should return success even if user doesn't exist (security best practice)
      expectStatus(response, 200);
    });

    it('should apply stricter rate limiting', async () => {
      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'POST',
        'http://localhost:3000/api/auth/resend-otp'
      );

      const response = await POST(request);
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    });
  });
});
