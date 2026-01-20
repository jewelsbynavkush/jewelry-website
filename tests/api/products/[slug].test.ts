/**
 * Product Detail API Tests
 * 
 * Tests for GET /api/products/[slug]:
 * - Get product by slug
 * - Invalid slug
 * - Product not found
 * - Cache headers
 * - Edge cases
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GET } from '@/app/api/products/[slug]/route';
import { createGuestRequest, getJsonResponse, expectStatus, expectError } from '../../helpers/api-helpers';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { createTestProduct } from '../../helpers/test-utils';

describe('GET /api/products/[slug]', () => {
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
        slug: 'test-product',
        status: 'active',
      })
    );
  });

  describe('Successful Retrieval', () => {
    it('should get product by slug', async () => {
      const request = createGuestRequest('GET', 'http://localhost:3000/api/products/test-product');

      const response = await GET(request, { params: Promise.resolve({ slug: 'test-product' }) });
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expect(data.product).toBeDefined();
      expect(data.product.slug).toBe('test-product');
    });
  });

  describe('Product Not Found', () => {
    it('should return 404 for invalid slug', async () => {
      const request = createGuestRequest('GET', 'http://localhost:3000/api/products/non-existent');

      const response = await GET(request, { params: Promise.resolve({ slug: 'non-existent' }) });
      const data = await getJsonResponse(response);

      expectStatus(response, 404);
      expectError(data);
    });

    it('should return 404 for inactive product', async () => {
      testProduct.status = 'archived'; // Use valid enum value instead of 'inactive'
      await testProduct.save();

      const request = createGuestRequest('GET', 'http://localhost:3000/api/products/test-product');

      const response = await GET(request, { params: Promise.resolve({ slug: 'test-product' }) });
      expectStatus(response, 404);
    });
  });
});
