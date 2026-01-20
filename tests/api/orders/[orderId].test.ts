/**
 * Order Detail API Tests
 * 
 * Tests for Order Detail operations:
 * - GET /api/orders/[orderId] (get order details)
 * - PATCH /api/orders/[orderId] (update order status - admin)
 * - Authorization checks
 * - Edge cases
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GET, PATCH } from '@/app/api/orders/[orderId]/route';
import { createAuthenticatedRequest, createAdminRequest, getJsonResponse, expectStatus, expectSuccess, expectError, createObjectId } from '../../helpers/api-helpers';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Order from '@/models/Order';
import { createTestUser, createTestProduct, createTestOrder } from '../../helpers/test-utils';

describe('Order Detail API', () => {
  let testUser: any;
  let testAdmin: any;
  let testProduct: any;
  let testCategory: any;
  let testOrder: any;

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
      })
    );

    // Create test user
    testUser = await User.create(createTestUser({ role: 'customer' }));

    // Create test admin
    testAdmin = await User.create(createTestUser({ role: 'admin' }));

    // Create test order
    testOrder = await Order.create(
      createTestOrder({
        userId: testUser._id,
        items: [
          {
            productId: testProduct._id,
            productSku: testProduct.sku,
            productTitle: testProduct.title,
            image: testProduct.primaryImage || testProduct.images[0] || '',
            quantity: 1,
            price: testProduct.price,
            total: testProduct.price,
          },
        ],
      })
    );
  });

  describe('GET /api/orders/[orderId]', () => {
    it('should get order details for owner', async () => {
      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.mobile,
        'customer',
        'GET',
        `http://localhost:3000/api/orders/${testOrder._id.toString()}`
      );

      const response = await GET(request, { params: Promise.resolve({ orderId: testOrder._id.toString() }) });
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expect(data.order).toBeDefined();
      expect(data.order.id).toBe(testOrder._id.toString());
      expect(data.order.items.length).toBe(1);
    });

    it('should reject access for other users', async () => {
      const otherUser = await User.create(createTestUser());

      const request = createAuthenticatedRequest(
        otherUser._id.toString(),
        otherUser.mobile,
        'customer',
        'GET',
        `http://localhost:3000/api/orders/${testOrder._id.toString()}`
      );

      const response = await GET(request, { params: Promise.resolve({ orderId: testOrder._id.toString() }) });
      const data = await getJsonResponse(response);

      expectStatus(response, 404);
      expectError(data);
    });

    it('should reject invalid orderId', async () => {
      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.mobile,
        'customer',
        'GET',
        `http://localhost:3000/api/orders/${createObjectId()}`
      );

      const response = await GET(request, { params: Promise.resolve({ orderId: createObjectId() }) });
      const data = await getJsonResponse(response);

      expectStatus(response, 404);
      expectError(data);
    });

    it('should require authentication', async () => {
      const { createGuestRequest } = await import('../../helpers/api-helpers');
      const request = createGuestRequest('GET', `http://localhost:3000/api/orders/${testOrder._id.toString()}`);

      const response = await GET(request, { params: Promise.resolve({ orderId: testOrder._id.toString() }) });
      expectStatus(response, 401);
    });
  });

  describe('PATCH /api/orders/[orderId]', () => {
    it('should update order status as admin', async () => {
      const request = createAdminRequest(
        testAdmin._id.toString(),
        testAdmin.mobile,
        'PATCH',
        `http://localhost:3000/api/orders/${testOrder._id.toString()}`,
        {
          status: 'confirmed',
        }
      );

      const response = await PATCH(request, { params: Promise.resolve({ orderId: testOrder._id.toString() }) });
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expectSuccess(data);
      expect(data.order.status).toBe('confirmed');

      const updated = await Order.findById(testOrder._id);
      expect(updated?.status).toBe('confirmed');
    });

    it('should set shippedAt when status changes to shipped', async () => {
      testOrder.status = 'confirmed';
      await testOrder.save();

      const request = createAdminRequest(
        testAdmin._id.toString(),
        testAdmin.mobile,
        'PATCH',
        `http://localhost:3000/api/orders/${testOrder._id.toString()}`,
        {
          status: 'shipped',
          trackingNumber: 'TRACK123',
        }
      );

      const response = await PATCH(request, { params: Promise.resolve({ orderId: testOrder._id.toString() }) });
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expect(data.order.trackingNumber).toBe('TRACK123');

      const updated = await Order.findById(testOrder._id);
      expect(updated?.shippedAt).toBeDefined();
    });

    it('should set deliveredAt when status changes to delivered', async () => {
      testOrder.status = 'shipped';
      await testOrder.save();

      const request = createAdminRequest(
        testAdmin._id.toString(),
        testAdmin.mobile,
        'PATCH',
        `http://localhost:3000/api/orders/${testOrder._id.toString()}`,
        {
          status: 'delivered',
        }
      );

      const response = await PATCH(request, { params: Promise.resolve({ orderId: testOrder._id.toString() }) });
      await getJsonResponse(response);

      expectStatus(response, 200);

      const updated = await Order.findById(testOrder._id);
      expect(updated?.deliveredAt).toBeDefined();
    });

    it('should update payment status', async () => {
      const request = createAdminRequest(
        testAdmin._id.toString(),
        testAdmin.mobile,
        'PATCH',
        `http://localhost:3000/api/orders/${testOrder._id.toString()}`,
        {
          paymentStatus: 'paid',
        }
      );

      const response = await PATCH(request, { params: Promise.resolve({ orderId: testOrder._id.toString() }) });
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expect(data.order.paymentStatus).toBe('paid');
    });

    it('should reject non-admin access', async () => {
      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.mobile,
        'customer',
        'PATCH',
        `http://localhost:3000/api/orders/${testOrder._id.toString()}`,
        {
          status: 'confirmed',
        }
      );

      const response = await PATCH(request, { params: Promise.resolve({ orderId: testOrder._id.toString() }) });
      expectStatus(response, 403);
    });

    it('should reject invalid orderId', async () => {
      const request = createAdminRequest(
        testAdmin._id.toString(),
        testAdmin.mobile,
        'PATCH',
        `http://localhost:3000/api/orders/${createObjectId()}`,
        {
          status: 'confirmed',
        }
      );

      const response = await PATCH(request, { params: Promise.resolve({ orderId: createObjectId() }) });
      const data = await getJsonResponse(response);

      expectStatus(response, 404);
      expectError(data);
    });

    it('should validate status enum', async () => {
      const request = createAdminRequest(
        testAdmin._id.toString(),
        testAdmin.mobile,
        'PATCH',
        `http://localhost:3000/api/orders/${testOrder._id.toString()}`,
        {
          status: 'invalid-status',
        }
      );

      const response = await PATCH(request, { params: Promise.resolve({ orderId: testOrder._id.toString() }) });
      const data = await getJsonResponse(response);

      expectStatus(response, 400);
      expectError(data);
    });
  });
});
