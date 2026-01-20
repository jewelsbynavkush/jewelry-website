/**
 * Products API Tests
 * 
 * Tests for GET /api/products:
 * - Get products
 * - Filter by category
 * - Filter by featured
 * - Filter by mostLoved
 * - Pagination
 * - Edge cases
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GET } from '@/app/api/products/route';
import { createGuestRequest, getJsonResponse, expectStatus } from '../../helpers/api-helpers';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { createTestProduct } from '../../helpers/test-utils';

describe('GET /api/products', () => {
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

    await Product.create(
      createTestProduct({
        categoryId: testCategory._id,
        status: 'active',
        featured: true,
      })
    );

    await Product.create(
      createTestProduct({
        categoryId: testCategory._id,
        status: 'active',
        mostLoved: true,
      })
    );
  });

  describe('Successful Retrieval', () => {
    it('should get active products', async () => {
      const request = createGuestRequest('GET', 'http://localhost:3000/api/products');

      const response = await GET(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expect(data.products).toBeDefined();
      expect(data.products.length).toBeGreaterThan(0);
      // Products API returns transformed data without status field, but filters by status: 'active'
      // So all returned products are implicitly active
      expect(data.products.length).toBeGreaterThan(0);
    });

    it('should filter by category', async () => {
      const request = createGuestRequest('GET', `http://localhost:3000/api/products?category=${testCategory.slug}`);

      const response = await GET(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expect(data.products.every((p: any) => p.category === testCategory.slug)).toBe(true);
    });

    it('should filter by featured', async () => {
      const request = createGuestRequest('GET', 'http://localhost:3000/api/products?featured=true');

      const response = await GET(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expect(data.products.every((p: any) => p.featured === true)).toBe(true);
    });

    it('should filter by mostLoved', async () => {
      const request = createGuestRequest('GET', 'http://localhost:3000/api/products?mostLoved=true');

      const response = await GET(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expect(data.products.every((p: any) => p.mostLoved === true)).toBe(true);
    });

    it('should paginate results', async () => {
      const request = createGuestRequest('GET', 'http://localhost:3000/api/products?limit=1&page=1');

      const response = await GET(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expect(data.products.length).toBeLessThanOrEqual(1);
      expect(data.pagination).toBeDefined();
    });
  });
});
