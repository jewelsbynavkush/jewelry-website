/**
 * Application-wide constants
 */

export const CATEGORIES = [
  { name: 'RINGS', slug: 'rings', href: '/designs?category=rings' },
  { name: 'EARRINGS', slug: 'earrings', href: '/designs?category=earrings' },
  { name: 'NECKLACES', slug: 'necklaces', href: '/designs?category=necklaces' },
  { name: 'BRACELETS', slug: 'bracelets', href: '/designs?category=bracelets' },
] as const;

export const CATEGORY_SLUGS = CATEGORIES.map(cat => cat.slug);

export const NAVIGATION_LINKS = [
  { name: 'ALL PRODUCTS', href: '/designs' },
  ...CATEGORIES,
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
  
  // UI Colors
  white: 'rgb(255, 255, 255)',
  borderLight: 'rgba(255, 255, 255, 0.2)',
  borderGray: '#e8e5e0',                // Light border color
} as const;

/**
 * Default values
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
 */
export const ECOMMERCE = {
  currency: 'USD',
  currencySymbol: '$',
  defaultShippingDays: 5,
  freeShippingThreshold: 100, // USD
  returnWindowDays: 30,
} as const;

