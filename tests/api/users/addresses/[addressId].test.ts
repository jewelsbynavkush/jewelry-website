/**
 * User Address Detail API Tests
 * 
 * Tests for Address Detail operations:
 * - PATCH /api/users/addresses/[addressId] (update address)
 * - DELETE /api/users/addresses/[addressId] (delete address)
 * - Default address updates
 * - Edge cases
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PATCH, DELETE } from '@/app/api/users/addresses/[addressId]/route';
import { createAuthenticatedRequest, getJsonResponse, expectStatus, expectSuccess, expectError } from '../../../helpers/api-helpers';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { createTestUser } from '../../../helpers/test-utils';

describe('User Address Detail API', () => {
  let testUser: any;
  let addressId: string;

  beforeEach(async () => {
    await connectDB();
    testUser = await User.create(createTestUser());

    // Add test address
    addressId = testUser.addAddress({
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
  });

  describe('PATCH /api/users/addresses/[addressId]', () => {
    it('should update address fields', async () => {
      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.mobile,
        'customer',
        'PATCH',
        `http://localhost:3000/api/users/addresses/${addressId}`,
        {
          firstName: 'Updated',
          city: 'Updated City',
        }
      );

      const response = await PATCH(request, { params: Promise.resolve({ addressId }) });
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expectSuccess(data);
      expect(data.address.firstName).toBe('Updated');
      expect(data.address.city).toBe('Updated City');
    });

    it('should update default address', async () => {
      // Add second address
      const addressId2 = testUser.addAddress({
        type: 'shipping',
        firstName: 'Test2',
        lastName: 'User2',
        addressLine1: '456 Test St',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        country: 'India',
        isDefault: false,
      });
      await testUser.save();

      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.mobile,
        'customer',
        'PATCH',
        `http://localhost:3000/api/users/addresses/${addressId2}`,
        {
          isDefault: true,
        }
      );

      const response = await PATCH(request, { params: Promise.resolve({ addressId: addressId2 }) });
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expect(data.defaultShippingAddressId).toBe(addressId2);
    });

    it('should reject invalid addressId', async () => {
      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.mobile,
        'customer',
        'PATCH',
        'http://localhost:3000/api/users/addresses/invalid-id',
        {
          firstName: 'Updated',
        }
      );

      const response = await PATCH(request, { params: Promise.resolve({ addressId: 'invalid-id' }) });
      const data = await getJsonResponse(response);

      expectStatus(response, 404);
      expectError(data);
    });
  });

  describe('DELETE /api/users/addresses/[addressId]', () => {
    it('should delete address', async () => {
      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.mobile,
        'customer',
        'DELETE',
        `http://localhost:3000/api/users/addresses/${addressId}`
      );

      const response = await DELETE(request, { params: Promise.resolve({ addressId }) });
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expectSuccess(data);
      expect(data.addresses.length).toBe(0);
      expect(data.defaultShippingAddressId).toBeUndefined();
    });

    it('should clear default address ID when deleting default', async () => {
      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.mobile,
        'customer',
        'DELETE',
        `http://localhost:3000/api/users/addresses/${addressId}`
      );

      await DELETE(request, { params: Promise.resolve({ addressId }) });

      const updated = await User.findById(testUser._id);
      expect(updated?.defaultShippingAddressId).toBeUndefined();
    });

    it('should reject invalid addressId', async () => {
      const request = createAuthenticatedRequest(
        testUser._id.toString(),
        testUser.mobile,
        'customer',
        'DELETE',
        'http://localhost:3000/api/users/addresses/invalid-id'
      );

      const response = await DELETE(request, { params: Promise.resolve({ addressId: 'invalid-id' }) });
      const data = await getJsonResponse(response);

      expectStatus(response, 404);
      expectError(data);
    });
  });
});
