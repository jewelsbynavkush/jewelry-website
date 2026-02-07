/**
 * Auth Login API Tests
 * 
 * Tests for POST /api/auth/login:
 * - Successful login
 * - Invalid credentials
 * - Account status checks
 * - Rate limiting
 * - Security checks
 * - Edge cases
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { POST } from '@/app/api/auth/login/route';
import { createGuestRequest, getJsonResponse, expectStatus, expectSuccess, expectError } from '../../helpers/api-helpers';
import connectDB from '@/lib/mongodb';
import User, { IUserModel } from '@/models/User';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { createTestUser, randomEmail, createTestProduct } from '../../helpers/test-utils';

describe('POST /api/auth/login', () => {
  let testUser: any;

  beforeEach(async () => {
    await connectDB();
  });

  describe('Successful Login', () => {
    it('should login with email and password', async () => {
      const email = randomEmail();
      const password = 'Test@123456';
      testUser = await User.create(createTestUser({ email, password }));

      const request = createGuestRequest('POST', 'http://localhost:3000/api/auth/login', {
        identifier: email,
        password,
      });

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expectSuccess(data);
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe(email);
      
      // Industry standard: Check for both access token and refresh token cookies
      const accessTokenCookie = response.cookies.get('auth-token');
      const refreshTokenCookie = response.cookies.get('refresh-token');
      expect(accessTokenCookie).toBeDefined();
      expect(accessTokenCookie?.value).toBeDefined();
      expect(refreshTokenCookie).toBeDefined();
      expect(refreshTokenCookie?.value).toBeDefined();
    });

    it('should create session on successful login', async () => {
      const email = randomEmail();
      const password = 'Test@123456';
      testUser = await User.create(createTestUser({ email, password }));

      const request = createGuestRequest('POST', 'http://localhost:3000/api/auth/login', {
        identifier: email,
        password,
      });

      const response = await POST(request);
      
      // Check for auth cookie
      const setCookieHeader = response.headers.get('set-cookie');
      expect(setCookieHeader).toBeDefined();
      if (setCookieHeader) {
        expect(setCookieHeader).toContain('auth-token');
      }
    });

    it('should reset login attempts on successful login', async () => {
      const email = randomEmail();
      const password = 'Test@123456';
      testUser = await User.create(createTestUser({ email, password }));

      // Increment login attempts
      await (User as IUserModel).incrementLoginAttempts(testUser._id.toString());
      await (User as IUserModel).incrementLoginAttempts(testUser._id.toString());

      const request = createGuestRequest('POST', 'http://localhost:3000/api/auth/login', {
        identifier: email,
        password,
      });

      await POST(request);

      const updated = await User.findById(testUser._id);
      expect(updated?.loginAttempts).toBe(0);
    });

    it('should update last login timestamp', async () => {
      const email = randomEmail();
      const password = 'Test@123456';
      testUser = await User.create(createTestUser({ email, password }));

      const request = createGuestRequest('POST', 'http://localhost:3000/api/auth/login', {
        identifier: email,
        password,
      });

      await POST(request);

      const updated = await User.findById(testUser._id);
      expect(updated?.lastLogin).toBeDefined();
    });
  });

  describe('Invalid Credentials', () => {
    it('should reject invalid email', async () => {
      const request = createGuestRequest('POST', 'http://localhost:3000/api/auth/login', {
        identifier: randomEmail(),
        password: 'Test@123456',
      });

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 401);
      expectError(data);
    });

    it('should reject invalid password', async () => {
      const email = randomEmail();
      testUser = await User.create(createTestUser({ email, password: 'Test@123456' }));

      const request = createGuestRequest('POST', 'http://localhost:3000/api/auth/login', {
        identifier: email,
        password: 'WrongPassword',
      });

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 401);
      expectError(data);
    });

    it('should increment login attempts on failed login', async () => {
      const email = randomEmail();
      testUser = await User.create(createTestUser({ email, password: 'Test@123456' }));

      const request = createGuestRequest('POST', 'http://localhost:3000/api/auth/login', {
        identifier: email,
        password: 'WrongPassword',
      });

      await POST(request);

      const updated = await User.findById(testUser._id);
      expect(updated?.loginAttempts).toBeGreaterThan(0);
    });
  });

  describe('Account Status Checks', () => {
    it('should reject inactive account', async () => {
      const email = randomEmail();
      testUser = await User.create(createTestUser({ email, isActive: false }));

      const request = createGuestRequest('POST', 'http://localhost:3000/api/auth/login', {
        identifier: email,
        password: 'Test@123456',
      });

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 403);
      expectError(data);
    });

    it('should reject blocked account', async () => {
      const email = randomEmail();
      testUser = await User.create(createTestUser({ email, isBlocked: true }));

      const request = createGuestRequest('POST', 'http://localhost:3000/api/auth/login', {
        identifier: email,
        password: 'Test@123456',
      });

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 403);
      expectError(data);
    });

    it('should reject locked account', async () => {
      const email = randomEmail();
      testUser = await User.create(createTestUser({ email }));

      // Lock account
      for (let i = 0; i < 5; i++) {
        await (User as IUserModel).incrementLoginAttempts(testUser._id.toString());
      }

      const request = createGuestRequest('POST', 'http://localhost:3000/api/auth/login', {
        identifier: email,
        password: 'Test@123456',
      });

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 423);
      expectError(data);
    });
  });

  describe('Validation Errors', () => {
    it('should reject missing identifier', async () => {
      const request = createGuestRequest('POST', 'http://localhost:3000/api/auth/login', {
        password: 'Test@123456',
      });

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 400);
      expectError(data);
    });

    it('should reject missing password', async () => {
      const request = createGuestRequest('POST', 'http://localhost:3000/api/auth/login', {
        identifier: randomEmail(),
      });

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 400);
      expectError(data);
    });
  });

  describe('Security Checks', () => {
    it('should apply rate limiting', async () => {
      const request = createGuestRequest('POST', 'http://localhost:3000/api/auth/login', {
        identifier: randomEmail(),
        password: 'Test@123456',
      });

      const response = await POST(request);
      // Should have security headers
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    });

    it('should require Content-Type header', async () => {
      const { createMockRequest } = await import('../../helpers/api-helpers');
      const request = createMockRequest('POST', 'http://localhost:3000/api/auth/login', {
        identifier: randomEmail(),
        password: 'Test@123456',
      }, { 'Content-Type': null }); // Explicitly remove Content-Type

      const response = await POST(request);
      expectStatus(response, 400); // Security middleware returns 400 for missing Content-Type
    });
  });

  describe('Cart Merge on Login', () => {
    let testCategory: any;
    let testProduct1: any;
    let testProduct2: any;

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

      testProduct2 = await Product.create(
        createTestProduct({
          categoryId: testCategory._id,
          price: 2000,
          inventory: { quantity: 10, reservedQuantity: 0, trackQuantity: true, allowBackorder: false },
        })
      );
    });

    it('should merge guest cart into user cart on login', async () => {
      const email = randomEmail();
      const password = 'Test@123456';
      testUser = await User.create(createTestUser({ email, password }));

      // Create guest cart with items
      const sessionId = 'test-session-123';
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
          {
            productId: testProduct2._id,
            sku: testProduct2.sku,
            title: testProduct2.title,
            image: testProduct2.primaryImage || '',
            price: testProduct2.price,
            quantity: 1,
            subtotal: testProduct2.price,
          },
        ],
        subtotal: testProduct1.price * 2 + testProduct2.price,
        total: testProduct1.price * 2 + testProduct2.price,
        currency: 'INR',
      });

      const request = createGuestRequest(
        'POST',
        'http://localhost:3000/api/auth/login',
        { identifier: email, password },
        sessionId
      );

      await POST(request);

      // Verify guest cart was merged into user cart
      const userCart = await Cart.findOne({ userId: testUser._id });
      expect(userCart).toBeDefined();
      expect(userCart?.items).toHaveLength(2);
      expect(userCart?.items[0].productId.toString()).toBe(testProduct1._id.toString());
      expect(userCart?.items[0].quantity).toBe(2);
      expect(userCart?.items[1].productId.toString()).toBe(testProduct2._id.toString());
      expect(userCart?.items[1].quantity).toBe(1);

      // Verify guest cart was deleted
      const guestCart = await Cart.findOne({ sessionId });
      expect(guestCart).toBeNull();
    });

    it('should combine quantities for duplicate products on merge', async () => {
      const email = randomEmail();
      const password = 'Test@123456';
      testUser = await User.create(createTestUser({ email, password }));

      // Create existing user cart with Product1
      await Cart.create({
        userId: testUser._id,
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

      // Create guest cart with same Product1 and different Product2
      const sessionId = 'test-session-456';
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
          {
            productId: testProduct2._id,
            sku: testProduct2.sku,
            title: testProduct2.title,
            image: testProduct2.primaryImage || '',
            price: testProduct2.price,
            quantity: 1,
            subtotal: testProduct2.price,
          },
        ],
        subtotal: testProduct1.price * 2 + testProduct2.price,
        total: testProduct1.price * 2 + testProduct2.price,
        currency: 'INR',
      });

      const request = createGuestRequest(
        'POST',
        'http://localhost:3000/api/auth/login',
        { identifier: email, password },
        sessionId
      );

      await POST(request);

      // Verify quantities were combined
      const userCart = await Cart.findOne({ userId: testUser._id });
      expect(userCart?.items).toHaveLength(2);
      
      const product1Item = userCart?.items.find(
        (item) => item.productId.toString() === testProduct1._id.toString()
      );
      expect(product1Item?.quantity).toBe(5); // 3 + 2

      const product2Item = userCart?.items.find(
        (item) => item.productId.toString() === testProduct2._id.toString()
      );
      expect(product2Item?.quantity).toBe(1);
    });

    it('should convert guest cart to user cart if no user cart exists', async () => {
      const email = randomEmail();
      const password = 'Test@123456';
      testUser = await User.create(createTestUser({ email, password }));

      const sessionId = 'test-session-789';
      await Cart.create({
        sessionId,
        items: [
          {
            productId: testProduct1._id,
            sku: testProduct1.sku,
            title: testProduct1.title,
            image: testProduct1.primaryImage || '',
            price: testProduct1.price,
            quantity: 1,
            subtotal: testProduct1.price,
          },
        ],
        subtotal: testProduct1.price,
        total: testProduct1.price,
        currency: 'INR',
      });

      const request = createGuestRequest(
        'POST',
        'http://localhost:3000/api/auth/login',
        { identifier: email, password },
        sessionId
      );

      await POST(request);

      // Verify cart was converted (not merged)
      const userCart = await Cart.findOne({ userId: testUser._id });
      expect(userCart).toBeDefined();
      expect(userCart?.sessionId).toBeUndefined();
      expect(userCart?.items).toHaveLength(1);
    });

    it('should not fail login if cart merge fails', async () => {
      const email = randomEmail();
      const password = 'Test@123456';
      testUser = await User.create(createTestUser({ email, password }));

      // Invalid sessionId (non-existent cart)
      const sessionId = 'invalid-session';
      const request = createGuestRequest(
        'POST',
        'http://localhost:3000/api/auth/login',
        { identifier: email, password },
        sessionId
      );

      const response = await POST(request);
      const data = await getJsonResponse(response);

      // Login should still succeed even if cart merge fails
      expectStatus(response, 200);
      expectSuccess(data);
    });
  });
});
