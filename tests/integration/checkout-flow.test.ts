/**
 * Checkout Flow Integration Tests
 * 
 * Tests complete checkout flow:
 * - Add to cart → Checkout → Create order → Update stock
 * - Multiple products
 * - Stock validation
 * - Transaction integrity
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { POST as POSTCart, GET as GETCart } from '@/app/api/cart/route';
import { POST as POSTOrder, GET as GETOrders } from '@/app/api/orders/route';
import { createAuthenticatedRequest, getJsonResponse, expectStatus, expectSuccess } from '../helpers/api-helpers';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { createTestUser, createTestProduct } from '../helpers/test-utils';

describe('Checkout Flow Integration', () => {
  let testUser: any;
  let testProducts: any[];
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

    // Create test products
    testProducts = await Promise.all([
      Product.create(
        createTestProduct({
          categoryId: testCategory._id,
          slug: 'product-1',
          sku: 'SKU-1',
          inventory: {
            quantity: 10,
            reservedQuantity: 0,
            lowStockThreshold: 5,
            trackQuantity: true,
            allowBackorder: false,
            location: 'warehouse-1',
          },
        })
      ),
      Product.create(
        createTestProduct({
          categoryId: testCategory._id,
          slug: 'product-2',
          sku: 'SKU-2',
          inventory: {
            quantity: 5,
            reservedQuantity: 0,
            lowStockThreshold: 3,
            trackQuantity: true,
            allowBackorder: false,
            location: 'warehouse-1',
          },
        })
      ),
    ]);

    // Create test user
    testUser = await User.create(createTestUser());
  });

  it('should complete full checkout flow', async () => {
    // Step 1: Add products to cart
    for (const product of testProducts) {
      const addRequest = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.mobile,
        'customer',
        'POST',
        'http://localhost:3000/api/cart',
        {
          productId: product._id.toString(),
          quantity: 2,
        }
      );

      const addResponse = await POSTCart(addRequest);
      expectStatus(addResponse, 200);
    }

    // Step 2: Verify cart
    const cartRequest = createAuthenticatedRequest(
      testUser._id.toString(),
      testUser.mobile,
      'customer',
      'GET',
      'http://localhost:3000/api/cart'
    );

    const cartResponse = await GETCart(cartRequest);
    const cartData = await getJsonResponse(cartResponse);

    expectStatus(cartResponse, 200);
    expect(cartData.cart.items.length).toBe(2);
    expect(cartData.cart.total).toBeGreaterThan(0);

    // Step 3: Create order
    const orderRequest = createAuthenticatedRequest(
      testUser._id.toString(),
      testUser.mobile,
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
        },
        billingAddress: {
          firstName: 'Test',
          lastName: 'User',
          addressLine1: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
          country: 'India',
        },
        paymentMethod: 'cod',
      }
    );

    const orderResponse = await POSTOrder(orderRequest);
    const orderData = await getJsonResponse(orderResponse);

    expectStatus(orderResponse, 200);
    expectSuccess(orderData);
    expect(orderData.order).toBeDefined();
    expect(orderData.order.items.length).toBe(2);

    // Step 4: Verify stock updated
    for (const product of testProducts) {
      const updated = await Product.findById(product._id);
      expect(updated?.inventory.quantity).toBe(product.inventory.quantity - 2);
    }

    // Step 5: Verify cart cleared
    const cartAfterRequest = createAuthenticatedRequest(
      testUser._id.toString(),
      testUser.mobile,
      'customer',
      'GET',
      'http://localhost:3000/api/cart'
    );

    const cartAfterResponse = await GETCart(cartAfterRequest);
    const cartAfterData = await getJsonResponse(cartAfterResponse);

    expect(cartAfterData.cart.items.length).toBe(0);
    expect(cartAfterData.cart.total).toBe(0);

    // Step 6: Verify order in orders list
    const ordersRequest = createAuthenticatedRequest(
      testUser._id.toString(),
      testUser.mobile,
      'customer',
      'GET',
      'http://localhost:3000/api/orders'
    );

    const ordersResponse = await GETOrders(ordersRequest);
    const ordersData = await getJsonResponse(ordersResponse);

    expectStatus(ordersResponse, 200);
    expect(ordersData.orders.length).toBeGreaterThan(0);
    expect(ordersData.orders.some((o: any) => o.orderNumber === orderData.order.orderNumber)).toBe(true);
  });

  it('should handle checkout failure and rollback', async () => {
    // Add product to cart
    const addRequest = createAuthenticatedRequest(
      testUser._id.toString(),
      testUser.mobile,
      'customer',
      'POST',
      'http://localhost:3000/api/cart',
      {
        productId: testProducts[0]._id.toString(),
        quantity: 1,
      }
    );

    await POSTCart(addRequest);

    // Try to create order with invalid data (should fail)
    const orderRequest = createAuthenticatedRequest(
      testUser._id.toString(),
      testUser.mobile,
      'customer',
      'POST',
      'http://localhost:3000/api/orders',
      {
        shippingAddress: {
          // Missing required fields
        },
        billingAddress: {
          // Missing required fields
        },
        paymentMethod: 'cod',
      }
    );

    const orderResponse = await POSTOrder(orderRequest);
    expectStatus(orderResponse, 400);

    // Verify stock not updated
    const product = await Product.findById(testProducts[0]._id);
    expect(product?.inventory.quantity).toBe(testProducts[0].inventory.quantity);

    // Verify cart still has items
    const cartRequest = createAuthenticatedRequest(
      testUser._id.toString(),
      testUser.mobile,
      'customer',
      'GET',
      'http://localhost:3000/api/cart'
    );

    const cartResponse = await GETCart(cartRequest);
    const cartData = await getJsonResponse(cartResponse);

    expect(cartData.cart.items.length).toBe(1);
  });
});
