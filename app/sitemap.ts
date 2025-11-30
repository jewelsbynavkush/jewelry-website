import { MetadataRoute } from 'next';
import { getDesigns } from '@/lib/cms/queries';
import { CATEGORIES } from '@/lib/constants';
import { logError } from '@/lib/security/error-handler';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com';
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
  ];

  // Category pages
  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((category) => ({
    url: `${baseUrl}${category.href}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  // Dynamic product pages
  try {
    const designs = await getDesigns();
      const productPages: MetadataRoute.Sitemap = designs.map((design) => ({
        url: `${baseUrl}/designs/${design.slug?.current || design._id}`,
        lastModified: design._updatedAt ? new Date(design._updatedAt) : now,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }));

    return [...staticPages, ...categoryPages, ...productPages];
  } catch (error) {
    logError('sitemap generation', error);
    return [...staticPages, ...categoryPages];
  }
}

