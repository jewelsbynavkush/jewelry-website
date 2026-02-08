/**
 * SEO Constants & Configuration
 * 
 * Centralized SEO configuration values for consistent
 * SEO implementation across the entire application.
 */

/**
 * Default SEO Configuration
 */
export const SEO_CONFIG = {
  // Default meta description length (optimal for search results)
  META_DESCRIPTION_MAX_LENGTH: 155,
  
  // Open Graph image dimensions (recommended: 1200x630)
  OG_IMAGE_WIDTH: 1200,
  OG_IMAGE_HEIGHT: 630,
  
  // Twitter card type
  TWITTER_CARD_TYPE: 'summary_large_image' as const,
  
  // Default locale
  DEFAULT_LOCALE: 'en_US',
  
  // Default language
  DEFAULT_LANGUAGE: 'en',
  
  // Default Open Graph type
  DEFAULT_OG_TYPE: 'website' as const,
} as const;

/**
 * SEO Best Practices Guidelines
 * 
 * 1. Title Tags:
 *    - Length: 50-60 characters (optimal)
 *    - Include brand name
 *    - Unique for each page
 *    - Include primary keyword
 * 
 * 2. Meta Descriptions:
 *    - Length: 150-160 characters (optimal)
 *    - Compelling and descriptive
 *    - Include call-to-action
 *    - Unique for each page
 * 
 * 3. Heading Hierarchy:
 *    - One H1 per page
 *    - Logical H2-H6 structure
 *    - Include keywords naturally
 * 
 * 4. Image Alt Text:
 *    - Descriptive and specific
 *    - Include relevant keywords
 *    - Not too long (125 characters max)
 *    - Contextual to surrounding content
 * 
 * 5. Internal Linking:
 *    - Use descriptive anchor text
 *    - Link to relevant pages
 *    - Maintain logical site structure
 * 
 * 6. URL Structure:
 *    - Clean and descriptive
 *    - Include keywords
 *    - Use hyphens, not underscores
 *    - Keep URLs short
 *    - Canonical: absolute URL, no trailing slash (consistent with sitemap)
 * 
 * 7. Structured Data:
 *    - Use appropriate schema types
 *    - Validate with Google's Rich Results Test
 *    - Keep data accurate and up-to-date
 * 
 * 8. Performance:
 *    - Fast page load times
 *    - Optimize images
 *    - Minimize JavaScript
 *    - Use server-side rendering
 */

/**
 * Schema.org Types Used
 */
export const SCHEMA_TYPES = {
  ORGANIZATION: 'Organization',
  WEBSITE: 'WebSite',
  PRODUCT: 'Product',
  BREADCRUMB_LIST: 'BreadcrumbList',
  COLLECTION_PAGE: 'CollectionPage',
  FAQ_PAGE: 'FAQPage',
} as const;

/**
 * SEO Priority Levels for Sitemap
 */
export const SITEMAP_PRIORITY = {
  HOME: 1.0,
  MAIN_PAGES: 0.9,
  CATEGORY_PAGES: 0.8,
  CONTENT_PAGES: 0.7,
  PRODUCT_PAGES: 0.6,
  LEGAL_PAGES: 0.5,
} as const;

/**
 * Change Frequency for Sitemap
 */
export const CHANGE_FREQUENCY = {
  ALWAYS: 'always' as const,
  HOURLY: 'hourly' as const,
  DAILY: 'daily' as const,
  WEEKLY: 'weekly' as const,
  MONTHLY: 'monthly' as const,
  YEARLY: 'yearly' as const,
  NEVER: 'never' as const,
} as const;
