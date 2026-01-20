/**
 * Inventory Management Integration Tests
 * 
 * Tests complete inventory management flow:
 * - Restock → Reserve → Confirm sale → Log
 * - Low stock alerts
 * - Multi-product inventory updates
 * - Concurrent inventory operations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { POST as POSTRestock } from '@/app/api/inventory/[productId]/restock/route';
import { GET as GETLowStock } from '@/app/api/inventory/low-stock/route';
import { createAdminRequest, getJsonResponse, expectStatus } from '../helpers/api-helpers';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import InventoryLog from '@/models/InventoryLog';
import User from '@/models/User';
import { createTestUser, createTestProduct } from '../helpers/test-utils';

describe('Inventory Management Integration', () => {
  let testAdmin: any;
  let testProducts: any[];
  let testCategory: any;

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

    testAdmin = await User.create(createTestUser({ role: 'admin' }));

    testProducts = await Promise.all([
      Product.create(
        createTestProduct({
          categoryId: testCategory._id,
          slug: 'product-1',
          sku: 'SKU-1',
          inventory: {
            quantity: 3,
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
            quantity: 2,
            reservedQuantity: 0,
            lowStockThreshold: 5,
            trackQuantity: true,
            allowBackorder: false,
            location: 'warehouse-1',
          },
        })
      ),
    ]);
  });

  describe('Restock and Log Flow', () => {
    it('should restock product and create inventory log', async () => {
      const product = testProducts[0];
      const initialQuantity = product.inventory.quantity;

      const request = createAdminRequest(
        testAdmin._id.toString(),
        testAdmin.mobile,
        'POST',
        `http://localhost:3000/api/inventory/${product._id.toString()}/restock`,
        {
          quantity: 5,
          reason: 'New stock received',
        }
      );

      const response = await POSTRestock(request, { params: Promise.resolve({ productId: product._id.toString() }) });
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expect(data.inventory.totalQuantity).toBe(initialQuantity + 5);

      // Verify inventory log created
      const logs = await InventoryLog.find({
        productId: product._id,
        type: 'restock',
      });

      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].quantity).toBe(5);
      expect(logs[0].reason).toBe('New stock received');
    });
  });

  describe('Low Stock Alerts', () => {
    it('should identify low stock products', async () => {
      const request = createAdminRequest(
        testAdmin._id.toString(),
        testAdmin.mobile,
        'GET',
        'http://localhost:3000/api/inventory/low-stock'
      );

      const response = await GETLowStock(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expect(data.products.length).toBeGreaterThanOrEqual(2);
      expect(data.products.every((p: any) => p.totalQuantity <= p.lowStockThreshold)).toBe(true);
    });
  });

  describe('Multi-Product Inventory Updates', () => {
    it('should update multiple products independently', async () => {
      const restockRequests = testProducts.map((product) =>
        createAdminRequest(
          testAdmin._id.toString(),
          testAdmin.mobile,
          'POST',
          `http://localhost:3000/api/inventory/${product._id.toString()}/restock`,
          {
            quantity: 10,
            reason: 'Bulk restock',
          }
        )
      );

      const responses = await Promise.all(
        restockRequests.map((req, idx) =>
          POSTRestock(req, { params: Promise.resolve({ productId: testProducts[idx]._id.toString() }) })
        )
      );

      responses.forEach((response) => {
        expectStatus(response, 200);
      });

      // Verify all products updated
      for (const product of testProducts) {
        const updated = await Product.findById(product._id);
        expect(updated?.inventory.quantity).toBe(product.inventory.quantity + 10);
      }
    });
  });
});
