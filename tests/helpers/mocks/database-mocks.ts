/**
 * Database Function Mocks
 * 
 * Mocks for all database access functions to prevent real DB calls in tests.
 * All mocks return test data that matches the expected structure.
 */

import { vi } from 'vitest';
import type { Category } from '@/types/data';

/**
 * Mock Categories Data
 */
export const mockCategories: Category[] = [
  {
    slug: 'rings',
    name: 'Rings',
    displayName: 'Rings',
    image: 'https://example.com/rings.jpg',
    alt: 'Rings category',
    description: 'Beautiful rings collection',
    active: true,
  },
  {
    slug: 'earrings',
    name: 'Earrings',
    displayName: 'Earrings',
    image: 'https://example.com/earrings.jpg',
    alt: 'Earrings category',
    description: 'Elegant earrings collection',
    active: true,
  },
  {
    slug: 'necklaces',
    name: 'Necklaces',
    displayName: 'Necklaces',
    image: 'https://example.com/necklaces.jpg',
    alt: 'Necklaces category',
    description: 'Stunning necklaces collection',
    active: true,
  },
  {
    slug: 'bracelets',
    name: 'Bracelets',
    displayName: 'Bracelets',
    image: 'https://example.com/bracelets.jpg',
    alt: 'Bracelets category',
    description: 'Charming bracelets collection',
    active: true,
  },
];

/**
 * Mock Country Settings Data
 */
export const mockCountrySettings = {
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
    'Test State', // For test environment
  ],
  currency: 'INR',
  currencySymbol: '₹',
  isActive: true,
  isDefault: true,
  order: 0,
};

/**
 * Mock Site Settings Data
 */
export const mockSiteSettings = {
  brand: {
    name: 'Jewels by NavKush',
    tagline: 'A CELESTIAL TOUCH FOR TIMELESS MOMENTS',
  },
  hero: {
    title: 'COLLECTION 2026',
    description: 'Test hero description',
    buttonText: 'DISCOVER',
  },
  about: {
    title: 'About Us',
    description: 'Test about description',
    buttonText: 'MORE ABOUT US',
  },
  ecommerce: {
    currency: 'INR',
    currencySymbol: '₹',
    defaultShippingDays: 5,
    freeShippingThreshold: 5000,
    defaultShippingCost: 100,
    returnWindowDays: 30,
    taxRate: 0.18,
    calculateTax: true,
    priceVarianceThreshold: 0.1,
    guestCartExpirationDays: 30,
    userCartExpirationDays: null,
    maxQuantityPerItem: 100,
    maxCartItems: 1000,
  },
  general: {
    businessHours: 'Monday - Friday: 9:00 AM - 6:00 PM',
    contactEmail: 'test@example.com',
    supportEmail: 'support@example.com',
  },
  intro: {
    rightColumnSlogan: 'Discover our most cherished pieces',
  },
};

/**
 * Setup all database function mocks
 * NOTE: vi.mock() must be called at top level, not inside function
 * These mocks are set up in tests/setup.ts
 */

// Mock getCategories - Must be at top level
vi.mock('@/lib/data/categories', () => ({
  getCategories: vi.fn(() => Promise.resolve(mockCategories)),
  getCategory: vi.fn((slug: string) => 
    Promise.resolve(mockCategories.find(c => c.slug === slug) || null)
  ),
  transformCategoriesForUI: vi.fn((categories: Category[]) => 
    categories.map(cat => ({
      ...cat,
      href: `/designs?category=${cat.slug}`,
    }))
  ),
}));

// Mock country settings - Must be at top level
vi.mock('@/lib/data/country-settings', () => ({
  getActiveCountries: vi.fn(() => Promise.resolve([mockCountrySettings])),
  getDefaultCountry: vi.fn(() => Promise.resolve(mockCountrySettings)),
  getCountryByCode: vi.fn((code: string) => 
    Promise.resolve(code.toUpperCase() === 'IN' ? mockCountrySettings : null)
  ),
  getCountryByPhoneCode: vi.fn((code: string) => 
    Promise.resolve(code === '+91' ? mockCountrySettings : null)
  ),
}));

// Mock country helpers - Must be at top level
vi.mock('@/lib/utils/country-helpers', () => ({
  getDefaultCountryWithFallback: vi.fn(() => Promise.resolve(mockCountrySettings)),
    getCountryByCodeWithFallback: vi.fn(() => 
      Promise.resolve(mockCountrySettings)
    ),
    getCountryByPhoneCodeWithFallback: vi.fn(() => 
      Promise.resolve(mockCountrySettings)
    ),
  getDefaultPhoneCountryCode: vi.fn(() => Promise.resolve('+91')),
  getDefaultCurrency: vi.fn(() => Promise.resolve('INR')),
  getDefaultCurrencySymbol: vi.fn(() => Promise.resolve('₹')),
}));

// Mock site settings - Must be at top level
vi.mock('@/lib/data/site-settings', () => ({
  getSiteSettings: vi.fn(() => Promise.resolve(mockSiteSettings)),
}));

// Mock site settings helpers - Must be at top level
vi.mock('@/lib/utils/site-settings-helpers', () => ({
  getBrandName: vi.fn(() => Promise.resolve('Jewels by NavKush')),
  getHeroTitle: vi.fn(() => Promise.resolve('COLLECTION 2026')),
  getHeroButtonText: vi.fn(() => Promise.resolve('DISCOVER')),
  getAboutButtonText: vi.fn(() => Promise.resolve('MORE ABOUT US')),
  getRightColumnSlogan: vi.fn(() => Promise.resolve('Discover our most cherished pieces')),
  getEcommerceSettings: vi.fn(() => Promise.resolve(mockSiteSettings.ecommerce)),
  getCurrency: vi.fn(() => Promise.resolve('INR')),
  getCurrencySymbol: vi.fn(() => Promise.resolve('₹')),
  getTaxRate: vi.fn(() => Promise.resolve(0.18)),
  getFreeShippingThreshold: vi.fn(() => Promise.resolve(5000)),
}));

// Mock category helpers - Must be at top level
vi.mock('@/lib/utils/category-helpers', () => ({
  getCategoryDisplayName: vi.fn((slug: string) => {
    const category = mockCategories.find(c => c.slug === slug);
    return Promise.resolve(category?.displayName || 'Unknown');
  }),
  getCategorySlugs: vi.fn(() => Promise.resolve(mockCategories.map(c => c.slug))),
  isValidCategorySlug: vi.fn((slug: string) => 
    Promise.resolve(mockCategories.some(c => c.slug === slug))
  ),
}));

/**
 * Reset all mocks
 * Call this in beforeEach or afterEach
 */
export function resetDatabaseMocks() {
  vi.clearAllMocks();
}

/**
 * Get mock implementation for a specific function
 * Useful for overriding default mock behavior in specific tests
 */
export function getMockImplementation(module: string, functionName: string) {
  const mocks: Record<string, Record<string, any>> = {
    'categories': {
      getCategories: () => Promise.resolve(mockCategories),
      getCategory: (slug: string) => 
        Promise.resolve(mockCategories.find(c => c.slug === slug) || null),
    },
    'country-settings': {
      getDefaultCountry: () => Promise.resolve(mockCountrySettings),
      getCountryByCode: (code: string) => 
        Promise.resolve(code.toUpperCase() === 'IN' ? mockCountrySettings : null),
      getCountryByPhoneCode: (code: string) => 
        Promise.resolve(code === '+91' ? mockCountrySettings : null),
    },
    'site-settings': {
      getSiteSettings: () => Promise.resolve(mockSiteSettings),
    },
  };

  return mocks[module]?.[functionName];
}
