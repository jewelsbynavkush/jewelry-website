import { Metadata } from 'next';
import { getBrandName } from '@/lib/utils/text-formatting';
import { getBaseUrl } from '@/lib/utils/env';
import { getCDNUrl } from '@/lib/utils/cdn';

const baseUrl = getBaseUrl();
const siteName = getBrandName();

/**
 * Optimize meta description length (150-160 characters for best SEO)
 * Truncates to 155 characters and adds ellipsis if needed
 */
function optimizeDescription(description: string): string {
  const maxLength = 155; // Optimal length for search results
  if (description.length <= maxLength) {
    return description;
  }
  // Truncate at word boundary
  const truncated = description.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return lastSpace > 0 
    ? truncated.slice(0, lastSpace) + '...'
    : truncated + '...';
}

/**
 * Generate standard metadata with OpenGraph and Twitter cards
 */
export function generateStandardMetadata({
  title,
  description,
  image,
  url,
  type = 'website',
  keywords = [],
}: {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  keywords?: string[];
}): Metadata {
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
  const optimizedDescription = optimizeDescription(description);
  // Use provided image, or fallback to hero image (exists in public folder)
  // Convert to CDN URL if CDN is configured
  const imageUrl = image 
    ? (image.startsWith('http') ? image : getCDNUrl(image))
    : getCDNUrl('/assets/hero/hero-image.png');
  // Canonical: absolute URL, no trailing slash (match sitemap for consistency)
  const raw = url || baseUrl;
  const pageUrl = raw === '' ? baseUrl : raw.replace(/\/$/, '') || baseUrl;

  return {
    title: fullTitle,
    description: optimizedDescription,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: pageUrl,
    },
    icons: {
      icon: [
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/favicon.ico', sizes: 'any' },
      ],
      apple: [
        { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      ],
      other: [
        { rel: 'manifest', url: '/site.webmanifest' },
      ],
    },
    manifest: '/site.webmanifest',
    openGraph: {
      title: fullTitle,
      description: optimizedDescription,
      url: pageUrl,
      siteName,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type,
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: optimizedDescription,
      images: [imageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    keywords: (() => {
      const defaultKeywords = [
        'jewelry',
        'handcrafted jewelry',
        'luxury jewelry',
        'rings',
        'earrings',
        'necklaces',
        'bracelets',
        'precious metals',
        'gemstones',
        'custom jewelry',
        'fine jewelry',
        'jewelry store',
        'elegant jewelry',
        'timeless pieces',
        'ethical jewelry',
        'sustainable jewelry',
      ];
      // Combine default keywords with page-specific keywords, removing duplicates
      const combined = [...defaultKeywords, ...keywords];
      return Array.from(new Set(combined));
    })(),
  };
}

/**
 * Generate product metadata with structured data
 */
export function generateProductMetadata({
  title,
  description,
  image,
  url,
  keywords = [],
}: {
  title: string;
  description: string;
  image?: string;
  url?: string;
  keywords?: string[];
}): Metadata {
  // Use provided image, or fallback to hero image (exists in public folder)
  // Convert to CDN URL if CDN is configured
  const imageUrl = image 
    ? (image.startsWith('http') ? image : getCDNUrl(image))
    : getCDNUrl('/assets/hero/hero-image.png');

  return generateStandardMetadata({
    title,
    description,
    image: imageUrl,
    url,
    type: 'website', // OpenGraph doesn't support 'product', use 'website'
    keywords,
  });
}

