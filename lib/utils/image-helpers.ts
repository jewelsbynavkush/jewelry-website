import { urlFor } from '@/lib/cms/client';
import { CATEGORIES } from '@/lib/constants';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';

/**
 * Category type from constants
 */
export type CategoryType = typeof CATEGORIES[number];

/**
 * Get random category images for placeholder products
 * Uses the same 4 category images randomly
 */
export function getRandomCategoryImages(count: number): string[] {
  const categoryImages = [
    '/category-rings.png',
    '/category-earrings.png',
    '/category-necklaces.png',
    '/category-bracelets.png',
  ];
  
  // Randomly select images, allowing repeats
  const selected: string[] = [];
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * categoryImages.length);
    selected.push(categoryImages[randomIndex]);
  }
  
  return selected;
}

/**
 * Category image source result
 */
export interface CategoryImageSource {
  src: string;
  isSanity: boolean;
}

/**
 * Get image source for category - prioritizes Sanity, falls back to public folder
 * Future: When Sanity images are added, they will automatically be used
 */
export function getCategoryImageSource(
  category: CategoryType, 
  sanityImage?: SanityImageSource
): CategoryImageSource | null {
  // Priority 1: Sanity image (when available in future)
  if (sanityImage) {
    return {
      src: urlFor(sanityImage).width(800).height(800).url(),
      isSanity: true,
    };
  }
  
  // Priority 2: Public folder image (current implementation)
  // Map category slugs to public folder image paths
  const publicImageMap: Record<string, string> = {
    'rings': '/category-rings.png',
    'earrings': '/category-earrings.png',
    'necklaces': '/category-necklaces.png',
    'bracelets': '/category-bracelets.png',
  };
  
  const publicImagePath = publicImageMap[category.slug];
  if (publicImagePath) {
    return {
      src: publicImagePath,
      isSanity: false,
    };
  }
  
  return null;
}

