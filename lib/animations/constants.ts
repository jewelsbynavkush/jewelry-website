/**
 * Centralized Animation Constants
 * 
 * This file contains all animation configuration values used across the project.
 * Use these constants to ensure consistent animations throughout the website.
 */

// Spring Physics Configuration
export const SPRING_CONFIG = {
  // Standard spring for most hover/click interactions
  STANDARD: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 17,
  },
  // Smooth spring for 3D tilt effects
  SMOOTH: {
    type: 'spring' as const,
    stiffness: 500,
    damping: 100,
  },
  // Quick spring for fast interactions
  QUICK: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 20,
  },
};

// Scale Values
export const SCALE = {
  // Hover scale for buttons, icons, and interactive elements
  HOVER: 1.05,
  // Hover scale for cards and larger elements
  CARD_HOVER: 1.03,
  // Hover scale for icons (slightly larger for visibility)
  ICON_HOVER: 1.1,
  // Click/tap scale feedback
  TAP: 0.98,
  // Image zoom on hover
  IMAGE_ZOOM: 1.05,
  // Category image zoom
  CATEGORY_IMAGE_ZOOM: 1.1,
};

// 3D Tilt Configuration
export const TILT_3D = {
  // Maximum rotation angle in degrees
  MAX_ROTATE: 7.5,
  // Perspective distance for 3D effect
  PERSPECTIVE: 1000,
  // Spring config for 3D tilt
  SPRING: SPRING_CONFIG.SMOOTH,
};

// Translation Values (in pixels)
export const TRANSLATE = {
  // Vertical lift on hover
  LIFT: -2,
  // Horizontal slide for links
  SLIDE: 2,
  // Menu item slide
  MENU_SLIDE: 4,
};

// Rotation Values (in degrees)
export const ROTATE = {
  // Icon rotation on hover
  ICON_HOVER: 5,
  // Icon rotation on tap (opposite direction)
  ICON_TAP: -5,
  // Menu icon rotation when open
  MENU_OPEN: 90,
};

// Duration Values (in seconds)
export const DURATION = {
  // Shine effect duration
  SHINE: 0.6,
  // Shine effect for cards
  SHINE_CARD: 0.8,
  // Scale transition
  SCALE: 0.2,
  // Image zoom transition
  IMAGE_ZOOM: 0.4,
  // Shadow transition
  SHADOW: 0.3,
  // Menu open/close
  MENU: 0.3,
  // Stagger delay per item
  STAGGER: 0.1,
};

// Opacity Values
export const OPACITY = {
  // Shine overlay opacity
  SHINE: 0.3,
  // Shine overlay for cards (more subtle)
  SHINE_CARD: 0.1,
  // Ripple effect opacity
  RIPPLE: 0.5,
};

// Easing Functions
export const EASING = {
  // Standard easing for most animations
  STANDARD: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
  // Ease in-out for shine effects
  EASE_IN_OUT: 'easeInOut' as const,
  // Ease out for smooth transitions
  EASE_OUT: 'easeOut' as const,
};

// Shadow Values
// Using CSS variables for consistency with the design system
export const SHADOW = {
  // Base shadow - matches --shadow-light CSS variable
  BASE: '0 4px 6px -1px var(--shadow-light)',
  // Hover shadow (enhanced depth) - matches --shadow-medium CSS variable
  HOVER: '0 25px 50px -12px var(--shadow-medium)',
};

// Animation Presets (commonly used combinations)
export const ANIMATION_PRESETS = {
  // Standard hover animation for buttons and interactive elements
  HOVER: {
    scale: SCALE.HOVER,
    y: TRANSLATE.LIFT,
    transition: SPRING_CONFIG.STANDARD,
  },
  // Standard tap/click animation
  TAP: {
    scale: SCALE.TAP,
    transition: SPRING_CONFIG.STANDARD,
  },
  // Icon hover animation
  ICON_HOVER: {
    scale: SCALE.ICON_HOVER,
    rotate: ROTATE.ICON_HOVER,
    transition: SPRING_CONFIG.STANDARD,
  },
  // Icon tap animation
  ICON_TAP: {
    scale: SCALE.TAP,
    rotate: ROTATE.ICON_TAP,
    transition: SPRING_CONFIG.STANDARD,
  },
  // Card hover animation
  CARD_HOVER: {
    scale: SCALE.CARD_HOVER,
    y: TRANSLATE.LIFT,
    transition: SPRING_CONFIG.STANDARD,
  },
  // Link hover animation
  LINK_HOVER: {
    x: TRANSLATE.SLIDE,
    transition: SPRING_CONFIG.STANDARD,
  },
  // Menu item hover animation
  MENU_ITEM_HOVER: {
    x: TRANSLATE.MENU_SLIDE,
    transition: SPRING_CONFIG.STANDARD,
  },
};

// Stagger Delays
export const STAGGER = {
  // Delay between product cards
  PRODUCT_CARDS: 0.08,
  // Delay between menu items
  MENU_ITEMS: 0.05,
  // Delay between text elements
  TEXT: 0.1,
  // Delay between sections
  SECTIONS: 0.2,
};
