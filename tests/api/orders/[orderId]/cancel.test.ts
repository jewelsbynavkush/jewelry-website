/**
 * Cancel Order API Tests
 * 
 * Tests for POST /api/orders/[orderId]/cancel:
 * - Cancel order
 * - Stock restoration
 * - Status validation
 * - Idempotency
 * - Transaction rollback
 * - Edge cases
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { POST } from '@/app/api/orders/[orderId]/cancel/route';
import { createAuthenticatedRequest, getJsonResponse, expectStatus, expectSuccess, expectError, createObjectId } from '../../../helpers/api-helpers';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Order from '@/models/Order';
import { createTestUser, createTestProduct, createTestOrder } from '../../../helpers/test-utils';

describe('POST /api/orders/[orderId]/cancel', () => {
  let testUser: any;
  let testProduct: any;
  let testCategory: any;
  let testOrder: any;
  let initialStock: number;

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

    // Create test product with stock
    initialStock = 10;
    testProduct = await Product.create(
      createTestProduct({
        categoryId: testCategory._id,
        inventory: {
          quantity: initialStock,
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

    // Create test order and reduce stock
    testOrder = await Order.create(
      createTestOrder({
        userId: testUser._id,
        items: [
          {
            productId: testProduct._id,
            productSku: testProduct.sku,
            productTitle: testProduct.title,
            image: testProduct.primaryImage || testProduct.images[0] || '',
            quantity: 2,
            price: testProduct.price,
            total: testProduct.price * 2,
          },
        ],
      })
    );

    // Simulate stock reduction
    testProduct.inventory.quantity = initialStock - 2;
    await testProduct.save();
  });

  describe('Successful Cancellation', () => {
    it('should cancel order and restore stock', async () => {
      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.mobile,
        'customer',
        'POST',
        `http://localhost:3000/api/orders/${testOrder._id.toString()}/cancel`,
        {
          reason: 'Changed my mind',
        }
      );

      const response = await POST(request, { params: Promise.resolve({ orderId: testOrder._id.toString() }) });
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expectSuccess(data);
      expect(data.order.status).toBe('cancelled');

      const updated = await Order.findById(testOrder._id);
      expect(updated?.status).toBe('cancelled');
      expect(updated?.cancelledAt).toBeDefined();
      expect(updated?.cancelledReason).toBe('Changed my mind');

      // Verify stock restored
      const product = await Product.findById(testProduct._id);
      expect(product?.inventory.quantity).toBe(initialStock);
    });

    it('should handle idempotency key', async () => {
      const idempotencyKey = 'cancel-key-123';

      const request1 = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.mobile,
        'customer',
        'POST',
        `http://localhost:3000/api/orders/${testOrder._id.toString()}/cancel`,
        {
          idempotencyKey,
        }
      );

      await POST(request1, { params: Promise.resolve({ orderId: testOrder._id.toString() }) });

      // Try to cancel again with same key
      const request2 = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.mobile,
        'customer',
        'POST',
        `http://localhost:3000/api/orders/${testOrder._id.toString()}/cancel`,
        {
          idempotencyKey,
        }
      );

      const response2 = await POST(request2, { params: Promise.resolve({ orderId: testOrder._id.toString() }) });
      await getJsonResponse(response2);

      // Should succeed (idempotent)
      expectStatus(response2, 200);
    });
  });

  describe('Status Validation', () => {
    it('should reject cancelling already cancelled order', async () => {
      testOrder.status = 'cancelled';
      await testOrder.save();

      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.mobile,
        'customer',
        'POST',
        `http://localhost:3000/api/orders/${testOrder._id.toString()}/cancel`
      );

      const response = await POST(request, { params: Promise.resolve({ orderId: testOrder._id.toString() }) });
      const data = await getJsonResponse(response);

      expectStatus(response, 400);
      expectError(data, 'already cancelled');
    });

    it('should reject cancelling delivered order', async () => {
      testOrder.status = 'delivered';
      await testOrder.save();

      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.mobile,
        'customer',
        'POST',
        `http://localhost:3000/api/orders/${testOrder._id.toString()}/cancel`
      );

      const response = await POST(request, { params: Promise.resolve({ orderId: testOrder._id.toString() }) });
      const data = await getJsonResponse(response);

      expectStatus(response, 400);
      expectError(data, 'Cannot cancel delivered order');
    });

    it('should allow cancelling paid order and update payment status to refunded', async () => {
      testOrder.status = 'confirmed';
      testOrder.paymentStatus = 'paid';
      await testOrder.save();

      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.mobile,
        'customer',
        'POST',
        `http://localhost:3000/api/orders/${testOrder._id.toString()}/cancel`
      );

      const response = await POST(request, { params: Promise.resolve({ orderId: testOrder._id.toString() }) });
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expect(data.success).toBe(true);
      
      const updated = await Order.findById(testOrder._id);
      expect(updated?.paymentStatus).toBe('refunded');
    });
  });

  describe('Authorization', () => {
    it('should reject cancellation by other user', async () => {
      const otherUser = await User.create(createTestUser());

      const request = createAuthenticatedRequest(
        otherUser._id.toString(),
        otherUser.mobile,
        'customer',
        'POST',
        `http://localhost:3000/api/orders/${testOrder._id.toString()}/cancel`
      );

      const response = await POST(request, { params: Promise.resolve({ orderId: testOrder._id.toString() }) });
      const data = await getJsonResponse(response);

      expectStatus(response, 403);
      expectError(data, 'Unauthorized');
    });

    it('should require authentication', async () => {
      const { createGuestRequest } = await import('../../../helpers/api-helpers');
      const request = createGuestRequest('POST', `http://localhost:3000/api/orders/${testOrder._id.toString()}/cancel`);

      const response = await POST(request, { params: Promise.resolve({ orderId: testOrder._id.toString() }) });
      expectStatus(response, 401);
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid orderId', async () => {
      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.mobile,
        'customer',
        'POST',
        `http://localhost:3000/api/orders/${createObjectId()}/cancel`
      );

      const response = await POST(request, { params: Promise.resolve({ orderId: createObjectId() }) });
      const data = await getJsonResponse(response);

      expectStatus(response, 404);
      expectError(data);
    });

    it('should update payment status to refunded for paid orders', async () => {
      testOrder.paymentStatus = 'paid';
      await testOrder.save();

      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.mobile,
        'customer',
        'POST',
        `http://localhost:3000/api/orders/${testOrder._id.toString()}/cancel`
      );

      await POST(request, { params: Promise.resolve({ orderId: testOrder._id.toString() }) });

      const updated = await Order.findById(testOrder._id);
      expect(updated?.paymentStatus).toBe('refunded');
    });
  });
});
