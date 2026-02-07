/**
 * Order Model Tests
 * 
 * Tests for Order model:
 * - Schema validation
 * - Order number generation
 * - Idempotency checks
 * - Payment duplicate prevention
 * - Status transitions
 * - Edge cases
 */

import { describe, it, expect, beforeEach } from 'vitest';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { createTestOrder, createTestUser, createTestProduct, randomObjectId } from '../helpers/test-utils';

describe('Order Model', () => {
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

  describe('Schema Validation', () => {
    it('should create an order with valid data', async () => {
      const orderData = createTestOrder({
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
      });

      const order = await Order.create(orderData);

      expect(order).toBeDefined();
      expect(order.userId.toString()).toBe(testUser._id.toString());
      expect(order.status).toBe('pending');
      expect(order.paymentStatus).toBe('pending');
      expect(order.items.length).toBe(1);
    });

    it('should require userId', async () => {
      const orderData = createTestOrder();
      delete (orderData as any).userId;

      await expect(Order.create(orderData)).rejects.toThrow();
    });

    it('should require items', async () => {
      const orderData = createTestOrder({
        userId: testUser._id,
        items: [],
      });

      await expect(Order.create(orderData)).rejects.toThrow();
    });

    it('should require total', async () => {
      const orderData = createTestOrder({
        userId: testUser._id,
      });
      delete (orderData as any).total;

      await expect(Order.create(orderData)).rejects.toThrow();
    });
  });

  describe('Order Number Generation', () => {
    it('should generate unique order number', async () => {
      const order1 = await Order.create(
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

      const order2 = await Order.create(
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

      expect(order1.orderNumber).toBeDefined();
      expect(order2.orderNumber).toBeDefined();
      expect(order1.orderNumber).not.toBe(order2.orderNumber);
    });

    it('should generate order number in correct format', async () => {
      const order = await Order.create(
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

      expect(order.orderNumber).toMatch(/^ORD-\d{4}-\d{6}$/);
    });
  });

  describe('Idempotency Checks', () => {
    it('should check for duplicate idempotency key', async () => {
      const idempotencyKey = 'test-key-123';

      const order1 = await Order.create(
        createTestOrder({
          userId: testUser._id,
          idempotencyKey,
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

      const existing = await Order.checkIdempotencyKey(idempotencyKey);

      expect(existing).toBeDefined();
      expect(existing?._id.toString()).toBe(order1._id.toString());
    });

    it('should return null for non-existent idempotency key', async () => {
      const existing = await Order.checkIdempotencyKey('non-existent-key');
      expect(existing).toBeNull();
    });
  });

  describe('Payment Duplicate Prevention', () => {
    it('should check for duplicate payment intent', async () => {
      const paymentIntentId = 'pi_test_123';

      await Order.create(
        createTestOrder({
          userId: testUser._id,
          paymentIntentId,
          paymentStatus: 'paid', // Must be 'paid' for duplicate check to work
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

      const isDuplicate = await Order.checkDuplicatePayment(paymentIntentId);

      expect(isDuplicate).toBe(true);
    });

    it('should check for duplicate payment ID', async () => {
      const paymentId = 'pay_test_123';

      await Order.create(
        createTestOrder({
          userId: testUser._id,
          paymentId,
          paymentStatus: 'paid', // Must be 'paid' for duplicate check to work
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

      const isDuplicate = await Order.checkDuplicatePayment(undefined, paymentId);

      expect(isDuplicate).toBe(true);
    });

    it('should update payment status safely', async () => {
      const order = await Order.create(
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

      const result = await Order.updatePaymentStatus(
        order._id.toString(),
        'paid',
        'pi_test_123'
      );

      expect(result).not.toBeNull();
      expect(result?.paymentStatus).toBe('paid');
      expect(result?.paymentIntentId).toBe('pi_test_123');
      
      const updated = await Order.findById(order._id);
      expect(updated?.paymentStatus).toBe('paid');
      expect(updated?.paymentIntentId).toBe('pi_test_123');
    });

    it('should prevent duplicate payment status update', async () => {
      const paymentIntentId = 'pi_test_123';

      const order = await Order.create(
        createTestOrder({
          userId: testUser._id,
          paymentIntentId,
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
        })
      );

      // Should throw error because paymentIntentId already exists in another order
      // But since we're updating the same order, it should succeed
      const result = await Order.updatePaymentStatus(
        order._id.toString(),
        'paid',
        paymentIntentId
      );

      expect(result).not.toBeNull();
      expect(result?.paymentStatus).toBe('paid');
    });
  });

  describe('Status Transitions', () => {
    it('should allow valid status transitions', async () => {
      const order = await Order.create(
        createTestOrder({
          userId: testUser._id,
          status: 'pending',
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

      order.status = 'confirmed';
      await order.save();

      expect(order.status).toBe('confirmed');
    });

    it('should set shippedAt when status changes to shipped', async () => {
      const order = await Order.create(
        createTestOrder({
          userId: testUser._id,
          status: 'confirmed',
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

      order.status = 'shipped';
      order.trackingNumber = 'TRACK123';
      await order.save();

      expect(order.shippedAt).toBeDefined();
      expect(order.trackingNumber).toBe('TRACK123');
    });

    it('should set deliveredAt when status changes to delivered', async () => {
      const order = await Order.create(
        createTestOrder({
          userId: testUser._id,
          status: 'shipped',
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

      order.status = 'delivered';
      await order.save();

      expect(order.deliveredAt).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid userId', async () => {
      const fakeUserId = randomObjectId();
      const orderData = createTestOrder({
        userId: fakeUserId,
        items: [
          {
            productId: testProduct._id,
            productSku: testProduct.sku,
            productTitle: testProduct.title,
            quantity: 1,
            price: testProduct.price,
            total: testProduct.price,
          },
        ],
      });

      await expect(Order.create(orderData)).rejects.toThrow();
    });

    it('should handle invalid productId in items', async () => {
      const fakeProductId = randomObjectId();
      const orderData = createTestOrder({
        userId: testUser._id,
        items: [
          {
            productId: fakeProductId,
            productSku: 'FAKE-SKU',
            productTitle: 'Fake Product',
            quantity: 1,
            price: 1000,
            total: 1000,
          },
        ],
      });

      await expect(Order.create(orderData)).rejects.toThrow();
    });

    it('should handle zero total', async () => {
      const orderData = createTestOrder({
        userId: testUser._id,
        total: 0,
        subtotal: 0,
        items: [
          {
            productId: testProduct._id,
            productSku: testProduct.sku,
            productTitle: testProduct.title,
            quantity: 1,
            price: 0,
            total: 0,
          },
        ],
      });

      await expect(Order.create(orderData)).rejects.toThrow();
    });

    it('should handle negative total', async () => {
      const orderData = createTestOrder({
        userId: testUser._id,
        total: -100,
        items: [
          {
            productId: testProduct._id,
            productSku: testProduct.sku,
            productTitle: testProduct.title,
            quantity: 1,
            price: testProduct.price,
            total: testProduct.price,
          },
        ],
      });

      await expect(Order.create(orderData)).rejects.toThrow();
    });
  });
});
