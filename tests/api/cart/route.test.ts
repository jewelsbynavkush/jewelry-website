/**
 * Cart API Tests
 * 
 * Tests for Cart API routes:
 * - GET /api/cart
 * - POST /api/cart
 * - DELETE /api/cart
 * - Guest cart support
 * - Stock validation
 * - Edge cases
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GET, POST, DELETE } from '@/app/api/cart/route';
import { createAuthenticatedRequest, createGuestRequest, getJsonResponse, expectStatus, expectSuccess, expectError, createObjectId } from '../../helpers/api-helpers';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Cart from '@/models/Cart';
import { createTestUser, createTestProduct } from '../../helpers/test-utils';

describe('Cart API', () => {
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
  });

  describe('GET /api/cart', () => {
    it('should get empty cart for authenticated user', async () => {
      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer'
      );

      const response = await GET(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expect(data.cart.items).toEqual([]);
      expect(data.cart.subtotal).toBe(0);
    });

    it('should get cart with items for authenticated user', async () => {
      // Create cart with items
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

      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer'
      );

      const response = await GET(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expect(data.cart.items.length).toBe(1);
      expect(data.cart.items[0].quantity).toBe(2);
      expect(data.cart.subtotal).toBe(testProduct.price * 2);
    });

    it('should get empty cart for guest user', async () => {
      const request = createGuestRequest();

      const response = await GET(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expect(data.cart.items).toEqual([]);
    });
  });

  describe('POST /api/cart', () => {
    it('should add item to cart for authenticated user', async () => {
      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'POST',
        'http://localhost:3000/api/cart',
        {
          productId: testProduct._id.toString(),
          quantity: 2,
        }
      );

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expectSuccess(data);
      expect(data.cart.items.length).toBe(1);
      expect(data.cart.items[0].quantity).toBe(2);
    });

    it('should add item to cart for guest user', async () => {
      const request = createGuestRequest(
        'POST',
        'http://localhost:3000/api/cart',
        {
          productId: testProduct._id.toString(),
          quantity: 1,
        }
      );

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expectSuccess(data);
      expect(data.cart.items.length).toBe(1);
    });

    it('should reject invalid productId', async () => {
      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'POST',
        'http://localhost:3000/api/cart',
        {
          productId: 'invalid-product-id-format',
          quantity: 1,
        }
      );

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 400);
      expectError(data);
    });

    it('should reject insufficient stock', async () => {
      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'POST',
        'http://localhost:3000/api/cart',
        {
          productId: testProduct._id.toString(),
          quantity: 100, // More than available
        }
      );

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 400);
      expectError(data);
    });

    it('should reject inactive product', async () => {
      const inactiveProduct = await Product.create(
        createTestProduct({
          categoryId: testCategory._id,
          status: 'archived', // Use valid enum value instead of 'inactive'
        })
      );

      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'POST',
        'http://localhost:3000/api/cart',
        {
          productId: inactiveProduct._id.toString(),
          quantity: 1,
        }
      );

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 400);
      expectError(data);
    });

    it('should validate quantity limits', async () => {
      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'POST',
        'http://localhost:3000/api/cart',
        {
          productId: testProduct._id.toString(),
          quantity: 101, // Exceeds max
        }
      );

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 400);
      expectError(data);
    });
  });

  describe('DELETE /api/cart', () => {
    it('should clear cart for authenticated user', async () => {
      // Create cart with items
      await Cart.create({
        userId: testUser._id,
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

      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'DELETE',
        'http://localhost:3000/api/cart'
      );

      const response = await DELETE(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expectSuccess(data);

      // Verify cart is cleared
      const cart = await Cart.findOne({ userId: testUser._id });
      expect(cart?.items.length).toBe(0);
    });

    it('should clear cart for guest user', async () => {
      const sessionId = createObjectId();
      
      // Create guest cart
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
        'DELETE',
        'http://localhost:3000/api/cart'
      );
      request.cookies.set('session-id', sessionId);

      const response = await DELETE(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expectSuccess(data);
    });
  });

  describe('Edge Cases', () => {
    it('should handle concurrent add to cart requests', async () => {
      const requests = Array.from({ length: 5 }, () =>
        createAuthenticatedRequest(
          testUser._id.toString(),
          testUser.email,
          'customer',
          'POST',
          'http://localhost:3000/api/cart',
          {
            productId: testProduct._id.toString(),
            quantity: 1,
          }
        )
      );

      const responses = await Promise.all(requests.map((req) => POST(req)));

      // All should succeed, but total quantity should not exceed stock
      const successCount = responses.filter((r) => r.status === 200).length;
      expect(successCount).toBeGreaterThan(0);

      const cart = await Cart.findOne({ userId: testUser._id });
      if (cart) {
        const totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        expect(totalQuantity).toBeLessThanOrEqual(10); // Stock limit
      }
    });
  });
});
