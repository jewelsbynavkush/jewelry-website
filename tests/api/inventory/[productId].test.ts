/**
 * Inventory Status API Tests
 * 
 * Tests for GET /api/inventory/[productId]:
 * - Get inventory status
 * - Product not found
 * - Cache headers
 * - Edge cases
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GET } from '@/app/api/inventory/[productId]/route';
import { getJsonResponse, expectStatus, createObjectId } from '../../helpers/api-helpers';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { createTestProduct } from '../../helpers/test-utils';

describe('GET /api/inventory/[productId]', () => {
  let testProduct: any;
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

    testProduct = await Product.create(
      createTestProduct({
        categoryId: testCategory._id,
        inventory: {
          quantity: 10,
          reservedQuantity: 3,
          lowStockThreshold: 5,
          trackQuantity: true,
          allowBackorder: false,
          location: 'warehouse-1',
        },
      })
    );
  });

  describe('Successful Retrieval', () => {
    it('should get inventory status for authenticated user', async () => {
      const { createAuthenticatedRequest } = await import('../../helpers/api-helpers');
      const testUser = await (await import('../../helpers/test-utils')).createTestUser();
      const User = (await import('@/models/User')).default;
      const user = await User.create(testUser);

      const request = createAuthenticatedRequest(
        user._id.toString(),
        user.mobile,
        'customer',
        'GET',
        `http://localhost:3000/api/inventory/${testProduct._id.toString()}`
      );

      const response = await GET(request, { params: Promise.resolve({ productId: testProduct._id.toString() }) });
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expect(data.inventory).toBeDefined();
      expect(data.inventory.totalQuantity).toBe(10);
      expect(data.inventory.reservedQuantity).toBe(3);
      expect(data.inventory.availableQuantity).toBe(7);
    });

    it('should get inventory status for admin', async () => {
      const { createAdminRequest } = await import('../../helpers/api-helpers');
      const testUser = await (await import('../../helpers/test-utils')).createTestUser();
      const User = (await import('@/models/User')).default;
      const admin = await User.create({ ...testUser, role: 'admin' });

      const request = createAdminRequest(
        admin._id.toString(),
        admin.mobile,
        'GET',
        `http://localhost:3000/api/inventory/${testProduct._id.toString()}`
      );

      const response = await GET(request, { params: Promise.resolve({ productId: testProduct._id.toString() }) });
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expect(data.inventory).toBeDefined();
    });
  });

  describe('Product Not Found', () => {
    it('should return 404 for invalid productId', async () => {
      const { createAuthenticatedRequest } = await import('../../helpers/api-helpers');
      const testUser = await (await import('../../helpers/test-utils')).createTestUser();
      const User = (await import('@/models/User')).default;
      const user = await User.create(testUser);

      const request = createAuthenticatedRequest(
        user._id.toString(),
        user.mobile,
        'customer',
        'GET',
        `http://localhost:3000/api/inventory/${createObjectId()}`
      );

      const response = await GET(request, { params: Promise.resolve({ productId: createObjectId() }) });
      expectStatus(response, 404);
    });
  });
});
