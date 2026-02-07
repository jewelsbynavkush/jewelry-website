/**
 * Text formatting utilities for consistent casing across the application
 */

/**
 * Capitalize first letter of a string
 * @param str - String to capitalize
 * @returns String with first letter capitalized
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Capitalize first letter of each word (Title Case)
 * @param str - String to title case
 * @returns String with first letter of each word capitalized
 */
export function titleCase(str: string): string {
  if (!str) return str;
  return str
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
}

/**
 * Format category name consistently
 * 
 * NOTE: This function should be used in server components only.
 * For client components, pass category displayName as prop.
 * 
 * @param category - Category slug or name
 * @param displayName - Optional displayName from DB category
 * @returns Formatted category name (e.g., "Rings", "Earrings")
 */
export function formatCategoryName(category: string, displayName?: string): string {
  if (!category) return category;
  
  // Use DB displayName if provided
  if (displayName) {
    return displayName;
  }
  
  // Fallback to hardcoded map (for backward compatibility)
  const categoryMap: Record<string, string> = {
    'rings': 'Rings',
    'earrings': 'Earrings',
    'necklaces': 'Necklaces',
    'bracelets': 'Bracelets',
  };
  
  const lowerCategory = category.toLowerCase();
  return categoryMap[lowerCategory] || capitalize(category);
}

/**
 * Format category name from DB category object
 * 
 * @param category - Category object with slug and displayName
 * @returns Formatted category name
 */
export function formatCategoryNameFromDB(category: { slug: string; displayName: string }): string {
  return category.displayName || formatCategoryName(category.slug);
}

/**
 * Format brand name consistently
 * 
 * NOTE: This function should be used in server components only.
 * For client components, pass brand name as prop or use getSiteSettings().
 * 
 * @param brandName - Optional brand name from DB, falls back to constant
 * @returns Standardized brand name
 */
export function getBrandName(brandName?: string): string {
  return brandName || 'Jewels by NavKush';
}

/**
 * Format product title consistently
 * Preserves original casing from CMS but ensures proper formatting
 * @param title - Product title from CMS
 * @returns Formatted title
 */
export function formatProductTitle(title: string): string {
  if (!title) return title;
  return title.trim();
}


