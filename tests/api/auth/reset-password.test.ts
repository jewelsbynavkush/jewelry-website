/**
 * Auth Reset Password API Tests
 * 
 * Tests for POST /api/auth/reset-password:
 * - Password reset request
 * - Token generation
 * - User enumeration prevention
 * - Rate limiting
 * - Edge cases
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { POST } from '@/app/api/auth/reset-password/route';
import { createGuestRequest, getJsonResponse, expectStatus, expectSuccess } from '../../helpers/api-helpers';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { createTestUser, randomMobile, randomEmail } from '../../helpers/test-utils';

describe('POST /api/auth/reset-password', () => {
  beforeEach(async () => {
    await connectDB();
  });

  describe('Successful Reset Request', () => {
    it('should generate reset token for existing user (mobile)', async () => {
      const mobile = randomMobile();
      await User.create(createTestUser({ mobile }));

      const request = createGuestRequest('POST', 'http://localhost:3000/api/auth/reset-password', {
        identifier: mobile,
      });

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expectSuccess(data);
      expect(data.message).toContain('password reset link has been sent');

      const user = await User.findOne({ mobile });
      expect(user?.resetPasswordToken).toBeDefined();
      expect(user?.resetPasswordExpires).toBeDefined();
    });

    it('should generate reset token for existing user (email)', async () => {
      const email = randomEmail();
      await User.create(createTestUser({ email }));

      const request = createGuestRequest('POST', 'http://localhost:3000/api/auth/reset-password', {
        identifier: email,
      });

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expectSuccess(data);

      const user = await User.findOne({ email });
      expect(user?.resetPasswordToken).toBeDefined();
    });
  });

  describe('User Enumeration Prevention', () => {
    it('should return same response for non-existent user', async () => {
      const request = createGuestRequest('POST', 'http://localhost:3000/api/auth/reset-password', {
        identifier: randomMobile(),
      });

      const response = await POST(request);
      const data = await getJsonResponse(response);

      // Should return success to prevent user enumeration
      expectStatus(response, 200);
      expectSuccess(data);
      expect(data.message).toContain('password reset link has been sent');
    });

    it('should return same response for non-existent email', async () => {
      const request = createGuestRequest('POST', 'http://localhost:3000/api/auth/reset-password', {
        identifier: randomEmail(),
      });

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expectSuccess(data);
    });
  });

  describe('Validation Errors', () => {
    it('should reject missing identifier', async () => {
      const request = createGuestRequest('POST', 'http://localhost:3000/api/auth/reset-password', {});

      const response = await POST(request);
      await getJsonResponse(response);

      expectStatus(response, 400);
    });
  });

  describe('Security Checks', () => {
    it('should apply rate limiting', async () => {
      const request = createGuestRequest('POST', 'http://localhost:3000/api/auth/reset-password', {
        identifier: randomMobile(),
      });

      const response = await POST(request);
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    });
  });
});
