import { client } from './client';
import { JewelryDesign } from '@/types/cms';
import { logError } from '@/lib/security/error-handler';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';

/**
 * Fetch site settings from Sanity
 */
export async function getSiteSettings<T = Record<string, unknown>>(): Promise<T> {
  try {
    const query = `*[_type == "siteSettings"][0]`;
    return await client.fetch(query) || {} as T;
  } catch (error) {
    logError('getSiteSettings', error);
    return {} as T;
  }
}

/**
 * Fetch all jewelry designs
 */
export async function getDesigns(category?: string): Promise<JewelryDesign[]> {
  try {
    const filter = category 
      ? `*[_type == "jewelryDesign" && category == "${category}"]`
      : `*[_type == "jewelryDesign"]`;
    const query = `${filter} | order(_createdAt desc)`;
    return await client.fetch(query) || [];
  } catch (error) {
    logError('getDesigns', error);
    return [];
  }
}

/**
 * Fetch a single design by slug
 */
export async function getDesign(slug: string): Promise<JewelryDesign | null> {
  try {
    const query = `*[_type == "jewelryDesign" && slug.current == $slug][0]`;
    return await client.fetch(query, { slug }) || null;
  } catch (error) {
    logError('getDesign', error);
    return null;
  }
}

/**
 * Fetch most loved designs
 */
export async function getMostLovedDesigns(limit: number = 8): Promise<JewelryDesign[]> {
  try {
    const query = `*[_type == "jewelryDesign" && mostLoved == true] | order(_createdAt desc) [0...${limit}]`;
    return await client.fetch(query) || [];
  } catch (error) {
    logError('getMostLovedDesigns', error);
    return [];
  }
}

/**
 * Fetch related designs by category
 */
export async function getRelatedDesigns(
  category: string, 
  excludeId: string, 
  limit: number = 4
): Promise<JewelryDesign[]> {
  try {
    const query = `*[_type == "jewelryDesign" && category == $category && _id != $excludeId] | order(_createdAt desc) [0...${limit}]`;
    return await client.fetch(query, { category, excludeId }) || [];
  } catch (error) {
    logError('getRelatedDesigns', error);
    return [];
  }
}

/**
 * Fetch category images - returns first image for each category
 */
export async function getCategoryImages(): Promise<Record<string, SanityImageSource>> {
  try {
    const query = `*[_type == "jewelryDesign"] | order(_createdAt desc)`;
    const designs = await client.fetch(query) || [];
    
    const categoryImages: Record<string, SanityImageSource> = {};
    const categories = ['rings', 'earrings', 'necklaces', 'bracelets'];
    
    categories.forEach((category) => {
      const design = designs.find((d: JewelryDesign) => d.category === category);
      if (design && design.image) {
        categoryImages[category] = design.image;
      }
    });
    
    return categoryImages;
  } catch (error) {
    logError('getCategoryImages', error);
    return {};
  }
}

