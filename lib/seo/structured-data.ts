import { JewelryDesign } from '@/types/cms';
import { urlFor } from '@/lib/cms/client';
import { formatCategoryName, getBrandName } from '@/lib/utils/text-formatting';
import { CURRENCY } from '@/lib/utils/price-formatting';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com';
const siteName = getBrandName();

/**
 * Generate Organization structured data (JSON-LD)
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: 'Exquisite handcrafted jewelry pieces that reflect your personal style.',
    sameAs: [
      // Add social media URLs here
      // 'https://www.facebook.com/yourpage',
      // 'https://www.instagram.com/yourpage',
      // 'https://www.pinterest.com/yourpage',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-555-123-4567',
      contactType: 'Customer Service',
      email: 'info@jewelrystore.com',
    },
  };
}

/**
 * Generate Product structured data (JSON-LD)
 */
export function generateProductSchema(design: JewelryDesign) {
  const imageUrl = design.image 
    ? urlFor(design.image).width(1200).height(1200).url()
    : `${baseUrl}/og-image.jpg`;

  const productUrl = `${baseUrl}/designs/${design.slug?.current || design._id}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: design.title,
    description: design.description,
    image: [imageUrl],
    url: productUrl,
    sku: design._id,
    mpn: design._id,
    brand: {
      '@type': 'Brand',
      name: siteName,
    },
    category: design.category,
    material: design.material,
    ...(design.price && {
      offers: {
        '@type': 'Offer',
        price: design.price.toFixed(2),
        priceCurrency: CURRENCY.code,
        availability: design.inStock !== false ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        url: productUrl,
        itemCondition: 'https://schema.org/NewCondition',
        priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Valid for 1 year
        seller: {
          '@type': 'Organization',
          name: siteName,
        },
      },
    }),
  };
}

/**
 * Generate BreadcrumbList structured data (JSON-LD)
 */
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate WebSite structured data with SearchAction (JSON-LD)
 */
export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/designs?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate CollectionPage structured data (JSON-LD)
 */
export function generateCollectionPageSchema(category?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category 
      ? `${formatCategoryName(category)} Collection`
      : 'Jewelry Collection',
    url: category ? `${baseUrl}/designs?category=${category}` : `${baseUrl}/designs`,
  };
}

