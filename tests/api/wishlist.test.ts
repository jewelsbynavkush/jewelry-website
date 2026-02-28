/**
 * Wishlist API Tests
 *
 * GET /api/wishlist - list wishlist (auth required)
 * POST /api/wishlist - add product (auth required)
 * DELETE /api/wishlist/[productId] - remove product (auth required)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GET, POST } from '@/app/api/wishlist/route';
import { DELETE } from '@/app/api/wishlist/[productId]/route';
import {
  createMockRequest,
  createAuthenticatedRequest,
  getJsonResponse,
  expectStatus,
} from '../helpers/api-helpers';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { createTestUser, createTestProduct } from '../helpers/test-utils';
import mongoose from 'mongoose';

describe('Wishlist API', () => {
  let testUser: InstanceType<typeof User>;
  let testProduct: InstanceType<typeof Product>;
  let testCategoryId: mongoose.Types.ObjectId;

  beforeEach(async () => {
    await connectDB();
    const cat = await Category.create({
      name: 'Rings',
      slug: 'rings-wishlist',
      displayName: 'Rings',
      image: 'https://example.com/rings.jpg',
      alt: 'Rings',
      active: true,
    });
    testCategoryId = cat._id;
    testUser = await User.create(createTestUser());
    testProduct = await Product.create(createTestProduct({ categoryId: testCategoryId }));
  });

  describe('GET /api/wishlist', () => {
    it('returns 401 when not authenticated', async () => {
      const request = createMockRequest('GET', 'http://localhost:3000/api/wishlist');
      const response = await GET(request);
      expectStatus(response, 401);
    });

    it('returns empty productIds for user with no wishlist', async () => {
      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'GET',
        'http://localhost:3000/api/wishlist'
      );
      const response = await GET(request);
      const data = await getJsonResponse(response);
      expectStatus(response, 200);
      expect(data.productIds).toEqual([]);
    });
  });

  describe('POST /api/wishlist', () => {
    it('returns 401 when not authenticated', async () => {
      const request = createMockRequest('POST', 'http://localhost:3000/api/wishlist', {
        productId: testProduct._id.toString(),
      });
      const response = await POST(request);
      expectStatus(response, 401);
    });

    it('adds product to wishlist and returns updated list', async () => {
      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'POST',
        'http://localhost:3000/api/wishlist',
        { productId: testProduct._id.toString() }
      );
      const response = await POST(request);
      const data = await getJsonResponse(response);
      expectStatus(response, 200);
      expect(data.success).toBe(true);
      expect(data.productIds).toContain(testProduct._id.toString());

      const getRequest = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'GET',
        'http://localhost:3000/api/wishlist'
      );
      const getResponse = await GET(getRequest);
      const getData = await getJsonResponse(getResponse);
      expect(getData.productIds).toContain(testProduct._id.toString());
    });

    it('does not corrupt user displayName or name when adding to wishlist (partial select + save)', async () => {
      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'POST',
        'http://localhost:3000/api/wishlist',
        { productId: testProduct._id.toString() }
      );
      const response = await POST(request);
      expectStatus(response, 200);

      const refetched = await User.findById(testUser._id)
        .select('firstName lastName displayName')
        .lean();
      expect(refetched?.firstName).toBe(testUser.firstName);
      expect(refetched?.lastName).toBe(testUser.lastName);
      expect(refetched?.displayName).not.toBe('undefined undefined');
      expect(refetched?.displayName).toBe(
        [refetched?.firstName, refetched?.lastName].filter(Boolean).join(' ').trim() || undefined
      );
    });
  });

  describe('DELETE /api/wishlist/[productId]', () => {
    it('returns 401 when not authenticated', async () => {
      const request = createMockRequest(
        'DELETE',
        `http://localhost:3000/api/wishlist/${testProduct._id}`
      );
      const response = await DELETE(request, {
        params: Promise.resolve({ productId: testProduct._id.toString() }),
      });
      expectStatus(response, 401);
    });

    it('removes product from wishlist', async () => {
      const userDoc = await User.findById(testUser._id).select('wishlist');
      if (userDoc) {
        userDoc.wishlist = [testProduct._id];
        await userDoc.save();
      }

      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'DELETE',
        `http://localhost:3000/api/wishlist/${testProduct._id}`,
        undefined
      );
      const response = await DELETE(request, {
        params: Promise.resolve({ productId: testProduct._id.toString() }),
      });
      const data = await getJsonResponse(response);
      expectStatus(response, 200);
      expect(data.success).toBe(true);
      expect(data.productIds).not.toContain(testProduct._id.toString());
    });

    it('does not corrupt user displayName when removing from wishlist (partial select + save)', async () => {
      const userDoc = await User.findById(testUser._id).select('wishlist');
      if (userDoc) {
        userDoc.wishlist = [testProduct._id];
        await userDoc.save();
      }

      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.email,
        'customer',
        'DELETE',
        `http://localhost:3000/api/wishlist/${testProduct._id}`,
        undefined
      );
      await DELETE(request, {
        params: Promise.resolve({ productId: testProduct._id.toString() }),
      });

      const refetched = await User.findById(testUser._id)
        .select('firstName lastName displayName')
        .lean();
      expect(refetched?.firstName).toBe(testUser.firstName);
      expect(refetched?.lastName).toBe(testUser.lastName);
      expect(refetched?.displayName).not.toBe('undefined undefined');
    });
  });
});
