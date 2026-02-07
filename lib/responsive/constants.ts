/**
 * Responsive Design Constants & Utilities
 * 
 * Centralized responsive breakpoints and utilities for consistent
 * responsive design across the entire application.
 */

/**
 * Standard Breakpoints
 * Following Tailwind CSS default breakpoints
 */
export const BREAKPOINTS = {
  SM: 640,   // Small tablets
  MD: 768,   // Tablets
  LG: 1024,  // Desktops
  XL: 1280,  // Large desktops
  '2XL': 1536, // Extra large desktops
} as const;

/**
 * Responsive Typography Patterns
 * Use these patterns for consistent responsive text sizing
 */
export const RESPONSIVE_TEXT = {
  // Product titles and headings
  PRODUCT_TITLE: 'text-base sm:text-lg md:text-xl',
  // Body text
  BODY: 'text-body-sm sm:text-body-base',
  // Small text (badges, labels)
  SMALL: 'text-xs sm:text-sm',
  // Navigation text
  NAV: 'text-xs sm:text-sm',
  // Button text (consistent size)
  BUTTON: 'text-button',
  // Category links
  CATEGORY: 'text-category-link',
} as const;

/**
 * Responsive Spacing Patterns
 * Use these patterns for consistent responsive spacing
 */
export const RESPONSIVE_SPACING = {
  // Padding patterns
  PADDING_SMALL: 'px-4 sm:px-5 md:px-6',
  PADDING_MEDIUM: 'px-6 sm:px-7 md:px-8',
  PADDING_LARGE: 'px-8 sm:px-10 md:px-12',
  
  // Gap patterns
  GAP_SMALL: 'gap-3 sm:gap-4 md:gap-6',
  GAP_MEDIUM: 'gap-4 sm:gap-6 md:gap-8 lg:gap-12',
  GAP_LARGE: 'gap-6 sm:gap-8 md:gap-10 lg:gap-12',
  
  // Margin patterns
  MARGIN_SMALL: 'mb-4 sm:mb-6',
  MARGIN_MEDIUM: 'mb-6 sm:mb-8 md:mb-10',
  MARGIN_LARGE: 'mb-8 sm:mb-10 md:mb-12',
} as const;

/**
 * Responsive Layout Patterns
 * Use these patterns for consistent responsive layouts
 */
export const RESPONSIVE_LAYOUT = {
  // Flex direction patterns
  FLEX_COL_TO_ROW: 'flex-col sm:flex-row',
  FLEX_COL_TO_ROW_MD: 'flex-col md:flex-row',
  
  // Grid column patterns
  GRID_1_TO_2: 'grid-cols-1 sm:grid-cols-2',
  GRID_1_TO_3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
  GRID_2_TO_4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  
  // Display patterns
  HIDDEN_MOBILE: 'hidden md:block',
  HIDDEN_DESKTOP: 'block md:hidden',
  HIDDEN_TABLET: 'hidden sm:block md:hidden',
} as const;

/**
 * Responsive Image Heights
 * Use these patterns for consistent responsive image sizing
 */
export const RESPONSIVE_IMAGE_HEIGHTS = {
  // Product card images
  PRODUCT_COMPACT: 'h-40 sm:h-48 md:h-56 lg:h-64',
  PRODUCT_DEFAULT: 'h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80',
  // Category card images
  CATEGORY: 'h-48 sm:h-56 md:h-64 lg:h-72',
  // Hero images
  HERO: 'h-64 sm:h-80 md:h-96 lg:h-[500px]',
} as const;

/**
 * Responsive Container Patterns
 * Use these for consistent container sizing
 */
export const RESPONSIVE_CONTAINERS = {
  // Max widths
  CONTENT: 'max-w-7xl mx-auto',
  TEXT: 'max-w-4xl mx-auto',
  NARROW: 'max-w-2xl mx-auto',
  
  // Padding
  CONTAINER_PADDING: 'px-4 sm:px-6',
} as const;

/**
 * Touch Target Sizes
 * Minimum sizes for interactive elements (WCAG compliant)
 */
export const TOUCH_TARGETS = {
  MIN_SIZE: 44, // pixels
  MIN_HEIGHT: 'min-h-[44px]',
  MIN_WIDTH: 'min-w-[44px]',
  FULL: 'min-h-[44px] min-w-[44px]',
} as const;

/**
 * Responsive Best Practices
 * 
 * 1. Mobile-First: Always start with mobile styles, then enhance
 * 2. Progressive Enhancement: Use sm:, md:, lg:, xl: prefixes
 * 3. Consistent Breakpoints: Use standard breakpoints (640, 768, 1024, 1280)
 * 4. Touch Targets: Minimum 44px × 44px for all interactive elements
 * 5. Fluid Typography: Use clamp() for headings, responsive classes for body
 * 6. Flexible Layouts: Use flexbox/grid with responsive utilities
 * 7. Container Constraints: Use max-width utilities to prevent overflow
 * 8. Spacing Scale: Use standard spacing utilities consistently
 */
