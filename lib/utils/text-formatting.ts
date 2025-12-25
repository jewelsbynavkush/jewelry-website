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
 * @param category - Category slug or name
 * @returns Formatted category name (e.g., "Rings", "Earrings")
 */
export function formatCategoryName(category: string): string {
  if (!category) return category;
  
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
 * Format brand name consistently
 * @returns Standardized brand name
 */
export function getBrandName(): string {
  return 'Jewels by NavKush';
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


