/**
 * Country Test Helpers
 * 
 * Helper functions for testing with country settings:
 * - Create test country settings in DB
 * - Mock country settings functions
 * - Default test country data
 */

import CountrySettings from '@/models/CountrySettings';
import { DEFAULT_COUNTRY } from '@/lib/constants';

/**
 * Create test country settings in database
 * Uses India as default test country
 */
export async function createTestCountrySettings(overrides: Partial<typeof DEFAULT_COUNTRY> = {}) {
  return await CountrySettings.create({
    countryCode: 'IN',
    countryName: 'India',
    phoneCountryCode: '+91',
    phonePattern: '^[0-9]{10}$',
    phoneLength: 10,
    pincodePattern: '^[0-9]{6}$',
    pincodeLength: 6,
    pincodeLabel: 'Pincode',
    states: [
      'Andhra Pradesh',
      'Arunachal Pradesh',
      'Assam',
      'Bihar',
      'Chhattisgarh',
      'Goa',
      'Gujarat',
      'Haryana',
      'Himachal Pradesh',
      'Jharkhand',
      'Karnataka',
      'Kerala',
      'Madhya Pradesh',
      'Maharashtra',
      'Manipur',
      'Meghalaya',
      'Mizoram',
      'Nagaland',
      'Odisha',
      'Punjab',
      'Rajasthan',
      'Sikkim',
      'Tamil Nadu',
      'Telangana',
      'Tripura',
      'Uttar Pradesh',
      'Uttarakhand',
      'West Bengal',
      'Andaman and Nicobar Islands',
      'Chandigarh',
      'Dadra and Nagar Haveli and Daman and Diu',
      'Delhi',
      'Jammu and Kashmir',
      'Ladakh',
      'Lakshadweep',
      'Puducherry',
      'Test State', // For test environment
    ],
    currency: 'INR',
    currencySymbol: '₹',
    isActive: true,
    isDefault: true,
    order: 0,
    ...overrides,
  });
}

/**
 * Get default test address data (India)
 */
export function getTestAddressData() {
  return {
    firstName: 'Test',
    lastName: 'User',
    addressLine1: '123 Test Street',
    city: 'Test City',
    state: 'Test State', // Allowed in test environment
    zipCode: '123456', // 6 digits for India
    country: 'India',
    phone: '9876543210', // 10 digits for India
    countryCode: '+91',
  };
}
