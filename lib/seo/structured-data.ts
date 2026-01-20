import { Product } from '@/types/data';
import { formatCategoryName, getBrandName } from '@/lib/utils/text-formatting';
import { CURRENCY } from '@/lib/utils/price-formatting';
import { getBaseUrl } from '@/lib/utils/env';
import { sanitizeForJsonLd } from '@/lib/utils/json-ld-sanitize';
import { getSiteSettings } from '@/lib/data/site-settings';

const baseUrl = getBaseUrl();
const siteName = getBrandName();

/**
 * Generate Organization structured data (JSON-LD)
 * Pulls social media links and contact info from site settings
 */
export async function generateOrganizationSchema() {
  const settings = await getSiteSettings();
  
  // Collect social media links for Schema.org sameAs property
  // Only includes links that are actually configured to avoid empty arrays
  const sameAs: string[] = [];
  if (settings.social?.facebook) sameAs.push(settings.social.facebook);
  if (settings.social?.instagram) sameAs.push(settings.social.instagram);
  if (settings.social?.pinterest) sameAs.push(settings.social.pinterest);
  if (settings.social?.twitter) sameAs.push(settings.social.twitter);
  
  interface OrganizationSchema {
    '@context': string;
    '@type': string;
    name: string;
    url: string;
    logo: string;
    description: string;
    sameAs?: string[];
    contactPoint?: {
      '@type': string;
      telephone?: string;
      contactType: string;
      email?: string;
    };
  }
  
  const organizationSchema: OrganizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: sanitizeForJsonLd(settings.brand?.name || siteName),
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: sanitizeForJsonLd(settings.brand?.tagline || 'Exquisite handcrafted jewelry pieces that reflect your personal style.'),
  };
  
  // Include sameAs property only if social links exist (Schema.org best practice)
  if (sameAs.length > 0) {
    organizationSchema.sameAs = sameAs;
  }
  
  // Add contact point for Schema.org ContactPoint type if contact info exists
  // Improves SEO by providing structured contact information to search engines
  if (settings.contact?.email || settings.contact?.phone) {
    organizationSchema.contactPoint = {
      '@type': 'ContactPoint',
      ...(settings.contact.phone && { telephone: settings.contact.phone }),
      contactType: 'Customer Service',
      ...(settings.contact.email && { email: settings.contact.email }),
    };
  }
  
  return organizationSchema;
}

/**
 * Generate Product structured data (JSON-LD)
 */
export function generateProductSchema(product: Product) {
  const imageUrl = product.image 
    ? `${baseUrl}${product.image}`
    : `${baseUrl}/og-image.jpg`;

  const productUrl = `${baseUrl}/designs/${product.slug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: sanitizeForJsonLd(product.title),
    description: sanitizeForJsonLd(product.description || `${product.title} - Exquisite handcrafted jewelry piece${product.material ? ` made from ${product.material}` : ''}`),
    image: [imageUrl],
    url: productUrl,
    sku: product.id,
    mpn: product.id,
    brand: {
      '@type': 'Brand',
      name: sanitizeForJsonLd(siteName),
    },
    category: product.category ? sanitizeForJsonLd(formatCategoryName(product.category)) : 'Jewelry',
    ...(product.material && { material: sanitizeForJsonLd(product.material) }),
    ...(product.price && {
      offers: {
        '@type': 'Offer',
        price: product.price.toFixed(2),
        priceCurrency: product.currency || CURRENCY.code, // Use product currency if available
        availability: product.inStock !== false ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
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
      name: sanitizeForJsonLd(item.name),
      item: item.url, // URL is already validated by Next.js routing
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
    name: sanitizeForJsonLd(siteName),
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
      ? sanitizeForJsonLd(`${formatCategoryName(category)} Collection`)
      : 'Jewelry Collection',
    url: category ? `${baseUrl}/designs?category=${category}` : `${baseUrl}/designs`,
  };
}
