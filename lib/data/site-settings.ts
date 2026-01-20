/**
 * Site settings data access layer
 * Reads from MongoDB
 */

import connectDB from '@/lib/mongodb';
import SiteSettings from '@/models/SiteSettings';
import type { SiteSettings as SiteSettingsType } from '@/types/data';
import { logError } from '@/lib/security/error-handler';

/**
 * Get site settings from MongoDB
 * 
 * Combines all site settings types into a single object.
 * Returns safe defaults if settings are missing to prevent app crashes.
 * 
 * @returns Site settings object with brand, hero, about, and other configuration
 */
export async function getSiteSettings(): Promise<SiteSettingsType> {
  try {
    await connectDB();
    
    // Fetch all site settings types
    const [general, hero, about, contact, social, seo] = await Promise.all([
      SiteSettings.findOne({ type: 'general' }).lean(),
      SiteSettings.findOne({ type: 'hero' }).lean(),
      SiteSettings.findOne({ type: 'about' }).lean(),
      SiteSettings.findOne({ type: 'contact' }).lean(),
      SiteSettings.findOne({ type: 'social' }).lean(),
      SiteSettings.findOne({ type: 'seo' }).lean(),
    ]);
    
    // Combine settings with safe defaults
    const defaultBrand: { name: string; tagline?: string } = {
      name: 'Jewels by NavKush',
      tagline: 'A CELESTIAL TOUCH FOR TIMELESS MOMENTS',
    };
    
    const defaultHero: { title: string; description: string; buttonText: string; image: string; alt: string } = {
      title: 'COLLECTION 2025',
      description: 'Discover our collection of unique, beautifully designed jewelry pieces.',
      buttonText: 'DISCOVER',
      image: '/assets/hero/hero-image.jpg',
      alt: 'Jewelry collection',
    };
    
    return {
      brand: (general?.data?.brand && 
              typeof general.data.brand === 'object' && 
              general.data.brand !== null &&
              'name' in general.data.brand &&
              typeof (general.data.brand as { name: unknown }).name === 'string') 
        ? (general.data.brand as { name: string; tagline?: string }) 
        : defaultBrand,
      hero: (hero?.data?.hero && 
             typeof hero.data.hero === 'object' && 
             hero.data.hero !== null &&
             'title' in hero.data.hero &&
             typeof (hero.data.hero as { title: unknown }).title === 'string')
        ? (hero.data.hero as { title: string; description: string; buttonText: string; image: string; alt: string })
        : defaultHero,
      about: (about?.data?.about && 
              typeof about.data.about === 'object' && 
              about.data.about !== null &&
              'title' in about.data.about)
        ? (about.data.about as { title: string; content: string[]; image: string; alt: string; buttonText: string })
        : {
            title: 'ABOUT US',
            content: [],
            image: '/assets/about/about-image.jpg',
            alt: 'About us',
            buttonText: 'MORE ABOUT US',
          },
      mostLoved: (seo?.data?.mostLoved && 
                  typeof seo.data.mostLoved === 'object' && 
                  seo.data.mostLoved !== null &&
                  'title' in seo.data.mostLoved)
        ? (seo.data.mostLoved as { title: string; slogan?: string })
        : {
            title: 'OUR MOST LOVED CREATIONS',
            slogan: 'Discover our most cherished pieces',
          },
      products: (seo?.data?.products && 
                 typeof seo.data.products === 'object' && 
                 seo.data.products !== null &&
                 'title' in seo.data.products)
        ? (seo.data.products as { title: string })
        : {
            title: 'OUR PRODUCTS',
          },
      contact: contact?.data?.contact || {},
      social: social?.data?.social || {},
      intro: seo?.data?.intro || {},
    };
  } catch (error) {
    logError('getSiteSettings', error);
    // Return safe defaults to prevent app crash if database connection fails
    // Ensures site remains functional even if settings can't be loaded
    return {
      brand: {
        name: 'Jewels by NavKush',
        tagline: 'A CELESTIAL TOUCH FOR TIMELESS MOMENTS',
      },
      hero: {
        title: 'COLLECTION 2025',
        description: 'Discover our collection of unique, beautifully designed jewelry pieces.',
        buttonText: 'DISCOVER',
        image: '/assets/hero/hero-image.jpg',
        alt: 'Jewelry collection',
      },
      about: {
        title: 'ABOUT US',
        content: [],
        image: '/assets/about/about-image.jpg',
        alt: 'About us',
        buttonText: 'MORE ABOUT US',
      },
      mostLoved: {
        title: 'OUR MOST LOVED CREATIONS',
        slogan: 'Discover our most cherished pieces',
      },
      products: {
        title: 'OUR PRODUCTS',
      },
      contact: {},
      social: {},
      intro: {},
    };
  }
}

