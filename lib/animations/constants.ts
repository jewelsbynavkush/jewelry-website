/**
 * Centralized 3D Animation Constants
 * Ensures consistent animation behavior across all components
 */

export const ANIMATION_3D = {
  // Rotation angles (degrees)
  ROTATION: {
    MAX: 10, // Maximum rotation angle (±10 degrees)
    RANGE_MIN: -0.5, // Normalized mouse position range minimum
    RANGE_MAX: 0.5, // Normalized mouse position range maximum
  },
  
  // Z-axis depth translation
  DEPTH: {
    MULTIPLIER: 20, // Depth multiplier for translateZ
  },
  
  // Scale effects
  SCALE: {
    HOVER_MULTIPLIER: 0.04, // Scale multiplier based on mouse distance
    IMAGE_HOVER: 1.1, // Image scale on hover
    TEXT_HOVER: 1.02, // Text scale on hover
  },
  
  // Spring physics (consistent across all 3D effects)
  SPRING: {
    STIFFNESS: 300,
    DAMPING: 20,
    MASS: 1,
  },
  
  // Perspective
  PERSPECTIVE: '1500px',
  
  // Entry animations
  ENTRY: {
    DURATION: 0.8,
    EASE: [0.16, 1, 0.3, 1],
    TYPE: 'spring' as const,
    STIFFNESS: 100,
    DAMPING: 15,
    INITIAL_OPACITY: 0.3, // Initial opacity for fade-in effect
    INITIAL_Y: 60, // Initial Y offset for slide-up animation
    INITIAL_SCALE: 0.88, // Initial scale for zoom-in effect
    INITIAL_ROTATE_Y: -20, // Initial rotation for 3D effect
  },
  
  // Hover animations
  HOVER: {
    DURATION: 0.5,
    EASE: [0.25, 0.1, 0.25, 1],
    TEXT_LIFT: -5, // Text vertical movement on hover
  },
  
  // Shine effects
  SHINE: {
    PRIMARY: {
      WIDTH: '60%',
      OPACITY: 1,
      DURATION: 0.8,
      EASE: [0.4, 0, 0.2, 1],
    },
    SECONDARY: {
      WIDTH: '40%',
      OPACITY: 0.3,
      DURATION: 1,
      DELAY: 0.1,
      EASE: [0.4, 0, 0.2, 1],
    },
  },
  
  // Glow effects
  GLOW: {
    OPACITY: 0.4,
    SCALE: 1.1,
    BLUR: '20px',
    DURATION: 0.4,
  },
  
  // Shadow effects
  SHADOW: {
    DEFAULT: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    HOVER: '0 30px 60px -15px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1), 0 0 40px rgba(255, 255, 255, 0.2)',
    TRANSITION_DURATION: 0.4,
  },
  
  // Image filters
  FILTER: {
    DEFAULT: 'brightness(1) contrast(1) saturate(1)',
    HOVER: 'brightness(1.15) contrast(1.05) saturate(1.1)',
  },
  
  // Stagger delays
  STAGGER: {
    PRODUCT_CARD: 0.08, // Delay between product cards
    CATEGORY_IMAGE: 0.12, // Delay between category images
    SECTION: 0.1, // Delay between sections
  },
  
  // Performance optimizations
  PERFORMANCE: {
    WILL_CHANGE: 'transform, opacity', // CSS will-change hint
    REDUCE_MOTION_DURATION: 0.2, // Duration when reduced motion is preferred
  },
  
  // Viewport settings - Optimized for scroll performance
  VIEWPORT: {
    ONCE: true, // Set to true to prevent re-animation during scroll (fixes hangs)
    MARGIN: '50px', // Margin for earlier trigger (balanced for performance and visibility)
    AMOUNT: 0.2, // Trigger when 20% visible (good balance)
  },
} as const;

// Note: Helper functions would require framer-motion imports
// For now, components will use the constants directly for consistency

