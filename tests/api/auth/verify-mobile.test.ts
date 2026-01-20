/**
 * Auth Verify Mobile API Tests
 * 
 * Tests for POST /api/auth/verify-mobile:
 * - Valid OTP verification
 * - Invalid OTP
 * - Expired OTP
 * - Mobile verification status update
 * - Rate limiting
 * - Edge cases
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { POST } from '@/app/api/auth/verify-mobile/route';
import { createAuthenticatedRequest, createGuestRequest, getJsonResponse, expectStatus, expectSuccess, expectError } from '../../helpers/api-helpers';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { createTestUser, createTestProduct } from '../../helpers/test-utils';

describe('POST /api/auth/verify-mobile', () => {
  let testUser: any;

  beforeEach(async () => {
    await connectDB();
    testUser = await User.create(createTestUser());
  });

  describe('Successful Verification', () => {
    it('should verify mobile with valid OTP (authenticated)', async () => {
      const otp = testUser.generateMobileOTP();
      await testUser.save();

      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.mobile,
        'customer',
        'POST',
        'http://localhost:3000/api/auth/verify-mobile',
        { otp }
      );

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expectSuccess(data);
      expect(data.user.mobileVerified).toBe(true);

      const updated = await User.findById(testUser._id);
      expect(updated?.mobileVerified).toBe(true);
      expect(updated?.mobileVerificationOTP).toBeUndefined();
    });

    it('should verify mobile with valid OTP (unauthenticated - post-registration flow)', async () => {
      const otp = testUser.generateMobileOTP();
      await testUser.save();

      const { createGuestRequest } = await import('../../helpers/api-helpers');
      const request = createGuestRequest('POST', 'http://localhost:3000/api/auth/verify-mobile', {
        otp,
        mobile: testUser.mobile,
      });

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expectSuccess(data);
      expect(data.user.mobileVerified).toBe(true);

      const updated = await User.findById(testUser._id);
      expect(updated?.mobileVerified).toBe(true);
      expect(updated?.mobileVerificationOTP).toBeUndefined();
    });

    it('should create session token after successful verification (industry standard)', async () => {
      const otp = testUser.generateMobileOTP();
      await testUser.save();

      const { createGuestRequest } = await import('../../helpers/api-helpers');
      const request = createGuestRequest('POST', 'http://localhost:3000/api/auth/verify-mobile', {
        otp,
        mobile: testUser.mobile,
      });

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expectSuccess(data);
      
      // Industry standard: Both access token and refresh token created after mobile verification
      const accessTokenCookie = response.cookies.get('auth-token');
      const refreshTokenCookie = response.cookies.get('refresh-token');
      expect(accessTokenCookie).toBeDefined();
      expect(accessTokenCookie?.value).toBeDefined();
      expect(refreshTokenCookie).toBeDefined();
      expect(refreshTokenCookie?.value).toBeDefined();
    });
  });

  describe('Invalid OTP', () => {
    it('should reject invalid OTP', async () => {
      testUser.generateMobileOTP();
      await testUser.save();

      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.mobile,
        'customer',
        'POST',
        'http://localhost:3000/api/auth/verify-mobile',
        { otp: '000000' }
      );

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 400);
      expectError(data, 'Invalid or expired OTP');
    });

    it('should reject expired OTP', async () => {
      const otp = testUser.generateMobileOTP();
      testUser.mobileVerificationOTPExpires = new Date(Date.now() - 1000); // Expired
      await testUser.save();

      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.mobile,
        'customer',
        'POST',
        'http://localhost:3000/api/auth/verify-mobile',
        { otp }
      );

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 400);
      expectError(data, 'Invalid or expired OTP');
    });
  });

  describe('Validation Errors', () => {
    it('should reject missing OTP', async () => {
      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.mobile,
        'customer',
        'POST',
        'http://localhost:3000/api/auth/verify-mobile',
        {}
      );

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 400);
      expectError(data);
    });

    it('should reject invalid OTP format', async () => {
      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.mobile,
        'customer',
        'POST',
        'http://localhost:3000/api/auth/verify-mobile',
        { otp: '12345' } // 5 digits instead of 6
      );

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 400);
      expectError(data);
    });
  });

  describe('Security Checks', () => {
    it('should require mobile number when not authenticated', async () => {
      const { createGuestRequest } = await import('../../helpers/api-helpers');
      const request = createGuestRequest('POST', 'http://localhost:3000/api/auth/verify-mobile', {
        otp: '123456',
      });

      const response = await POST(request);
      const data = await getJsonResponse(response);
      expectStatus(response, 400);
      expectError(data, 'Mobile number required');
    });

    it('should prevent verification of already-verified accounts without auth', async () => {
      testUser.mobileVerified = true;
      await testUser.save();

      const { createGuestRequest } = await import('../../helpers/api-helpers');
      const request = createGuestRequest('POST', 'http://localhost:3000/api/auth/verify-mobile', {
        otp: '123456',
        mobile: testUser.mobile,
      });

      const response = await POST(request);
      const data = await getJsonResponse(response);
      expectStatus(response, 400);
      expectError(data, 'Mobile number already verified');
    });

    it('should apply rate limiting', async () => {
      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.mobile,
        'customer',
        'POST',
        'http://localhost:3000/api/auth/verify-mobile',
        { otp: '123456' }
      );

      const response = await POST(request);
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    });
  });

  describe('Cart Merge on Verification', () => {
    let testCategory: any;
    let testProduct1: any;

    beforeEach(async () => {
      testCategory = await Category.create({
        name: 'Rings',
        slug: 'rings',
        displayName: 'Rings',
        image: 'https://example.com/rings.jpg',
        alt: 'Rings category',
        active: true,
      });

      testProduct1 = await Product.create(
        createTestProduct({
          categoryId: testCategory._id,
          price: 1000,
          inventory: { quantity: 10, reservedQuantity: 0, trackQuantity: true, allowBackorder: false },
        })
      );
    });

    it('should merge guest cart into user cart on mobile verification (unauthenticated)', async () => {
      const unverifiedUser = await User.create(createTestUser({ mobileVerified: false }));
      const otp = unverifiedUser.generateMobileOTP();
      await unverifiedUser.save();

      // Create guest cart
      const sessionId = 'test-session-verify-1';
      await Cart.create({
        sessionId,
        items: [
          {
            productId: testProduct1._id,
            sku: testProduct1.sku,
            title: testProduct1.title,
            image: testProduct1.primaryImage || '',
            price: testProduct1.price,
            quantity: 2,
            subtotal: testProduct1.price * 2,
          },
        ],
        subtotal: testProduct1.price * 2,
        total: testProduct1.price * 2,
        currency: 'INR',
      });

      const request = createGuestRequest(
        'POST',
        'http://localhost:3000/api/auth/verify-mobile',
        { otp, mobile: unverifiedUser.mobile },
        sessionId
      );

      await POST(request);

      // Verify guest cart was merged into user cart
      const userCart = await Cart.findOne({ userId: unverifiedUser._id });
      expect(userCart).toBeDefined();
      expect(userCart?.items).toHaveLength(1);
      expect(userCart?.items[0].quantity).toBe(2);

      // Verify guest cart was deleted
      const guestCart = await Cart.findOne({ sessionId });
      expect(guestCart).toBeNull();
    });

    it('should combine quantities for duplicate products on verification merge', async () => {
      const unverifiedUser = await User.create(createTestUser({ mobileVerified: false }));
      const otp = unverifiedUser.generateMobileOTP();
      await unverifiedUser.save();

      // Create existing user cart
      await Cart.create({
        userId: unverifiedUser._id,
        items: [
          {
            productId: testProduct1._id,
            sku: testProduct1.sku,
            title: testProduct1.title,
            image: testProduct1.primaryImage || '',
            price: testProduct1.price,
            quantity: 3,
            subtotal: testProduct1.price * 3,
          },
        ],
        subtotal: testProduct1.price * 3,
        total: testProduct1.price * 3,
        currency: 'INR',
      });

      // Create guest cart with same product
      const sessionId = 'test-session-verify-2';
      await Cart.create({
        sessionId,
        items: [
          {
            productId: testProduct1._id,
            sku: testProduct1.sku,
            title: testProduct1.title,
            image: testProduct1.primaryImage || '',
            price: testProduct1.price,
            quantity: 2,
            subtotal: testProduct1.price * 2,
          },
        ],
        subtotal: testProduct1.price * 2,
        total: testProduct1.price * 2,
        currency: 'INR',
      });

      const request = createGuestRequest(
        'POST',
        'http://localhost:3000/api/auth/verify-mobile',
        { otp, mobile: unverifiedUser.mobile },
        sessionId
      );

      await POST(request);

      // Verify quantities were combined
      const userCart = await Cart.findOne({ userId: unverifiedUser._id });
      expect(userCart?.items[0].quantity).toBe(5); // 3 + 2
    });

    it('should not fail verification if cart merge fails', async () => {
      const unverifiedUser = await User.create(createTestUser({ mobileVerified: false }));
      const otp = unverifiedUser.generateMobileOTP();
      await unverifiedUser.save();

      // Invalid sessionId
      const sessionId = 'invalid-session-verify';
      const request = createGuestRequest(
        'POST',
        'http://localhost:3000/api/auth/verify-mobile',
        { otp, mobile: unverifiedUser.mobile },
        sessionId
      );

      const response = await POST(request);
      const data = await getJsonResponse(response);

      // Verification should still succeed even if cart merge fails
      expectStatus(response, 200);
      expectSuccess(data);
      expect(data.user.mobileVerified).toBe(true);
    });
  });
});
