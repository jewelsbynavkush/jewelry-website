/**
 * Site settings data access layer
 * Reads from MongoDB
 */

import connectDB from '@/lib/mongodb';
import { SiteSettings } from '@/models';
import type {
  SiteSettings as SiteSettingsType,
  MaterialsPageContent,
  SustainabilityPageContent,
  ShippingPageContent,
  FaqsPageContent,
  PrivacyPageContent,
  TermsPageContent,
} from '@/types/data';
import { logError } from '@/lib/security/error-handler';

function isMaterialsContent(v: unknown): v is MaterialsPageContent {
  return typeof v === 'object' && v !== null && 'title' in v && 'sections' in v && Array.isArray((v as MaterialsPageContent).sections);
}
function isSustainabilityContent(v: unknown): v is SustainabilityPageContent {
  return typeof v === 'object' && v !== null && 'title' in v && 'sections' in v && Array.isArray((v as SustainabilityPageContent).sections);
}
function isShippingPageContent(v: unknown): v is ShippingPageContent {
  return typeof v === 'object' && v !== null && 'title' in v && 'sections' in v && Array.isArray((v as ShippingPageContent).sections);
}
function isFaqsContent(v: unknown): v is FaqsPageContent {
  return typeof v === 'object' && v !== null && 'title' in v && 'faqs' in v && Array.isArray((v as FaqsPageContent).faqs);
}
function isPrivacyContent(v: unknown): v is PrivacyPageContent {
  return typeof v === 'object' && v !== null && 'title' in v && 'sections' in v && Array.isArray((v as PrivacyPageContent).sections);
}
function isTermsContent(v: unknown): v is TermsPageContent {
  return typeof v === 'object' && v !== null && 'title' in v && 'sections' in v && Array.isArray((v as TermsPageContent).sections);
}

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
    
    const [general, hero, about, contact, social, seo, ecommerce, materialsDoc, sustainabilityDoc, shippingDoc, faqsDoc, privacyDoc, termsDoc] = await Promise.all([
      SiteSettings.findOne({ type: 'general' }).lean(),
      SiteSettings.findOne({ type: 'hero' }).lean(),
      SiteSettings.findOne({ type: 'about' }).lean(),
      SiteSettings.findOne({ type: 'contact' }).lean(),
      SiteSettings.findOne({ type: 'social' }).lean(),
      SiteSettings.findOne({ type: 'seo' }).lean(),
      SiteSettings.findOne({ type: 'ecommerce' }).lean(),
      SiteSettings.findOne({ type: 'materials' }).lean(),
      SiteSettings.findOne({ type: 'sustainability' }).lean(),
      SiteSettings.findOne({ type: 'shipping' }).lean(),
      SiteSettings.findOne({ type: 'faqs' }).lean(),
      SiteSettings.findOne({ type: 'privacy' }).lean(),
      SiteSettings.findOne({ type: 'terms' }).lean(),
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
        ? (about.data.about as SiteSettingsType['about'])
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
      general: (general?.data?.general &&
                typeof general.data.general === 'object' &&
                general.data.general !== null)
        ? (general.data.general as { businessHours?: string; contactEmail?: string; supportEmail?: string })
        : {},
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
      materials: materialsDoc?.data?.materials != null && isMaterialsContent(materialsDoc.data.materials)
        ? (materialsDoc.data.materials as MaterialsPageContent)
        : undefined,
      sustainability: sustainabilityDoc?.data?.sustainability != null && isSustainabilityContent(sustainabilityDoc.data.sustainability)
        ? (sustainabilityDoc.data.sustainability as SustainabilityPageContent)
        : undefined,
      shippingPage: shippingDoc?.data?.shippingPage != null && isShippingPageContent(shippingDoc.data.shippingPage)
        ? (shippingDoc.data.shippingPage as ShippingPageContent)
        : undefined,
      faqs: faqsDoc?.data?.faqs != null && isFaqsContent(faqsDoc.data.faqs)
        ? (faqsDoc.data.faqs as FaqsPageContent)
        : undefined,
      privacy: privacyDoc?.data?.privacy != null && isPrivacyContent(privacyDoc.data.privacy)
        ? (privacyDoc.data.privacy as PrivacyPageContent)
        : undefined,
      terms: termsDoc?.data?.terms != null && isTermsContent(termsDoc.data.terms)
        ? (termsDoc.data.terms as TermsPageContent)
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
      general: {},
      intro: defaultIntro,
      ecommerce: undefined,
      materials: undefined,
      sustainability: undefined,
      shippingPage: undefined,
      faqs: undefined,
      privacy: undefined,
      terms: undefined,
    };
  }
}

