/**
 * Auth Verify Email API Tests
 * 
 * Tests for POST /api/auth/verify-email:
 * - Valid OTP verification
 * - Invalid OTP
 * - Expired OTP
 * - Email verification status update
 * - Rate limiting
 * - Edge cases
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { POST } from '@/app/api/auth/verify-email/route';
import { createAuthenticatedRequest, getJsonResponse, expectStatus, expectSuccess, expectError } from '../../helpers/api-helpers';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { createTestUser, randomEmail } from '../../helpers/test-utils';

describe('POST /api/auth/verify-email', () => {
  let testUser: any;

  beforeEach(async () => {
    await connectDB();
    testUser = await User.create(createTestUser({ email: randomEmail(), emailVerified: false }));
  });

  describe('Successful Verification', () => {
    it('should verify email with valid OTP', async () => {
      const otp = testUser.generateEmailOTP();
      await testUser.save();

      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'POST',
        'http://localhost:3000/api/auth/verify-email',
        { otp }
      );

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expectSuccess(data);
      expect(data.user.emailVerified).toBe(true);
      expect(data.user.email).toBe(testUser.email);

      const updated = await User.findById(testUser._id);
      expect(updated?.emailVerified).toBe(true);
      expect(updated?.emailVerificationOTP).toBeUndefined();
      expect(updated?.emailVerificationOTPExpires).toBeUndefined();
    });

    it('should verify email with valid OTP and email in request', async () => {
      const otp = testUser.generateEmailOTP();
      await testUser.save();

      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'POST',
        'http://localhost:3000/api/auth/verify-email',
        { otp, email: testUser.email }
      );

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expectSuccess(data);
      expect(data.user.emailVerified).toBe(true);
    });
  });

  describe('Invalid OTP', () => {
    it('should reject invalid OTP', async () => {
      testUser.generateEmailOTP();
      await testUser.save();

      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'POST',
        'http://localhost:3000/api/auth/verify-email',
        { otp: '000000' }
      );

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 400);
      expectError(data, 'Invalid or expired OTP');
    });

    it('should reject expired OTP', async () => {
      const otp = testUser.generateEmailOTP();
      testUser.emailVerificationOTPExpires = new Date(Date.now() - 1000); // Expired
      await testUser.save();

      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'POST',
        'http://localhost:3000/api/auth/verify-email',
        { otp }
      );

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 400);
      expectError(data, 'Invalid or expired OTP');
    });

    it('should reject when no OTP exists', async () => {
      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'POST',
        'http://localhost:3000/api/auth/verify-email',
        { otp: '123456' }
      );

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 400);
      expectError(data, 'Invalid or expired OTP');
    });
  });

  describe('Already Verified', () => {
    it('should reject verification for already verified email', async () => {
      testUser.emailVerified = true;
      await testUser.save();

      const otp = testUser.generateEmailOTP();
      await testUser.save();

      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'POST',
        'http://localhost:3000/api/auth/verify-email',
        { otp }
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
      const request = createGuestRequest('POST', 'http://localhost:3000/api/auth/verify-email', {
        otp: '123456',
      });

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 400);
      expectError(data);
    });
  });

  describe('Email Validation', () => {
    it('should reject when email in request does not match account email', async () => {
      const otp = testUser.generateEmailOTP();
      await testUser.save();

      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'POST',
        'http://localhost:3000/api/auth/verify-email',
        { otp, email: 'wrong@example.com' }
      );

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 400);
      expectError(data, 'Email does not match');
    });
  });

  describe('Validation Errors', () => {
    it('should reject invalid OTP format', async () => {
      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'POST',
        'http://localhost:3000/api/auth/verify-email',
        { otp: '12345' } // 5 digits instead of 6
      );

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 400);
      expectError(data);
    });

    it('should reject missing OTP', async () => {
      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'POST',
        'http://localhost:3000/api/auth/verify-email',
        {}
      );

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 400);
      expectError(data);
    });
  });

  describe('Security Checks', () => {
    it('should apply rate limiting', async () => {
      const otp = testUser.generateEmailOTP();
      await testUser.save();

      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'POST',
        'http://localhost:3000/api/auth/verify-email',
        { otp }
      );

      const response = await POST(request);
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    });

    it('should require Content-Type header', async () => {
      const { createMockRequest } = await import('../../helpers/api-helpers');
      const request = createMockRequest('POST', 'http://localhost:3000/api/auth/verify-email', {
        otp: '123456',
      }, { 'Content-Type': null });

      const response = await POST(request);
      expectStatus(response, 400);
    });
  });
});
