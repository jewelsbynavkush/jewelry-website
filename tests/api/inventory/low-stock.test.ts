/**
 * Low Stock API Tests
 * 
 * Tests for GET /api/inventory/low-stock:
 * - Get low stock products (admin)
 * - Threshold calculation
 * - Authorization
 * - Edge cases
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GET } from '@/app/api/inventory/low-stock/route';
import { createAdminRequest, createAuthenticatedRequest, getJsonResponse, expectStatus } from '../../helpers/api-helpers';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import User from '@/models/User';
import { createTestUser, createTestProduct } from '../../helpers/test-utils';

describe('GET /api/inventory/low-stock', () => {
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

    testAdmin = await User.create(createTestUser({ role: 'admin' }));

    // Create products with different stock levels
    await Product.create(
      createTestProduct({
        categoryId: testCategory._id,
        slug: 'low-stock-1',
        inventory: {
          quantity: 3,
          reservedQuantity: 0,
          lowStockThreshold: 5,
          trackQuantity: true,
          allowBackorder: false,
          location: 'warehouse-1',
        },
      })
    );

    await Product.create(
      createTestProduct({
        categoryId: testCategory._id,
        slug: 'low-stock-2',
        inventory: {
          quantity: 2,
          reservedQuantity: 0,
          lowStockThreshold: 5,
          trackQuantity: true,
          allowBackorder: false,
          location: 'warehouse-1',
        },
      })
    );

    await Product.create(
      createTestProduct({
        categoryId: testCategory._id,
        slug: 'normal-stock',
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
  });

  describe('Successful Retrieval', () => {
    it('should get low stock products as admin', async () => {
      const request = createAdminRequest(
        testAdmin._id.toString(),
        testAdmin.mobile,
        'GET',
        'http://localhost:3000/api/inventory/low-stock'
      );

      const response = await GET(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expect(data.products).toBeDefined();
      expect(data.products.length).toBeGreaterThanOrEqual(2);
      expect(data.products.every((p: any) => p.totalQuantity <= p.lowStockThreshold)).toBe(true);
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
        'http://localhost:3000/api/inventory/low-stock'
      );

      const response = await GET(request);
      expectStatus(response, 403);
    });
  });
});
