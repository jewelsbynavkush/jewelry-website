import { MetadataRoute } from 'next';
import { getProducts } from '@/lib/data/products';
import { getCategories, transformCategoriesForUI } from '@/lib/data/categories';
import { logError } from '@/lib/security/error-handler';
import { getBaseUrl } from '@/lib/utils/env';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/designs`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/materials`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/sustainability`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/shipping`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/faqs`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    // Note: Cart, profile, checkout, and auth pages are excluded from sitemap
    // as they are private/user-specific pages
  ];

  // Category pages
  let categoryPages: MetadataRoute.Sitemap = [];
  try {
    const categories = await getCategories();
    const categoriesForUI = transformCategoriesForUI(categories);
    categoryPages = categoriesForUI.map((category) => ({
      url: `${baseUrl}${category.href}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));
  } catch (error) {
    logError('sitemap categories', error);
  }

  // Dynamic product pages
  try {
    const productsData = await getProducts();
    const productPages: MetadataRoute.Sitemap = productsData.products.map((product) => ({
      url: `${baseUrl}/designs/${product.slug}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : now,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    return [...staticPages, ...categoryPages, ...productPages];
  } catch (error) {
    logError('sitemap generation', error);
    return [...staticPages, ...categoryPages];
  }
}

