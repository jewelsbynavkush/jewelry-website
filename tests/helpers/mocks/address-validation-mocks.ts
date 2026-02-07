/**
 * Address Validation Mocks
 * 
 * Mocks for address validation functions to prevent real DB calls.
 * All validation uses mocked country settings.
 */

import { vi } from 'vitest';
import { z } from 'zod';
import { mockCountrySettings } from './database-mocks';

/**
 * Mock address validation functions
 * These use mocked country settings, not real DB
 * NOTE: vi.mock() must be at top level
 */

// Mock address-country-aware validation - Must be at top level
vi.mock('@/lib/validations/address-country-aware', async () => {
    const actual = await vi.importActual('@/lib/validations/address-country-aware');
    return {
      ...actual,
      isValidPincode: vi.fn(async (pincode: string) => {
        // Use mocked country settings
        const regex = new RegExp(mockCountrySettings.pincodePattern);
        // Allow 5 digits in test environment
        if (/^[0-9]{5}$/.test(pincode)) return true;
        return regex.test(pincode.trim());
      }),
      isValidState: vi.fn(async (state: string) => {
        // Allow "Test State" in test environment
        if (state.trim().toLowerCase() === 'test state') return true;
        // Check against mocked states
        return mockCountrySettings.states.some(
          (s) => s.toLowerCase() === state.trim().toLowerCase()
        );
      }),
      isValidPhone: vi.fn(async (phone: string) => {
        const regex = new RegExp(mockCountrySettings.phonePattern);
        return regex.test(phone.trim());
      }),
      createPincodeSchema: vi.fn(() => {
        return z
          .string()
          .min(1, 'Pincode is required')
          .refine(
            async (val: string) => {
              // Allow 5 digits in test environment
              if (/^[0-9]{5}$/.test(val)) return true;
              const regex = new RegExp(mockCountrySettings.pincodePattern);
              return regex.test(val);
            },
            `Pincode must be exactly ${mockCountrySettings.pincodeLength} digits`
          );
      }),
      createStateSchema: vi.fn(() => {
        return z
          .string()
          .min(1, 'State is required')
          .max(100, 'State name is too long')
          .refine(
            async (state: string) => {
              if (state.trim().toLowerCase() === 'test state') return true;
              return mockCountrySettings.states.some(
                (s) => s.toLowerCase() === state.trim().toLowerCase()
              );
            },
            `Please enter a valid ${mockCountrySettings.countryName} state or province`
          );
      }),
      createPhoneSchema: vi.fn(() => {
        return z
          .string()
          .min(1, 'Phone number is required')
          .refine(
            async (val: string) => {
              const regex = new RegExp(mockCountrySettings.phonePattern);
              return regex.test(val);
            },
            `Phone number must be exactly ${mockCountrySettings.phoneLength} digits`
          );
      }),
      createCountryCodeSchema: vi.fn(() => {
        return z
          .string()
          .min(1, 'Country code is required')
          .refine(
            async (code: string) => {
              // Mock: accept IN or any uppercase code
              return /^[A-Z]{2}$/.test(code.toUpperCase());
            },
            'Please select a valid country'
          );
      }),
      createPhoneCountryCodeSchema: vi.fn(() => {
        return z
          .string()
          .min(1, 'Country code is required')
          .refine(
            async (code: string) => {
              // Mock: accept +91 or any +code format
              return /^\+[0-9]{1,4}$/.test(code.trim());
            },
            'Please select a valid country code'
          );
      }),
      createAddressSchema: vi.fn(() => {
        
        // Create inline schemas to avoid circular dependency
        const pincodeSchema = z
          .string()
          .min(1, 'Pincode is required')
          .refine(
            async (val: string) => {
              if (/^[0-9]{5}$/.test(val)) return true; // Test env allows 5 digits
              const regex = new RegExp(mockCountrySettings.pincodePattern);
              return regex.test(val);
            },
            `Pincode must be exactly ${mockCountrySettings.pincodeLength} digits`
          );
        
        const stateSchema = z
          .string()
          .min(1, 'State is required')
          .max(100, 'State name is too long')
          .refine(
            async (state: string) => {
              if (state.trim().toLowerCase() === 'test state') return true;
              return mockCountrySettings.states.some(
                (s) => s.toLowerCase() === state.trim().toLowerCase()
              );
            },
            `Please enter a valid ${mockCountrySettings.countryName} state or province`
          );
        
        const phoneSchema = z
          .string()
          .min(1, 'Phone number is required')
          .refine(
            async (val: string) => {
              const regex = new RegExp(mockCountrySettings.phonePattern);
              return regex.test(val);
            },
            `Phone number must be exactly ${mockCountrySettings.phoneLength} digits`
          );
        
        const countryCodeSchema = z
          .string()
          .min(1, 'Country code is required')
          .refine(
            async (code: string) => /^\+[0-9]{1,4}$/.test(code.trim()),
            'Please select a valid country code'
          );
        
        return z.object({
          firstName: z
            .string()
            .min(1, 'First name is required')
            .max(50, 'First name must not exceed 50 characters')
            .regex(/^[a-zA-Z\s\-'\.]+$/, 'First name can only contain letters, spaces, hyphens, apostrophes, and dots'),
          lastName: z
            .string()
            .min(1, 'Last name is required')
            .max(50, 'Last name must not exceed 50 characters')
            .regex(/^[a-zA-Z\s\-'\.]+$/, 'Last name can only contain letters, spaces, hyphens, apostrophes, and dots'),
          company: z
            .string()
            .max(100, 'Company name must not exceed 100 characters')
            .regex(/^[a-zA-Z0-9\s\-'\.&,()]+$/, 'Company name contains invalid characters')
            .optional(),
          addressLine1: z
            .string()
            .min(5, 'Address line 1 must be at least 5 characters')
            .max(200, 'Address line 1 must not exceed 200 characters')
            .regex(
              /^[a-zA-Z0-9\s\-'.,\/#()]+$/,
              'Address line 1 can only contain letters, numbers, spaces, and common address characters'
            )
            .trim(),
          addressLine2: z
            .string()
            .max(200, 'Address line 2 must not exceed 200 characters')
            .regex(
              /^[a-zA-Z0-9\s\-'.,\/#()]*$/,
              'Address line 2 can only contain letters, numbers, spaces, and common address characters'
            )
            .trim()
            .optional()
            .or(z.literal('')),
          city: z
            .string()
            .min(2, 'City name must be at least 2 characters')
            .max(100, 'City name is too long')
            .regex(
              /^[a-zA-Z0-9\s\-'\.]+$/,
              'City name can only contain letters, numbers, spaces, hyphens, apostrophes, and dots'
            ),
          state: stateSchema,
          zipCode: pincodeSchema,
          country: z
            .string()
            .min(1, 'Country is required')
            .max(100, 'Country name is too long'),
          phone: phoneSchema,
          countryCode: countryCodeSchema,
        });
      }),
    };
});
