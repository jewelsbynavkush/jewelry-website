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
  alt: string;
  price?: number;
  currency?: string; // Currency code (INR, USD, EUR) - defaults to INR
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

