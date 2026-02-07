/**
 * Inventory Restock API Tests
 * 
 * Tests for POST /api/inventory/[productId]/restock:
 * - Restock product (admin)
 * - Idempotency
 * - Inventory log creation
 * - Authorization
 * - Edge cases
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { POST } from '@/app/api/inventory/[productId]/restock/route';
import { createAdminRequest, createAuthenticatedRequest, getJsonResponse, expectStatus, expectSuccess, expectError, createObjectId } from '../../../helpers/api-helpers';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import InventoryLog from '@/models/InventoryLog';
import User from '@/models/User';
import { createTestUser, createTestProduct } from '../../../helpers/test-utils';

describe('POST /api/inventory/[productId]/restock', () => {
  let testProduct: any;
  let testCategory: any;
  let testAdmin: any;
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

    testAdmin = await User.create(createTestUser({ role: 'admin' }));
  });

  describe('Successful Restock', () => {
    it('should restock product as admin', async () => {
      const request = createAdminRequest(
        testAdmin._id.toString(),
        testAdmin.mobile,
        'POST',
        `http://localhost:3000/api/inventory/${testProduct._id.toString()}/restock`,
        {
          quantity: 5,
          reason: 'New stock received',
        }
      );

      const response = await POST(request, { params: Promise.resolve({ productId: testProduct._id.toString() }) });
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expectSuccess(data);
      expect(data.inventory.totalQuantity).toBe(initialStock + 5);

      const updated = await Product.findById(testProduct._id);
      expect(updated?.inventory.quantity).toBe(initialStock + 5);
    });

    it('should create inventory log', async () => {
      const request = createAdminRequest(
        testAdmin._id.toString(),
        testAdmin.mobile,
        'POST',
        `http://localhost:3000/api/inventory/${testProduct._id.toString()}/restock`,
        {
          quantity: 5,
          reason: 'New stock received',
        }
      );

      const response = await POST(request, { params: Promise.resolve({ productId: testProduct._id.toString() }) });
      const data = await getJsonResponse(response);
      
      expectStatus(response, 200);
      expectSuccess(data);

      // Wait a bit for transaction to commit
      await new Promise(resolve => setTimeout(resolve, 100));

      const logs = await InventoryLog.find({ productId: testProduct._id, type: 'restock' });
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].quantity).toBe(5);
    });

    it('should handle idempotency key', async () => {
      const idempotencyKey = 'restock-key-123';

      const request1 = createAdminRequest(
        testAdmin._id.toString(),
        testAdmin.mobile,
        'POST',
        `http://localhost:3000/api/inventory/${testProduct._id.toString()}/restock`,
        {
          quantity: 5,
          idempotencyKey,
        }
      );

      await POST(request1, { params: Promise.resolve({ productId: testProduct._id.toString() }) });

      // Try again with same key
      const request2 = createAdminRequest(
        testAdmin._id.toString(),
        testAdmin.mobile,
        'POST',
        `http://localhost:3000/api/inventory/${testProduct._id.toString()}/restock`,
        {
          quantity: 5,
          idempotencyKey,
        }
      );

      const response2 = await POST(request2, { params: Promise.resolve({ productId: testProduct._id.toString() }) });
      await getJsonResponse(response2);

      // Should succeed (idempotent)
      expectStatus(response2, 200);
    });
  });

  describe('Authorization', () => {
    it('should reject non-admin access', async () => {
      const customer = await User.create(createTestUser({ role: 'customer' }));

      const request = createAuthenticatedRequest(
        customer._id.toString(),
        customer.mobile,
        'customer',
        'POST',
        `http://localhost:3000/api/inventory/${testProduct._id.toString()}/restock`,
        {
          quantity: 5,
        }
      );

      const response = await POST(request, { params: Promise.resolve({ productId: testProduct._id.toString() }) });
      expectStatus(response, 403);
    });
  });

  describe('Validation Errors', () => {
    it('should reject missing quantity', async () => {
      const request = createAdminRequest(
        testAdmin._id.toString(),
        testAdmin.mobile,
        'POST',
        `http://localhost:3000/api/inventory/${testProduct._id.toString()}/restock`,
        {}
      );

      const response = await POST(request, { params: Promise.resolve({ productId: testProduct._id.toString() }) });
      const data = await getJsonResponse(response);

      expectStatus(response, 400);
      expectError(data);
    });

    it('should reject zero quantity', async () => {
      const request = createAdminRequest(
        testAdmin._id.toString(),
        testAdmin.mobile,
        'POST',
        `http://localhost:3000/api/inventory/${testProduct._id.toString()}/restock`,
        {
          quantity: 0,
        }
      );

      const response = await POST(request, { params: Promise.resolve({ productId: testProduct._id.toString() }) });
      const data = await getJsonResponse(response);

      expectStatus(response, 400);
      expectError(data);
    });

    it('should reject invalid productId', async () => {
      const request = createAdminRequest(
        testAdmin._id.toString(),
        testAdmin.mobile,
        'POST',
        `http://localhost:3000/api/inventory/${createObjectId()}/restock`,
        {
          quantity: 5,
        }
      );

      const response = await POST(request, { params: Promise.resolve({ productId: createObjectId() }) });
      const data = await getJsonResponse(response);

      expectStatus(response, 404);
      expectError(data);
    });
  });
});
