/**
 * Orders API Tests
 * 
 * Tests for Orders API routes:
 * - POST /api/orders (create order)
 * - GET /api/orders (list orders)
 * - Idempotency
 * - Stock validation
 * - Transaction rollback
 * - Edge cases
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { POST, GET } from '@/app/api/orders/route';
import { createAuthenticatedRequest, getJsonResponse, expectStatus, expectSuccess, expectError } from '../../helpers/api-helpers';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Cart from '@/models/Cart';
import Order from '@/models/Order';
import { createTestUser, createTestProduct } from '../../helpers/test-utils';

describe('Orders API', () => {
  let testUser: any;
  let testProduct: any;
  let testCategory: any;
  let testCart: any;

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

    // Create test cart
    testCart = await Cart.create({
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

  describe('POST /api/orders', () => {
    it('should create order from cart', async () => {
      const request = createAuthenticatedRequest(
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

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expectSuccess(data);
      expect(data.order).toBeDefined();
      expect(data.order.orderNumber).toBeDefined();
      expect(data.order.status).toBe('pending');
      expect(data.order.items.length).toBe(1);
    });

    it('should validate idempotency key', async () => {
      const idempotencyKey = 'test-key-123';

      const request1 = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'POST',
        'http://localhost:3000/api/orders',
        {
          idempotencyKey,
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

      await POST(request1);

      // Try to create order with same idempotency key
      const request2 = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'POST',
        'http://localhost:3000/api/orders',
        {
          idempotencyKey,
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

      const response2 = await POST(request2);
      const data2 = await getJsonResponse(response2);

      // Should return existing order
      expectStatus(response2, 200);
      expectSuccess(data2);
      expect(data2.message).toContain('already processed');
    });

    it('should reject empty cart', async () => {
      // Clear cart
      testCart.items = [];
      testCart.subtotal = 0;
      testCart.total = 0;
      await testCart.save();

      const request = createAuthenticatedRequest(
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

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 400);
      expectError(data, 'Cart is empty');
    });

    it('should reject insufficient stock', async () => {
      // Update cart with quantity exceeding stock
      testCart.items[0].quantity = 100;
      testCart.subtotal = testProduct.price * 100;
      testCart.total = testProduct.price * 100;
      await testCart.save();

      const request = createAuthenticatedRequest(
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

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 400);
      expectError(data);
    });

    it('should update stock after order creation', async () => {
      const initialQuantity = testProduct.inventory.quantity;

      const request = createAuthenticatedRequest(
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

      await POST(request);

      const updatedProduct = await Product.findById(testProduct._id);
      expect(updatedProduct?.inventory.quantity).toBe(initialQuantity - 2);
    });

    it('should create order when cart has reserved stock (availableQuantity 0)', async () => {
      const reservedProduct = await Product.create(
        createTestProduct({
          categoryId: testCategory._id,
          sku: 'RESERVED-1',
          slug: 'reserved-product',
          inventory: {
            quantity: 1,
            reservedQuantity: 1,
            lowStockThreshold: 1,
            trackQuantity: true,
            allowBackorder: false,
            location: 'warehouse-1',
          },
        })
      );
      await Cart.findOneAndUpdate(
        { userId: testUser._id },
        {
          items: [
            {
              productId: reservedProduct._id,
              sku: reservedProduct.sku,
              title: reservedProduct.title,
              image: reservedProduct.primaryImage || '',
              price: reservedProduct.price,
              quantity: 1,
              subtotal: reservedProduct.price,
            },
          ],
          subtotal: reservedProduct.price,
          total: reservedProduct.price,
          currency: 'INR',
        },
        { new: true }
      );

      const request = createAuthenticatedRequest(
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

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expectSuccess(data);
      expect(data.order?.items?.length).toBe(1);

      const productAfter = await Product.findById(reservedProduct._id).lean();
      expect(productAfter?.inventory.quantity).toBe(0);
      expect(productAfter?.inventory.reservedQuantity).toBe(0);
    });

    it('should clear cart after order creation', async () => {
      const request = createAuthenticatedRequest(
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

      await POST(request);

      const cart = await Cart.findOne({ userId: testUser._id });
      expect(cart?.items.length).toBe(0);
      expect(cart?.total).toBe(0);
    });
  });

  describe('GET /api/orders', () => {
    it('should get user orders', async () => {
      // Create test order
      await Order.create({
        userId: testUser._id,
        orderNumber: 'ORD-12345678',
        status: 'pending',
        paymentStatus: 'pending',
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
        subtotal: testProduct.price,
        total: testProduct.price,
        currency: 'INR',
        paymentMethod: 'cod',
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
      });

      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'GET',
        'http://localhost:3000/api/orders'
      );

      const response = await GET(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expect(data.orders).toBeDefined();
      expect(data.orders.length).toBeGreaterThan(0);
      expect(data.pagination).toBeDefined();
    });

    it('should filter orders by status', async () => {
      await Order.create({
        userId: testUser._id,
        orderNumber: 'ORD-12345678',
        status: 'pending',
        paymentStatus: 'pending',
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
        subtotal: 1000,
        total: 1000,
        currency: 'INR',
        paymentMethod: 'cod',
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
      });

      await Order.create({
        userId: testUser._id,
        orderNumber: 'ORD-12345679',
        status: 'delivered',
        paymentStatus: 'paid',
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
        subtotal: 2000,
        total: 2000,
        currency: 'INR',
        paymentMethod: 'cod',
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
      });

      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'GET',
        'http://localhost:3000/api/orders?status=pending'
      );

      const response = await GET(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expect(data.orders.every((o: any) => o.status === 'pending')).toBe(true);
    });

    it('should paginate orders', async () => {
      // Create multiple orders
      for (let i = 0; i < 5; i++) {
        await Order.create({
          userId: testUser._id,
          orderNumber: `ORD-1234568${i}`,
          status: 'pending',
          paymentStatus: 'pending',
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
          subtotal: 1000,
          total: 1000,
          currency: 'INR',
          paymentMethod: 'cod',
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
        });
      }

      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'GET',
        'http://localhost:3000/api/orders?limit=2&page=1'
      );

      const response = await GET(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expect(data.orders.length).toBeLessThanOrEqual(2);
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.limit).toBe(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle concurrent order creation', async () => {
      const requests = Array.from({ length: 3 }, () =>
        createAuthenticatedRequest(
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
        )
      );

      const responses = await Promise.all(requests.map((req) => POST(req)));

      // Only one should succeed (stock limit)
      const successCount = responses.filter((r) => r.status === 200).length;
      expect(successCount).toBeLessThanOrEqual(1);
    });
  });
});
