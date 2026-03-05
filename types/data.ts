/**
 * Data types for JSON-based architecture
 * Replaces Sanity CMS types
 */

export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  images: string[];
  alt: string;
  price?: number;
  currency?: string;
  category?: string;
  material?: string;
  inStock?: boolean;
  mostLoved?: boolean;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SiteSettings {
  brand: {
    name: string;
    tagline?: string;
  };
  hero: {
    title: string;
    description: string;
    buttonText: string;
    image: string;
    alt: string;
  };
  about: {
    title: string;
    content: string[];
    image: string;
    alt: string;
    buttonText: string;
    intro?: string;
    ourStory?: string;
    whyChooseUs?: { title: string; description: string }[];
  };
  mostLoved: {
    title: string;
    slogan?: string;
  };
  products: {
    title: string;
  };
  contact: {
    email?: string;
    phone?: string;
    address?: string;
  };
  social: {
    facebook?: string;
    instagram?: string;
    pinterest?: string;
    twitter?: string;
  };
  intro: {
    rightColumnSlogan?: string;
  };
  ecommerce?: {
    currency?: string;
    currencySymbol?: string;
    defaultShippingDays?: number;
    freeShippingThreshold?: number;
    defaultShippingCost?: number;
    returnWindowDays?: number;
    taxRate?: number;
    calculateTax?: boolean;
    priceVarianceThreshold?: number;
    guestCartExpirationDays?: number;
    userCartExpirationDays?: number | null;
    maxQuantityPerItem?: number;
    maxCartItems?: number;
  };
  general?: {
    businessHours?: string;
    contactEmail?: string;
    supportEmail?: string;
  };
  materials?: MaterialsPageContent;
  sustainability?: SustainabilityPageContent;
  shippingPage?: ShippingPageContent;
  faqs?: FaqsPageContent;
  privacy?: PrivacyPageContent;
  terms?: TermsPageContent;
}

export interface PageSubsection {
  heading: string;
  listItems: string[];
  visible?: boolean;
}

export interface PageSectionContent {
  heading?: string;
  paragraphs?: string[];
  listItems?: string[];
  paragraphsAfter?: string[];
  subsections?: PageSubsection[];
  visible?: boolean;
}

export interface MaterialsPageContent {
  title: string;
  sections: PageSectionContent[];
}

export interface SustainabilityPageContent {
  title: string;
  sections: PageSectionContent[];
}

export interface ShippingPageContent {
  title: string;
  sections: PageSectionContent[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqsPageContent {
  title: string;
  faqs: FaqItem[];
  ctaText?: string;
}

export interface PrivacyPageContent {
  title: string;
  lastUpdated?: string;
  sections: PageSectionContent[];
}

export interface TermsPageContent {
  title: string;
  lastUpdated?: string;
  sections: PageSectionContent[];
}

export interface Category {
  slug: string;
  name: string;
  displayName: string;
  image: string;
  alt: string;
  description: string;
  active?: boolean; // Optional for backward compatibility, but included in API responses
}

export interface PageContent {
  title: string;
  description: string;
  content: string[];
}

export interface ProductsData {
  products: Product[];
  meta: {
    total: number;
    lastUpdated: string;
  };
}

export interface CategoriesData {
  categories: Category[];
}

