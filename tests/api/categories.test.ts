/**
 * Categories API Tests
 * 
 * Tests for GET /api/categories:
 * - Get active categories
 * - Cache headers
 * - Edge cases
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GET } from '@/app/api/categories/route';
import { createGuestRequest, getJsonResponse, expectStatus } from '../helpers/api-helpers';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import { createTestCategory } from '../helpers/test-utils';

describe('GET /api/categories', () => {
  beforeEach(async () => {
    await connectDB();
  });

  describe('Successful Retrieval', () => {
    it('should get active categories', async () => {
      await Category.create(createTestCategory({ name: 'Active Category', active: true }));
      await Category.create(createTestCategory({ name: 'Inactive Category', active: false }));

      const request = createGuestRequest('GET', 'http://localhost:3000/api/categories');

      const response = await GET(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expect(data.categories).toBeDefined();
      expect(data.categories.length).toBeGreaterThan(0);
      expect(data.categories.every((c: any) => c.active === true)).toBe(true);
    });

    it('should return empty array when no active categories', async () => {
      await Category.create(createTestCategory({ active: false }));

      const request = createGuestRequest('GET', 'http://localhost:3000/api/categories');

      const response = await GET(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expect(data.categories).toEqual([]);
    });
  });
});
