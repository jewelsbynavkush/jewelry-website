/**
 * Cart Item API Tests
 * 
 * Tests for Cart Item operations:
 * - PATCH /api/cart/[itemId] (update quantity)
 * - DELETE /api/cart/[itemId] (remove item)
 * - Stock validation
 * - Guest and authenticated support
 * - Edge cases
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PATCH, DELETE } from '@/app/api/cart/[itemId]/route';
import { createAuthenticatedRequest, createGuestRequest, getJsonResponse, expectStatus, expectSuccess, expectError, createObjectId } from '../../helpers/api-helpers';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Cart from '@/models/Cart';
import { createTestUser, createTestProduct } from '../../helpers/test-utils';

describe('Cart Item API', () => {
  let testUser: any;
  let testProduct: any;
  let testCategory: any;

  beforeEach(async () => {
    await connectDB();

    // Create test category
    testCategory = await Category.create({
      name: 'Rings',
      slug: 'rings',
      displayName: 'Rings',
      image: 'https://example.com/rings.jpg',
      alt: 'Rings category',
      active: true,
    });

    // Create test product
    testProduct = await Product.create(
      createTestProduct({
        categoryId: testCategory._id,
        inventory: {
          quantity: 10,
          reservedQuantity: 0,
          lowStockThreshold: 5,
          trackQuantity: true,
          allowBackorder: false,
          location: 'warehouse-1',
        },
      })
    );

    // Create test user
    testUser = await User.create(createTestUser());

    // Create test cart with item (cart is found automatically by API via userId)
    await Cart.create({
      userId: testUser._id,
      items: [
        {
          productId: testProduct._id,
          sku: testProduct.sku,
          title: testProduct.title,
          image: testProduct.primaryImage || '',
          price: testProduct.price,
          quantity: 2,
          subtotal: testProduct.price * 2,
        },
      ],
      subtotal: testProduct.price * 2,
      total: testProduct.price * 2,
      currency: 'INR',
    });
  });

  describe('PATCH /api/cart/[itemId]', () => {
    it('should update item quantity for authenticated user', async () => {
      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'PATCH',
        `http://localhost:3000/api/cart/${testProduct._id.toString()}`,
        { quantity: 3 }
      );

      const response = await PATCH(request, { params: Promise.resolve({ itemId: testProduct._id.toString() }) });
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expectSuccess(data);
      expect(data.cart.items[0].quantity).toBe(3);
    });

    it('should remove item when quantity is 0', async () => {
      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'PATCH',
        `http://localhost:3000/api/cart/${testProduct._id.toString()}`,
        { quantity: 0 }
      );

      const response = await PATCH(request, { params: Promise.resolve({ itemId: testProduct._id.toString() }) });
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expectSuccess(data);
      expect(data.cart.items.length).toBe(0);
    });

    it('should reject invalid productId', async () => {
      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'PATCH',
        `http://localhost:3000/api/cart/${createObjectId()}`,
        { quantity: 1 }
      );

      const response = await PATCH(request, { params: Promise.resolve({ itemId: createObjectId() }) });
      const data = await getJsonResponse(response);

      expectStatus(response, 404);
      expectError(data);
    });

    it('should reject insufficient stock', async () => {
      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'PATCH',
        `http://localhost:3000/api/cart/${testProduct._id.toString()}`,
        { quantity: 100 }
      );

      const response = await PATCH(request, { params: Promise.resolve({ itemId: testProduct._id.toString() }) });
      const data = await getJsonResponse(response);

      expectStatus(response, 400);
      expectError(data);
    });

    it('should reject inactive product', async () => {
      testProduct.status = 'archived'; // Use valid enum value instead of 'inactive'
      await testProduct.save();

      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'PATCH',
        `http://localhost:3000/api/cart/${testProduct._id.toString()}`,
        { quantity: 1 }
      );

      const response = await PATCH(request, { params: Promise.resolve({ itemId: testProduct._id.toString() }) });
      const data = await getJsonResponse(response);

      expectStatus(response, 400);
      expectError(data);
    });

    it('should update quantity for guest user', async () => {
      const sessionId = createObjectId();
      await Cart.create({
        sessionId,
        items: [
          {
            productId: testProduct._id,
            sku: testProduct.sku,
            title: testProduct.title,
            image: testProduct.primaryImage || '',
            price: testProduct.price,
            quantity: 1,
            subtotal: testProduct.price,
          },
        ],
        subtotal: testProduct.price,
        total: testProduct.price,
        currency: 'INR',
      });

      const request = createGuestRequest(
        'PATCH',
        `http://localhost:3000/api/cart/${testProduct._id.toString()}`,
        { quantity: 2 }
      );
      request.cookies.set('session-id', sessionId);

      const response = await PATCH(request, { params: Promise.resolve({ itemId: testProduct._id.toString() }) });
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expectSuccess(data);
      expect(data.cart.items[0].quantity).toBe(2);
    });
  });

  describe('DELETE /api/cart/[itemId]', () => {
    it('should remove item from cart for authenticated user', async () => {
      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'DELETE',
        `http://localhost:3000/api/cart/${testProduct._id.toString()}`
      );

      const response = await DELETE(request, { params: Promise.resolve({ itemId: testProduct._id.toString() }) });
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expectSuccess(data);
      expect(data.cart.items.length).toBe(0);

      const cart = await Cart.findOne({ userId: testUser._id });
      expect(cart?.items.length).toBe(0);
    });

    it('should reject invalid productId', async () => {
      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'DELETE',
        `http://localhost:3000/api/cart/${createObjectId()}`
      );

      const response = await DELETE(request, { params: Promise.resolve({ itemId: createObjectId() }) });
      const data = await getJsonResponse(response);

      expectStatus(response, 404);
      expectError(data);
    });

    it('should remove item from guest cart', async () => {
      const sessionId = createObjectId();
      await Cart.create({
        sessionId,
        items: [
          {
            productId: testProduct._id,
            sku: testProduct.sku,
            title: testProduct.title,
            image: testProduct.primaryImage || '',
            price: testProduct.price,
            quantity: 1,
            subtotal: testProduct.price,
          },
        ],
        subtotal: testProduct.price,
        total: testProduct.price,
        currency: 'INR',
      });

      const request = createGuestRequest('DELETE', `http://localhost:3000/api/cart/${testProduct._id.toString()}`);
      request.cookies.set('session-id', sessionId);

      const response = await DELETE(request, { params: Promise.resolve({ itemId: testProduct._id.toString() }) });
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expectSuccess(data);
    });
  });

  describe('Edge Cases', () => {
    it('should handle quantity exceeding max limit', async () => {
      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'PATCH',
        `http://localhost:3000/api/cart/${testProduct._id.toString()}`,
        { quantity: 101 }
      );

      const response = await PATCH(request, { params: Promise.resolve({ itemId: testProduct._id.toString() }) });
      const data = await getJsonResponse(response);

      expectStatus(response, 400);
      expectError(data);
    });
  });
});
