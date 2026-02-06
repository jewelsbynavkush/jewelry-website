import { CATEGORIES } from '@/lib/constants';

export type CategoryType = typeof CATEGORIES[number];

/**
 * Returns array of random category image paths for placeholder products
 * @param count - Number of images to return
 * @returns Array of image paths
 */
export function getRandomCategoryImages(count: number): string[] {
  const categoryImages = [
    '/assets/categories/rings.png',
    '/assets/categories/earrings.png',
    '/assets/categories/necklaces.png',
    '/assets/categories/bracelets.png',
  ];
  
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
      src: imageUrl,
      alt: `${category.name} jewelry collection`,
    };
  }
  
  const publicImageMap: Record<string, string> = {
    'rings': '/assets/categories/rings.png',
    'earrings': '/assets/categories/earrings.png',
    'necklaces': '/assets/categories/necklaces.png',
    'bracelets': '/assets/categories/bracelets.png',
  };
  
  const publicImagePath = publicImageMap[category.slug];
  if (publicImagePath) {
    return {
      src: publicImagePath,
      alt: `${category.name} jewelry collection - Exquisite handcrafted ${category.name.toLowerCase()} pieces`,
    };
  }
  
  return null;
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
