import type { Category } from '@/types/data';
import { getCDNUrl } from './cdn';

export type CategoryType = Category;

/**
 * Returns array of random category image paths for placeholder products
 * Uses provided categories from DB, falls back to generic pattern if no categories provided
 * 
 * @param count - Number of images to return
 * @param categories - Optional array of categories from DB to use for image paths
 * @returns Array of image paths
 */
export function getRandomCategoryImages(count: number, categories?: CategoryType[]): string[] {
  if (!categories || categories.length === 0) {
    // If no categories provided, return empty array or generic placeholder
    // This ensures we don't use hardcoded category lists
    return [];
  }
  
  const categoryImages = categories.map(cat => 
    getCDNUrl(cat.image || `/assets/categories/${cat.slug}.png`)
  );
  
  if (categoryImages.length === 0) {
    return [];
  }
  
  const selected: string[] = [];
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * categoryImages.length);
    selected.push(categoryImages[randomIndex]);
  }
  
  return selected;
}

export interface CategoryImageSource {
  src: string;
  alt?: string;
}

/**
 * Gets image source for category, using provided URL or falling back to public folder
 * @param category - Category type
 * @param imageUrl - Optional image URL
 * @returns Category image source or null
 */
export function getCategoryImageSource(
  category: CategoryType, 
  imageUrl?: string
): CategoryImageSource | null {
  if (imageUrl) {
    return {
      src: getCDNUrl(imageUrl),
      alt: category.alt || `${category.name} jewelry collection`,
    };
  }
  
  if (category.image) {
    return {
      src: getCDNUrl(category.image),
      alt: category.alt || `${category.name} jewelry collection - Exquisite handcrafted ${category.name.toLowerCase()} pieces`,
    };
  }
  
  const publicImagePath = `/assets/categories/${category.slug}.png`;
  return {
    src: getCDNUrl(publicImagePath),
    alt: category.alt || `${category.name} jewelry collection - Exquisite handcrafted ${category.name.toLowerCase()} pieces`,
  };
}

/**
 * Returns alt text or fallback if not provided
 * @param altText - Optional alt text
 * @param fallback - Fallback alt text
 * @returns Alt text string
 */
export function getImageAltText(
  altText: string | undefined,
  fallback: string
): string {
  return altText || fallback;
}
