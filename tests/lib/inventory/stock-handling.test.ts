/**
 * Stock Handling Tests
 *
 * Covers reserve, release, confirm sale, cancel restore, and GET cart
 * behavior when availableQuantity is 0 (reserved for current cart).
 */

import { describe, it, expect, beforeEach } from 'vitest';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import {
  reserveStockForCart,
  releaseReservedStock,
  confirmOrderAndUpdateStock,
  cancelOrderAndRestoreStock,
  checkProductAvailability,
  getInventorySummary,
} from '@/lib/inventory/inventory-service';
import { createTestProduct } from '../../helpers/test-utils';
import mongoose from 'mongoose';

describe.sequential('Stock handling', () => {
  let testCategory: mongoose.Types.ObjectId;

  beforeEach(async () => {
    await connectDB();
    const cat = await Category.create({
      name: 'Rings',
      slug: 'rings',
      displayName: 'Rings',
      image: 'https://example.com/rings.jpg',
      alt: 'Rings',
      active: true,
    });
    testCategory = cat._id;
  });

  describe('reserveStockForCart and releaseReservedStock', () => {
    it('reserves stock and increases reservedQuantity', async () => {
      const product = await Product.create(
        createTestProduct({
          categoryId: testCategory,
          inventory: {
            quantity: 5,
            reservedQuantity: 0,
            lowStockThreshold: 2,
            trackQuantity: true,
            allowBackorder: false,
            location: 'wh',
          },
        })
      );

      const result = await reserveStockForCart(product._id.toString(), 2, undefined);
      expect(result.success).toBe(true);

      const updated = await Product.findById(product._id).lean();
      expect(updated?.inventory.reservedQuantity).toBe(2);
      expect(updated?.inventory.quantity).toBe(5);
    });

    it('fails to reserve when available is insufficient and no backorder', async () => {
      const product = await Product.create(
        createTestProduct({
          categoryId: testCategory,
          inventory: {
            quantity: 2,
            reservedQuantity: 0,
            lowStockThreshold: 2,
            trackQuantity: true,
            allowBackorder: false,
            location: 'wh',
          },
        })
      );

      const result = await reserveStockForCart(product._id.toString(), 5, undefined);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();

      const updated = await Product.findById(product._id).lean();
      expect(updated?.inventory.reservedQuantity).toBe(0);
    });

    it('releases reserved stock and decreases reservedQuantity', async () => {
      const product = await Product.create(
        createTestProduct({
          categoryId: testCategory,
          inventory: {
            quantity: 5,
            reservedQuantity: 3,
            lowStockThreshold: 2,
            trackQuantity: true,
            allowBackorder: false,
            location: 'wh',
          },
        })
      );

      const result = await releaseReservedStock(product._id.toString(), 2, undefined);
      expect(result.success).toBe(true);

      const updated = await Product.findById(product._id).lean();
      expect(updated?.inventory.reservedQuantity).toBe(1);
    });

    it('fails to release more than reservedQuantity', async () => {
      const product = await Product.create(
        createTestProduct({
          categoryId: testCategory,
          inventory: {
            quantity: 5,
            reservedQuantity: 2,
            lowStockThreshold: 2,
            trackQuantity: true,
            allowBackorder: false,
            location: 'wh',
          },
        })
      );

      const result = await releaseReservedStock(product._id.toString(), 5, undefined);
      expect(result.success).toBe(false);

      const updated = await Product.findById(product._id).lean();
      expect(updated?.inventory.reservedQuantity).toBe(2);
    });
  });

  describe('availableQuantity 0 (all reserved for cart)', () => {
    it('checkProductAvailability reports available 0 when all reserved', async () => {
      const product = await Product.create(
        createTestProduct({
          categoryId: testCategory,
          inventory: {
            quantity: 1,
            reservedQuantity: 1,
            lowStockThreshold: 1,
            trackQuantity: true,
            allowBackorder: false,
            location: 'wh',
          },
        })
      );

      const summary = await getInventorySummary(product._id.toString());
      expect(summary).not.toBeNull();
      expect(summary!.availableQuantity).toBe(0);
      expect(summary!.reservedQuantity).toBe(1);
      expect(summary!.quantity).toBe(1);

      const availability = await checkProductAvailability(product._id.toString(), 1);
      expect(availability.availableQuantity).toBe(0);
      expect(availability.available).toBe(false);
    });
  });

  describe('confirmOrderAndUpdateStock', () => {
    it('reduces quantity and reservedQuantity and increments salesCount', async () => {
      const product = await Product.create(
        createTestProduct({
          categoryId: testCategory,
          inventory: {
            quantity: 10,
            reservedQuantity: 2,
            lowStockThreshold: 2,
            trackQuantity: true,
            allowBackorder: false,
            location: 'wh',
          },
        })
      );
      const orderId = new mongoose.Types.ObjectId();
      const orderItems = [
        { productId: product._id.toString(), quantity: 2, sku: product.sku },
      ];

      const result = await confirmOrderAndUpdateStock(orderItems, orderId.toString());
      expect(result.success).toBe(true);

      const updated = await Product.findById(product._id).lean();
      expect(updated?.inventory.quantity).toBe(8);
      expect(updated?.inventory.reservedQuantity).toBe(0);
      expect(updated?.salesCount).toBe(2);
    });

    it('is idempotent when same orderId already processed', async () => {
      const product = await Product.create(
        createTestProduct({
          categoryId: testCategory,
          inventory: {
            quantity: 10,
            reservedQuantity: 2,
            lowStockThreshold: 2,
            trackQuantity: true,
            allowBackorder: false,
            location: 'wh',
          },
        })
      );
      const orderId = new mongoose.Types.ObjectId();
      const orderItems = [
        { productId: product._id.toString(), quantity: 2, sku: product.sku },
      ];
      const idempotencyKey = `order-${orderId.toString()}`;

      const first = await confirmOrderAndUpdateStock(
        orderItems,
        orderId.toString(),
        idempotencyKey
      );
      expect(first.success).toBe(true);

      const second = await confirmOrderAndUpdateStock(
        orderItems,
        orderId.toString(),
        idempotencyKey
      );
      expect(second.success).toBe(true);
      expect(second.products).toEqual([]);

      const updated = await Product.findById(product._id).lean();
      expect(updated?.inventory.quantity).toBe(8);
      expect(updated?.inventory.reservedQuantity).toBe(0);
    });
  });

  describe('cancelOrderAndRestoreStock', () => {
    it('restores quantity when order is cancelled', async () => {
      const product = await Product.create(
        createTestProduct({
          categoryId: testCategory,
          inventory: {
            quantity: 8,
            reservedQuantity: 0,
            lowStockThreshold: 2,
            trackQuantity: true,
            allowBackorder: false,
            location: 'wh',
          },
        })
      );
      const orderId = new mongoose.Types.ObjectId();
      const orderItems = [
        { productId: product._id.toString(), quantity: 2, sku: product.sku },
      ];

      const result = await cancelOrderAndRestoreStock(orderItems, orderId.toString());
      expect(result.success).toBe(true);

      const updated = await Product.findById(product._id).lean();
      expect(updated?.inventory.quantity).toBe(10);
    });
  });
});
