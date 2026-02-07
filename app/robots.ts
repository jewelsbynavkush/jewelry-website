import { MetadataRoute } from 'next';
import { getBaseUrl } from '@/lib/utils/env';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/auth/',
          '/profile',
          '/checkout',
          '/cart',
          '/orders/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}


