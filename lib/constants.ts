/**
 * Application-wide constants
 * 
 * NOTE: Categories are now fetched from the database.
 * Use getCategories() from @/lib/data/categories instead of hardcoded CATEGORIES.
 * This constant is kept for backward compatibility and type definitions only.
 */

export const CATEGORIES = [] as const;

export const CATEGORY_SLUGS = [] as const;

export const NAVIGATION_LINKS = [
  { name: 'ALL PRODUCTS', href: '/designs' },
  { name: 'ABOUT US', href: '/about' },
  { name: 'CONTACT', href: '/contact' },
] as const;

export const FOOTER_LEFT_LINKS = [
  { name: 'Our Story', href: '/about' },
  { name: 'Materials', href: '/materials' },
  { name: 'Sustainability', href: '/sustainability' },
  { name: 'Shipping & Returns', href: '/shipping' },
  { name: 'FAQs', href: '/faqs' },
  { name: 'Contact Us', href: '/contact' },
] as const;

export const FOOTER_RIGHT_LINKS = [
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Terms of Service', href: '/terms' },
] as const;

/**
 * Color constants - Two-color shade system
 * Standardized across the entire application
 */
export const COLORS = {
  // Primary Background Colors
  beige: '#CCC4BA',        // Warm beige - rgb(204, 196, 186)
  cream: '#faf8f5',        // Light cream - rgb(250, 248, 245)
  
  // Text Colors (based on background)
  textOnBeige: 'rgb(255, 255, 255)',    // White text on beige
  textOnCream: 'rgb(42, 42, 42)',       // Dark text on cream (standard)
  textSecondary: 'rgb(106, 106, 106)',  // Secondary text
  textMuted: 'rgb(145, 140, 135)',      // Muted text - warm gray with beige undertones
  
  // Hover & Interactive Colors
  beigeHover: '#b8afa3',                 // Darker beige for hover states
  textOnBeigeHover: '#f5f1eb',          // Lighter white for hover on beige
  activeDark: '#4a4a4a',                 // Dark gray for active states (buttons, filters)
  
  // UI Colors
  white: 'rgb(255, 255, 255)',
  borderLight: 'rgba(255, 255, 255, 0.2)',
  borderGray: '#e8e5e0',                // Light border color
} as const;

/**
 * Default values
 * 
 * NOTE: These are fallback values only. Actual values should come from site-settings DB.
 * Use getSiteSettings() from @/lib/data/site-settings to get current values.
 * These defaults are kept for backward compatibility and error handling.
 */
export const DEFAULTS = {
  brandName: 'Jewels by NavKush',
  heroTitle: 'COLLECTION 2025',
  heroButtonText: 'DISCOVER',
  aboutButtonText: 'MORE ABOUT US',
  rightColumnSlogan: 'Discover our most cherished pieces',
} as const;

/**
 * E-commerce constants
 * 
 * NOTE: These are fallback values only. Actual values should come from site-settings DB.
 * Use getSiteSettings() from @/lib/data/site-settings to get current ecommerce values.
 * These defaults are kept for backward compatibility and error handling.
 * 
 * To get ecommerce settings:
 * ```typescript
 * const settings = await getSiteSettings();
 * const ecommerce = settings.ecommerce || ECOMMERCE; // Use DB values with fallback
 * ```
 */
export const ECOMMERCE = {
  currency: 'INR',
  currencySymbol: '₹',
  defaultShippingDays: 5,
  freeShippingThreshold: 5000, // INR (approximately $60 USD)
  defaultShippingCost: 100, // INR - Standard shipping cost when threshold not met
  returnWindowDays: 30,
  // Tax configuration
  taxRate: 0.18, // 18% GST (India) - Set to 0 if tax-exempt
  calculateTax: true, // Enable/disable automatic tax calculation
  // Price validation
  priceVarianceThreshold: 0.1, // 10% - Maximum allowed price variance before requiring cart refresh
  // Cart configuration
  guestCartExpirationDays: 30, // Guest carts expire after 30 days
  userCartExpirationDays: null, // User carts never expire (null = no expiration)
  // Quantity limits
  maxQuantityPerItem: 100, // Maximum quantity per cart item
  maxCartItems: 1000, // Maximum items in a single cart
} as const;

