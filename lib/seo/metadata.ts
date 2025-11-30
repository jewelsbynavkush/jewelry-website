import { Metadata } from 'next';
import { urlFor } from '@/lib/cms/client';
import { getBrandName } from '@/lib/utils/text-formatting';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com';
const siteName = getBrandName();

/**
 * Generate standard metadata with OpenGraph and Twitter cards
 */
export function generateStandardMetadata({
  title,
  description,
  image,
  url,
  type = 'website',
}: {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
}): Metadata {
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
  const imageUrl = image || `${baseUrl}/og-image.jpg`;
  const pageUrl = url || baseUrl;

  return {
    title: fullTitle,
    description,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: fullTitle,
      description,
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
      description,
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
}: {
  title: string;
  description: string;
  image?: SanityImageSource;
  url?: string;
}): Metadata {
  const imageUrl = image 
    ? urlFor(image).width(1200).height(1200).url()
    : `${baseUrl}/og-image.jpg`;

  return generateStandardMetadata({
    title,
    description,
    image: imageUrl,
    url,
    type: 'website', // OpenGraph doesn't support 'product', use 'website'
  });
}

