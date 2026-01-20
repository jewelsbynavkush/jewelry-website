/**
 * Inventory Logs API Tests
 * 
 * Tests for GET /api/inventory/logs:
 * - Get logs (admin)
 * - Filter by product
 * - Filter by order
 * - Filter by type
 * - Pagination
 * - Edge cases
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GET } from '@/app/api/inventory/logs/route';
import { createAdminRequest, createAuthenticatedRequest, getJsonResponse, expectStatus } from '../../helpers/api-helpers';
import connectDB from '@/lib/mongodb';
import InventoryLog from '@/models/InventoryLog';
import Product from '@/models/Product';
import Category from '@/models/Category';
import User from '@/models/User';
import { createTestUser, createTestProduct, createTestInventoryLog } from '../../helpers/test-utils';

describe('GET /api/inventory/logs', () => {
  let testProduct: any;
  let testCategory: any;
  let testAdmin: any;

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

    testProduct = await Product.create(
      createTestProduct({
        categoryId: testCategory._id,
      })
    );

    testAdmin = await User.create(createTestUser({ role: 'admin' }));

    // Create test logs
    await InventoryLog.create(
      createTestInventoryLog({
        productId: testProduct._id,
        type: 'sale',
      })
    );
    await InventoryLog.create(
      createTestInventoryLog({
        productId: testProduct._id,
        type: 'restock',
      })
    );
  });

  describe('Successful Retrieval', () => {
    it('should get all logs as admin', async () => {
      const request = createAdminRequest(
        testAdmin._id.toString(),
        testAdmin.mobile,
        'GET',
        'http://localhost:3000/api/inventory/logs'
      );

      const response = await GET(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expect(data.logs).toBeDefined();
      expect(data.logs.length).toBeGreaterThan(0);
    });

    it('should filter by productId', async () => {
      const request = createAdminRequest(
        testAdmin._id.toString(),
        testAdmin.mobile,
        'GET',
        `http://localhost:3000/api/inventory/logs?productId=${testProduct._id.toString()}`
      );

      const response = await GET(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expect(data.logs.every((log: any) => log.productId === testProduct._id.toString())).toBe(true);
    });

    it('should filter by type', async () => {
      const request = createAdminRequest(
        testAdmin._id.toString(),
        testAdmin.mobile,
        'GET',
        'http://localhost:3000/api/inventory/logs?type=sale'
      );

      const response = await GET(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expect(data.logs.every((log: any) => log.type === 'sale')).toBe(true);
    });

    it('should paginate results', async () => {
      const request = createAdminRequest(
        testAdmin._id.toString(),
        testAdmin.mobile,
        'GET',
        'http://localhost:3000/api/inventory/logs?limit=1&page=1'
      );

      const response = await GET(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expect(data.logs.length).toBeLessThanOrEqual(1);
      expect(data.pagination).toBeDefined();
    });
  });

  describe('Authorization', () => {
    it('should reject non-admin access', async () => {
      const customer = await User.create(createTestUser({ role: 'customer' }));

      const request = createAuthenticatedRequest(
        customer._id.toString(),
        customer.mobile,
        'customer',
        'GET',
        'http://localhost:3000/api/inventory/logs'
      );

      const response = await GET(request);
      expectStatus(response, 403);
    });
  });
});
