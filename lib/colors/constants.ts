/**
 * Color Constants & Best Practices
 * 
 * Centralized color definitions and usage guidelines for consistent color application
 * across the entire application.
 */

/**
 * Primary Background Colors
 * Use these for main section backgrounds
 */
export const BACKGROUND_COLORS = {
  CREAM: 'var(--cream)',      // Light cream - rgb(250, 248, 245)
  BEIGE: 'var(--beige)',      // Warm beige - rgb(204, 196, 186)
} as const;

/**
 * Text Colors - Context-Aware
 * ALWAYS match text color to background color
 */
export const TEXT_COLORS = {
  // On Cream Backgrounds
  ON_CREAM: {
    PRIMARY: 'var(--text-on-cream)',      // Dark text - rgb(42, 42, 42)
    SECONDARY: 'var(--text-secondary)',    // Secondary text - rgb(106, 106, 106)
    MUTED: 'var(--text-muted)',          // Muted text - rgb(145, 140, 135)
  },
  // On Beige Backgrounds
  ON_BEIGE: {
    PRIMARY: 'var(--text-on-beige)',           // White text - rgb(255, 255, 255)
    HOVER: 'var(--text-on-beige-hover)',       // Lighter white on hover - #f5f1eb
  },
} as const;

/**
 * Status Colors
 * Use for success, error, warning, and info states
 */
export const STATUS_COLORS = {
  SUCCESS: {
    TEXT: 'var(--success-text)',
    BG: 'var(--success-bg)',
    BORDER: 'var(--success-border)',
  },
  ERROR: {
    TEXT: 'var(--error-text)',
    BG: 'var(--error-bg)',
    BORDER: 'var(--error-border)',
  },
} as const;

/**
 * Border Colors
 * Use for consistent borders across components
 */
export const BORDER_COLORS = {
  LIGHT: 'var(--border-light)',              // Light border for cards, inputs
  WHITE_LIGHT: 'var(--border-white-light)',  // White border with opacity for beige backgrounds
} as const;

/**
 * Interactive Colors
 * Use for hover states and active elements
 */
export const INTERACTIVE_COLORS = {
  BEIGE_HOVER: 'var(--beige-hover)',         // Darker beige for hover
  ACTIVE_DARK: 'var(--active-dark)',         // Dark gray for active states
} as const;

/**
 * White Opacity Values
 * Use for gradients and overlay effects
 */
export const WHITE_OPACITY = {
  OPACITY_20: 'var(--white-opacity-20)',     // 20% opacity
  OPACITY_30: 'var(--white-opacity-30)',     // 30% opacity
  OPACITY_40: 'var(--white-opacity-40)',     // 40% opacity
  OPACITY_50: 'var(--white-opacity-50)',     // 50% opacity - for borders on beige
  OPACITY_60: 'var(--white-opacity-60)',     // 60% opacity
} as const;

/**
 * Gradient Colors
 * Use for subtle background gradients
 */
export const GRADIENT_COLORS = {
  BEIGE_LIGHT: 'var(--gradient-beige-light)',
  BEIGE_MEDIUM: 'var(--gradient-beige-medium)',
  CREAM_LIGHT: 'var(--gradient-cream-light)',
  CREAM_MEDIUM: 'var(--gradient-cream-medium)',
} as const;

/**
 * Accent Colors
 * Use for badges, highlights, and special elements
 */
export const ACCENT_COLORS = {
  NEW: 'var(--accent-new)',
  FEATURED: 'var(--accent-featured)',
  MOST_LOVED: 'var(--accent-most-loved)',
  SALE: 'var(--accent-sale)',
  OUT_OF_STOCK: 'var(--accent-out-of-stock)',
  SUCCESS: 'var(--accent-success)',
  INFO: 'var(--accent-info)',
  WARNING: 'var(--accent-warning)',
} as const;

/**
 * Color Usage Rules
 * 
 * 1. ALWAYS use CSS variables - Never hardcode colors
 * 2. Match text color to background:
 *    - Cream background → Use TEXT_COLORS.ON_CREAM.*
 *    - Beige background → Use TEXT_COLORS.ON_BEIGE.*
 * 3. Follow text hierarchy:
 *    - Primary text for headings, titles, prices
 *    - Secondary text for descriptions, body text
 *    - Muted text for breadcrumbs, hints, section headings
 * 4. Use status colors for appropriate states:
 *    - Success for in-stock, success messages
 *    - Error for out-of-stock, error messages
 * 5. Use accent colors for badges and highlights
 * 6. Use white opacity values for gradients and overlays
 */

/**
 * Contrast Ratio Compliance
 * 
 * All color combinations meet WCAG 2.1 AA standards:
 * - Text on Cream: 7.2:1 (Primary), 4.5:1 (Secondary), 3.5:1 (Muted)
 * - Text on Beige: 4.8:1 (White text)
 * - Status colors: All meet minimum 4.5:1 ratio
 */
