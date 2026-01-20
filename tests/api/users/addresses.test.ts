/**
 * User Addresses API Tests
 * 
 * Tests for User Addresses operations:
 * - GET /api/users/addresses (get addresses)
 * - POST /api/users/addresses (add address)
 * - Default address management
 * - Edge cases
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GET, POST } from '@/app/api/users/addresses/route';
import { createAuthenticatedRequest, getJsonResponse, expectStatus, expectSuccess, expectError } from '../../helpers/api-helpers';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { createTestUser } from '../../helpers/test-utils';

describe('User Addresses API', () => {
  let testUser: any;

  beforeEach(async () => {
    await connectDB();
    testUser = await User.create(createTestUser());
  });

  describe('GET /api/users/addresses', () => {
    it('should get empty addresses list', async () => {
      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.mobile,
        'customer',
        'GET',
        'http://localhost:3000/api/users/addresses'
      );

      const response = await GET(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expect(data.addresses).toEqual([]);
    });

    it('should get addresses with items', async () => {
      testUser.addAddress({
        type: 'shipping',
        firstName: 'Test',
        lastName: 'User',
        addressLine1: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        country: 'India',
        isDefault: true,
      });
      await testUser.save();

      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.mobile,
        'customer',
        'GET',
        'http://localhost:3000/api/users/addresses'
      );

      const response = await GET(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expect(data.addresses.length).toBe(1);
      expect(data.defaultShippingAddressId).toBeDefined();
    });
  });

  describe('POST /api/users/addresses', () => {
    it('should add shipping address', async () => {
      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.mobile,
        'customer',
        'POST',
        'http://localhost:3000/api/users/addresses',
        {
          type: 'shipping',
          firstName: 'Test',
          lastName: 'User',
          addressLine1: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
          country: 'India',
          isDefault: true,
        }
      );

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expectSuccess(data);
      expect(data.addressId).toBeDefined();
      expect(data.addresses.length).toBe(1);
      expect(data.defaultShippingAddressId).toBe(data.addressId);
    });

    it('should add billing address', async () => {
      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.mobile,
        'customer',
        'POST',
        'http://localhost:3000/api/users/addresses',
        {
          type: 'billing',
          firstName: 'Test',
          lastName: 'User',
          addressLine1: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
          country: 'India',
          isDefault: true,
        }
      );

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expect(data.defaultBillingAddressId).toBe(data.addressId);
    });

    it('should validate required fields', async () => {
      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.mobile,
        'customer',
        'POST',
        'http://localhost:3000/api/users/addresses',
        {
          type: 'shipping',
          // Missing required fields
        }
      );

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 400);
      expectError(data);
    });
  });
});
