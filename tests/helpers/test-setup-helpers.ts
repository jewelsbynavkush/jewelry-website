/**
 * Test Setup Helpers
 * 
 * Helper functions to set up test environment with required database data:
 * - Country settings
 * - Categories
 * - Site settings
 * 
 * NOTE: These functions work with LOCAL test database (MongoDB Memory Server),
 * NOT the real production database. All database access functions are mocked.
 * 
 * Use these in beforeEach hooks to ensure tests have required data in local test DB.
 */

import { createTestCountrySettings } from './country-test-helpers';
import { createTestCategoryInDb } from './test-utils';
import Category from '@/models/Category';
import CountrySettings from '@/models/CountrySettings';

/**
 * Set up default test country (India) in database
 * Call this in beforeEach to ensure country settings exist
 */
export async function setupTestCountry() {
  // Check if default country already exists
  const existing = await CountrySettings.findOne({ isDefault: true });
  if (existing) {
    return existing;
  }
  
  return await createTestCountrySettings();
}

/**
 * Set up default test categories in database
 * Creates standard categories: rings, earrings, necklaces, bracelets
 * Call this in beforeEach to ensure categories exist
 */
export async function setupTestCategories() {
  const categories = [
    { name: 'Rings', slug: 'rings', displayName: 'Rings' },
    { name: 'Earrings', slug: 'earrings', displayName: 'Earrings' },
    { name: 'Necklaces', slug: 'necklaces', displayName: 'Necklaces' },
    { name: 'Bracelets', slug: 'bracelets', displayName: 'Bracelets' },
  ];
  
  const createdCategories = [];
  
  for (const catData of categories) {
    // Check if category already exists
    let category = await Category.findOne({ slug: catData.slug });
    
    if (!category) {
      category = await createTestCategoryInDb({
        name: catData.name,
        slug: catData.slug,
        displayName: catData.displayName,
        active: true,
      });
    }
    
    createdCategories.push(category);
  }
  
  return createdCategories;
}

/**
 * Set up all required test data (country + categories)
 * Convenience function to set up everything at once
 */
export async function setupTestData() {
  const [country, categories] = await Promise.all([
    setupTestCountry(),
    setupTestCategories(),
  ]);
  
  return { country, categories };
}

/**
 * Get test category by slug
 * Useful for getting category ID for products
 */
export async function getTestCategory(slug: string) {
  return await Category.findOne({ slug, active: true });
}
