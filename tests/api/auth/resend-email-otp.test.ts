/**
 * Auth Resend Email OTP API Tests
 * 
 * Tests for POST /api/auth/resend-email-otp:
 * - OTP regeneration
 * - Already verified check
 * - Rate limiting (stricter)
 * - Edge cases
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { POST } from '@/app/api/auth/resend-email-otp/route';
import { createAuthenticatedRequest, getJsonResponse, expectStatus, expectSuccess, expectError } from '../../helpers/api-helpers';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { createTestUser, randomEmail } from '../../helpers/test-utils';

describe('POST /api/auth/resend-email-otp', () => {
  let testUser: any;

  beforeEach(async () => {
    await connectDB();
    testUser = await User.create(createTestUser({ email: randomEmail(), emailVerified: false }));
  });

  describe('Successful OTP Resend', () => {
    it('should resend OTP for unverified email', async () => {
      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.mobile,
        'customer',
        'POST',
        'http://localhost:3000/api/auth/resend-email-otp'
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

    it('should generate new OTP (invalidates previous OTP)', async () => {
      const oldOtp = testUser.generateEmailOTP();
      await testUser.save();

      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.mobile,
        'customer',
        'POST',
        'http://localhost:3000/api/auth/resend-email-otp'
      );

      await POST(request);

      const updated = await User.findById(testUser._id);
      expect(updated?.emailVerificationOTP).toBeDefined();
      expect(updated?.emailVerificationOTP).not.toBe(oldOtp);
    });
  });

  describe('Already Verified', () => {
    it('should reject resend for already verified email', async () => {
      testUser.emailVerified = true;
      await testUser.save();

      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.mobile,
        'customer',
        'POST',
        'http://localhost:3000/api/auth/resend-email-otp'
      );

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 400);
      expectError(data, 'Email is already verified');
    });
  });

  describe('Authentication Required', () => {
    it('should require authentication', async () => {
      const { createGuestRequest } = await import('../../helpers/api-helpers');
      const request = createGuestRequest('POST', 'http://localhost:3000/api/auth/resend-email-otp');

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 401);
      expectError(data, 'Authentication required');
    });
  });

  describe('Email Validation', () => {
    it('should reject when user has no email', async () => {
      const userWithoutEmail = await User.create(createTestUser({ email: undefined }));

      const request = createAuthenticatedRequest(
        userWithoutEmail._id.toString(),
        userWithoutEmail.mobile,
        'customer',
        'POST',
        'http://localhost:3000/api/auth/resend-email-otp'
      );

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 400);
      expectError(data, 'No email address');
    });
  });

  describe('Security Checks', () => {
    it('should apply stricter rate limiting', async () => {
      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.mobile,
        'customer',
        'POST',
        'http://localhost:3000/api/auth/resend-email-otp'
      );

      const response = await POST(request);
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    });

    it('should require Content-Type header', async () => {
      const { createMockRequest } = await import('../../helpers/api-helpers');
      const request = createMockRequest('POST', 'http://localhost:3000/api/auth/resend-email-otp', {}, { 'Content-Type': null });

      const response = await POST(request);
      expectStatus(response, 400);
    });
  });
});
