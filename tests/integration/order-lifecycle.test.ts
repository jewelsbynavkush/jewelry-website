/**
 * Order Lifecycle Integration Tests
 * 
 * Tests complete order lifecycle:
 * - Create order → Confirm → Process → Ship → Deliver
 * - Create order → Cancel → Restore stock
 * - Create order → Refund → Update payment status
 * - Concurrent order operations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { POST as POSTOrder } from '@/app/api/orders/route';
import { PATCH as PATCHOrder } from '@/app/api/orders/[orderId]/route';
import { POST as POSTCancel } from '@/app/api/orders/[orderId]/cancel/route';
import { createAuthenticatedRequest, createAdminRequest, getJsonResponse, expectStatus } from '../helpers/api-helpers';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Cart from '@/models/Cart';
import Order from '@/models/Order';
import { createTestUser, createTestProduct } from '../helpers/test-utils';

describe('Order Lifecycle Integration', () => {
  let testUser: any;
  let testAdmin: any;
  let testProduct: any;
  let testCategory: any;
  let initialStock: number;

  beforeEach(async () => {
    await connectDB();

    testCategory = await Category.create({
      name: 'Rings',
      slug: 'rings',
      displayName: 'Rings',
      image: 'https://example.com/rings.jpg',
      alt: 'Rings category',
      active: true,
    });

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

    testUser = await User.create(createTestUser());
    testAdmin = await User.create(createTestUser({ role: 'admin' }));

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

  describe('Complete Order Lifecycle', () => {
    it('should complete full order lifecycle: Create → Confirm → Ship → Deliver', async () => {
      // Step 1: Create order
      const createRequest = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'POST',
        'http://localhost:3000/api/orders',
        {
          shippingAddress: {
            firstName: 'Test',
            lastName: 'User',
            addressLine1: '123 Test St',
            city: 'Test City',
            state: 'Test State',
            zipCode: '12345',
            country: 'India',
            phone: '9876543210',
            countryCode: '+91',
          },
          billingAddress: {
            firstName: 'Test',
            lastName: 'User',
            addressLine1: '123 Test St',
            city: 'Test City',
            state: 'Test State',
            zipCode: '12345',
            country: 'India',
            phone: '9876543210',
            countryCode: '+91',
          },
          paymentMethod: 'cod',
        }
      );

      const createResponse = await POSTOrder(createRequest);
      const createData = await getJsonResponse(createResponse);
      expectStatus(createResponse, 200);
      expect(createData.order).toBeDefined();
      const orderId = createData.order.id;

      expectStatus(createResponse, 200);
      expect(createData.order.status).toBe('pending');

      // Step 2: Confirm order (admin)
      const confirmRequest = createAdminRequest(
        testAdmin._id.toString(),
        testAdmin.email,
        'PATCH',
        `http://localhost:3000/api/orders/${orderId}`,
        {
          status: 'confirmed',
          paymentStatus: 'paid',
        }
      );

      const confirmResponse = await PATCHOrder(confirmRequest, { params: Promise.resolve({ orderId }) });
      const confirmData = await getJsonResponse(confirmResponse);

      expectStatus(confirmResponse, 200);
      expect(confirmData.order.status).toBe('confirmed');
      expect(confirmData.order.paymentStatus).toBe('paid');

      // Step 3: Ship order (admin)
      const shipRequest = createAdminRequest(
        testAdmin._id.toString(),
        testAdmin.email,
        'PATCH',
        `http://localhost:3000/api/orders/${orderId}`,
        {
          status: 'shipped',
          trackingNumber: 'TRACK123',
        }
      );

      const shipResponse = await PATCHOrder(shipRequest, { params: Promise.resolve({ orderId }) });
      const shipData = await getJsonResponse(shipResponse);

      expectStatus(shipResponse, 200);
      expect(shipData.order.status).toBe('shipped');
      expect(shipData.order.trackingNumber).toBe('TRACK123');

      const shippedOrder = await Order.findById(orderId);
      expect(shippedOrder?.shippedAt).toBeDefined();

      // Step 4: Deliver order (admin)
      const deliverRequest = createAdminRequest(
        testAdmin._id.toString(),
        testAdmin.email,
        'PATCH',
        `http://localhost:3000/api/orders/${orderId}`,
        {
          status: 'delivered',
        }
      );

      const deliverResponse = await PATCHOrder(deliverRequest, { params: Promise.resolve({ orderId }) });
      const deliverData = await getJsonResponse(deliverResponse);

      expectStatus(deliverResponse, 200);
      expect(deliverData.order.status).toBe('delivered');

      const deliveredOrder = await Order.findById(orderId);
      expect(deliveredOrder?.deliveredAt).toBeDefined();
    });
  });

  describe('Order Cancellation Flow', () => {
    it('should cancel order and restore stock', async () => {
      // Create order
      const createRequest = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'POST',
        'http://localhost:3000/api/orders',
        {
          shippingAddress: {
            firstName: 'Test',
            lastName: 'User',
            addressLine1: '123 Test St',
            city: 'Test City',
            state: 'Test State',
            zipCode: '12345',
            country: 'India',
            phone: '9876543210',
            countryCode: '+91',
          },
          billingAddress: {
            firstName: 'Test',
            lastName: 'User',
            addressLine1: '123 Test St',
            city: 'Test City',
            state: 'Test State',
            zipCode: '12345',
            country: 'India',
            phone: '9876543210',
            countryCode: '+91',
          },
          paymentMethod: 'cod',
        }
      );

      const createResponse = await POSTOrder(createRequest);
      const createData = await getJsonResponse(createResponse);
      expectStatus(createResponse, 200);
      expect(createData.order).toBeDefined();
      const orderId = createData.order.id;

      // Verify stock reduced
      const productAfterOrder = await Product.findById(testProduct._id);
      expect(productAfterOrder?.inventory.quantity).toBe(initialStock - 2);

      // Cancel order
      const cancelRequest = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'POST',
        `http://localhost:3000/api/orders/${orderId}/cancel`,
        {
          reason: 'Changed my mind',
        }
      );

      const cancelResponse = await POSTCancel(cancelRequest, { params: Promise.resolve({ orderId }) });
      const cancelData = await getJsonResponse(cancelResponse);

      expectStatus(cancelResponse, 200);
      expect(cancelData.order.status).toBe('cancelled');

      // Verify stock restored
      const productAfterCancel = await Product.findById(testProduct._id);
      expect(productAfterCancel?.inventory.quantity).toBe(initialStock);
    });
  });
});
