/**
 * Categories data access layer
 * Reads from MongoDB - Only returns active categories
 */

import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import type { Category as CategoryType } from '@/types/data';
import { logError } from '@/lib/security/error-handler';

/**
 * Get all active categories
 * Only returns categories where active: true
 * 
 * @returns Array of active categories, sorted by order
 */
export async function getCategories(): Promise<CategoryType[]> {
  try {
    await connectDB();
    
    const categories = await Category.find({ active: true })
      .sort({ order: 1 })
      .lean();
    
    // Transform to match existing Category type
    return categories.map(cat => ({
      slug: cat.slug,
      name: cat.name,
      displayName: cat.displayName,
      image: cat.image,
      alt: cat.alt,
      description: cat.description || '',
      active: cat.active, // Include active field for API response
    }));
  } catch (error) {
    logError('getCategories', error);
    return [];
  }
}

/**
 * Get category by slug (only if active)
 * 
 * @param slug - Category slug
 * @returns Category if found and active, null otherwise
 */
export async function getCategory(slug: string): Promise<CategoryType | null> {
  try {
    await connectDB();
    
    const category = await Category.findOne({ 
      slug: slug.toLowerCase(),
      active: true 
    }).lean();
    
    if (!category) {
      return null;
    }
    
    // Transform to match existing Category type
    return {
      slug: category.slug,
      name: category.name,
      displayName: category.displayName,
      image: category.image,
      alt: category.alt,
      description: category.description || '',
    };
  } catch (error) {
    logError('getCategory', error);
    return null;
  }
}


/**
 * Transform database categories to component format with href
 * Used for navigation links and UI components
 * 
 * @param categories - Array of categories from database
 * @returns Array of categories with href property
 */
export function transformCategoriesForUI(categories: CategoryType[]): Array<CategoryType & { href: string }> {
  return categories.map(cat => ({
    ...cat,
    href: `/designs?category=${cat.slug}`,
  }));
}
