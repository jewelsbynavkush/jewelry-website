import { SanityImageSource } from '@sanity/image-url/lib/types/types';

export interface JewelryDesign {
  _id: string;
  title: string;
  description: string;
  image: {
    asset: {
      _ref: string;
      _type: string;
    };
    alt?: string;
  };
  material?: string;
  price?: number;
  category?: string;
  featured?: boolean;
  mostLoved?: boolean;
  inStock?: boolean;
  slug: {
    current: string;
  };
  _updatedAt?: string;
}

export interface SiteSettings {
  title?: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  brandName?: string;
  tagline?: string;
  heroTitle?: string;
  heroDescription?: string;
  heroButtonText?: string;
  heroImage?: {
    asset: {
      _ref: string;
      _type: string;
    };
    alt?: string;
  };
  rightColumnSlogan?: string;
  aboutTitle?: string;
  aboutContent?: string | Array<{
    children?: Array<{
      text?: string;
    }>;
  }>;
  aboutImage?: SanityImageSource;
  aboutButtonText?: string;
  productsTitle?: string;
  mostLovedTitle?: string;
  mostLovedSlogan?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    pinterest?: string;
  };
}

