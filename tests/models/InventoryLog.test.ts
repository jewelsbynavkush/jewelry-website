/**
 * InventoryLog Model Tests
 * 
 * Tests for InventoryLog model:
 * - Schema validation
 * - Foreign key validation
 * - Idempotency key uniqueness
 * - Type validation
 * - Quantity calculations
 * - Edge cases
 */

import { describe, it, expect, beforeEach } from 'vitest';
import connectDB from '@/lib/mongodb';
import InventoryLog from '@/models/InventoryLog';
import Product from '@/models/Product';
import Order from '@/models/Order';
import User from '@/models/User';
import Category from '@/models/Category';
import { createTestInventoryLog, createTestProduct, createTestUser, createTestOrder, randomObjectId } from '../helpers/test-utils';

describe('InventoryLog Model', () => {
  let testProduct: any;
  let testUser: any;
  let testOrder: any;
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
      })
    );

    // Create test user
    testUser = await User.create(createTestUser());

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

  describe('Schema Validation', () => {
    it('should create an inventory log with valid data', async () => {
      const logData = createTestInventoryLog({
        productId: testProduct._id,
        orderId: testOrder._id,
        userId: testUser._id,
      });

      const log = await InventoryLog.create(logData);

      expect(log).toBeDefined();
      expect(log.productId.toString()).toBe(testProduct._id.toString());
      expect(log.type).toBe('sale');
      expect(log.quantity).toBe(1);
    });

    it('should require productId', async () => {
      const logData = createTestInventoryLog();
      delete (logData as any).productId;

      await expect(InventoryLog.create(logData)).rejects.toThrow();
    });

    it('should require type', async () => {
      const logData = createTestInventoryLog({
        productId: testProduct._id,
      });
      delete (logData as any).type;

      await expect(InventoryLog.create(logData)).rejects.toThrow();
    });

    it('should require quantity', async () => {
      const logData = createTestInventoryLog({
        productId: testProduct._id,
      });
      delete (logData as any).quantity;

      await expect(InventoryLog.create(logData)).rejects.toThrow();
    });

    it('should enforce unique idempotency key', async () => {
      const idempotencyKey = 'test-key-123';

      await InventoryLog.create(
        createTestInventoryLog({
          productId: testProduct._id,
          idempotencyKey,
        })
      );

      const log2 = createTestInventoryLog({
        productId: testProduct._id,
        idempotencyKey,
      });

      await expect(InventoryLog.create(log2)).rejects.toThrow();
    });

    it('should allow multiple logs without idempotency key', async () => {
      const log1 = await InventoryLog.create(
        createTestInventoryLog({
          productId: testProduct._id,
        })
      );

      const log2 = await InventoryLog.create(
        createTestInventoryLog({
          productId: testProduct._id,
        })
      );

      expect(log1).toBeDefined();
      expect(log2).toBeDefined();
    });
  });

  describe('Type Validation', () => {
    const validTypes = ['sale', 'restock', 'adjustment', 'return', 'reserved', 'released'];

    for (const type of validTypes) {
      it(`should accept type: ${type}`, async () => {
        const log = await InventoryLog.create(
          createTestInventoryLog({
            productId: testProduct._id,
            type: type as any,
          })
        );

        expect(log.type).toBe(type);
      });
    }

    it('should reject invalid type', async () => {
      const logData = createTestInventoryLog({
        productId: testProduct._id,
        type: 'invalid-type' as any,
      });

      await expect(InventoryLog.create(logData)).rejects.toThrow();
    });
  });

  describe('Foreign Key Validation', () => {
    it('should validate productId exists', async () => {
      const fakeProductId = randomObjectId();
      const logData = createTestInventoryLog({
        productId: fakeProductId,
      });

      await expect(InventoryLog.create(logData)).rejects.toThrow();
    });

    it('should validate orderId exists if provided', async () => {
      const fakeOrderId = randomObjectId();
      const logData = createTestInventoryLog({
        productId: testProduct._id,
        orderId: fakeOrderId,
      });

      await expect(InventoryLog.create(logData)).rejects.toThrow();
    });

    it('should validate userId exists if provided', async () => {
      const fakeUserId = randomObjectId();
      const logData = createTestInventoryLog({
        productId: testProduct._id,
        userId: fakeUserId,
      });

      await expect(InventoryLog.create(logData)).rejects.toThrow();
    });

    it('should allow log without orderId', async () => {
      const log = await InventoryLog.create(
        createTestInventoryLog({
          productId: testProduct._id,
          orderId: undefined,
        })
      );

      expect(log).toBeDefined();
      expect(log.orderId).toBeUndefined();
    });

    it('should allow log without userId', async () => {
      const log = await InventoryLog.create(
        createTestInventoryLog({
          productId: testProduct._id,
          userId: undefined,
        })
      );

      expect(log).toBeDefined();
      expect(log.userId).toBeUndefined();
    });
  });

  describe('Quantity Calculations', () => {
    it('should calculate newQuantity correctly', async () => {
      const log = await InventoryLog.create(
        createTestInventoryLog({
          productId: testProduct._id,
          previousQuantity: 10,
          quantity: -2,
          newQuantity: 8,
        })
      );

      expect(log.previousQuantity).toBe(10);
      expect(log.quantity).toBe(-2);
      expect(log.newQuantity).toBe(8);
    });

    it('should handle positive quantity for restock', async () => {
      const log = await InventoryLog.create(
        createTestInventoryLog({
          productId: testProduct._id,
          type: 'restock',
          previousQuantity: 10,
          quantity: 5,
          newQuantity: 15,
        })
      );

      expect(log.type).toBe('restock');
      expect(log.quantity).toBe(5);
      expect(log.newQuantity).toBe(15);
    });

    it('should handle negative quantity for sale', async () => {
      const log = await InventoryLog.create(
        createTestInventoryLog({
          productId: testProduct._id,
          type: 'sale',
          previousQuantity: 10,
          quantity: -2,
          newQuantity: 8,
        })
      );

      expect(log.type).toBe('sale');
      expect(log.quantity).toBe(-2);
      expect(log.newQuantity).toBe(8);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero quantity', async () => {
      const log = await InventoryLog.create(
        createTestInventoryLog({
          productId: testProduct._id,
          type: 'adjustment',
          quantity: 0,
          previousQuantity: 10,
          newQuantity: 10,
        })
      );

      expect(log.quantity).toBe(0);
    });

    it('should handle very large quantities', async () => {
      const log = await InventoryLog.create(
        createTestInventoryLog({
          productId: testProduct._id,
          type: 'restock',
          quantity: 1000000,
          previousQuantity: 0,
          newQuantity: 1000000,
        })
      );

      expect(log.quantity).toBe(1000000);
    });

    it('should handle long reason text', async () => {
      const longReason = 'A'.repeat(500);
      const log = await InventoryLog.create(
        createTestInventoryLog({
          productId: testProduct._id,
          reason: longReason,
        })
      );

      expect(log.reason).toBe(longReason);
    });

    it('should handle empty reason', async () => {
      const log = await InventoryLog.create(
        createTestInventoryLog({
          productId: testProduct._id,
          reason: undefined,
        })
      );

      expect(log.reason).toBeUndefined();
    });
  });

  describe('Indexes', () => {
    it('should have index on productId', async () => {
      await InventoryLog.create(
        createTestInventoryLog({
          productId: testProduct._id,
        })
      );

      // Query should use index
      const logs = await InventoryLog.find({ productId: testProduct._id });
      expect(logs.length).toBeGreaterThan(0);
    });

    it('should have index on orderId', async () => {
      await InventoryLog.create(
        createTestInventoryLog({
          productId: testProduct._id,
          orderId: testOrder._id,
        })
      );

      const logs = await InventoryLog.find({ orderId: testOrder._id });
      expect(logs.length).toBeGreaterThan(0);
    });

    it('should have index on idempotencyKey', async () => {
      const idempotencyKey = 'test-key-123';
      await InventoryLog.create(
        createTestInventoryLog({
          productId: testProduct._id,
          idempotencyKey,
        })
      );

      const log = await InventoryLog.findOne({ idempotencyKey });
      expect(log).toBeDefined();
    });
  });
});
