/**
 * Category Helper Functions
 * 
 * Provides convenient access to category data with fallbacks.
 */

import { getCategories } from '@/lib/data/categories';
import { formatCategoryName } from './text-formatting';

/**
 * Get category display name by slug
 * Uses DB category.displayName with fallback to formatting function
 */
export async function getCategoryDisplayName(slug: string): Promise<string> {
  const categories = await getCategories();
  const category = categories.find(cat => cat.slug === slug.toLowerCase());
  
  if (category?.displayName) {
    return category.displayName;
  }
  
  return formatCategoryName(slug);
}

/**
 * Get all category slugs from DB
 * Falls back to empty array if DB unavailable
 */
export async function getCategorySlugs(): Promise<string[]> {
  const categories = await getCategories();
  return categories.map(cat => cat.slug);
}

/**
 * Validate if category slug exists in DB
 */
export async function isValidCategorySlug(slug: string): Promise<boolean> {
  const categories = await getCategories();
  return categories.some(cat => cat.slug === slug.toLowerCase());
}
