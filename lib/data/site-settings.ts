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
  // Default values (defined outside try/catch for use in both blocks)
  const defaultBrand: { name: string; tagline?: string } = {
    name: 'Jewels by NavKush',
    tagline: 'A CELESTIAL TOUCH FOR TIMELESS MOMENTS',
  };
  
  const defaultIntro: { rightColumnSlogan?: string } = {
    rightColumnSlogan: 'Discover our most cherished pieces',
  };
  
  const defaultHero: { title: string; description: string; buttonText: string; image: string; alt: string } = {
    title: 'COLLECTION 2026',
    description: 'Discover our collection of unique, beautifully designed jewelry pieces.',
    buttonText: 'DISCOVER',
    image: '/assets/hero/hero-image.png',
    alt: 'Jewelry collection',
  };

  try {
    await connectDB();
    
    // Fetch all site settings types
    const [general, hero, about, contact, social, seo, ecommerce] = await Promise.all([
      SiteSettings.findOne({ type: 'general' }).lean(),
      SiteSettings.findOne({ type: 'hero' }).lean(),
      SiteSettings.findOne({ type: 'about' }).lean(),
      SiteSettings.findOne({ type: 'contact' }).lean(),
      SiteSettings.findOne({ type: 'social' }).lean(),
      SiteSettings.findOne({ type: 'seo' }).lean(),
      SiteSettings.findOne({ type: 'ecommerce' }).lean(),
    ]);
    
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
            image: '/assets/about/about-image.png',
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
      intro: (general?.data?.intro && 
              typeof general.data.intro === 'object' && 
              general.data.intro !== null)
        ? (general.data.intro as { rightColumnSlogan?: string })
        : (seo?.data?.intro && 
           typeof seo.data.intro === 'object' && 
           seo.data.intro !== null)
          ? (seo.data.intro as { rightColumnSlogan?: string })
          : defaultIntro,
      ecommerce: (ecommerce?.data?.ecommerce && 
                  typeof ecommerce.data.ecommerce === 'object' && 
                  ecommerce.data.ecommerce !== null)
        ? (ecommerce.data.ecommerce as SiteSettingsType['ecommerce'])
        : undefined,
    };
  } catch (error) {
    logError('getSiteSettings', error);
    // Return safe defaults to prevent app crash if database connection fails
    // Ensures site remains functional even if settings can't be loaded
    return {
      brand: defaultBrand,
      hero: defaultHero,
      about: {
        title: 'ABOUT US',
        content: [],
        image: '/assets/about/about-image.png',
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
      intro: defaultIntro,
      ecommerce: undefined,
    };
  }
}

