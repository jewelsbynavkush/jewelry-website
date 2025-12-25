/**
 * Utility function for conditional className concatenation
 * Combines Tailwind classes safely and handles conditional classes
 */

type ClassValue = string | number | boolean | undefined | null | { [key: string]: boolean };

/**
 * Combines class names conditionally
 * @param classes - Variable number of class values (strings, objects, etc.)
 * @returns Combined class string
 */
export function cn(...classes: ClassValue[]): string {
  return classes
    .filter(Boolean)
    .map((cls) => {
      if (typeof cls === 'string') return cls;
      if (typeof cls === 'object' && cls !== null) {
        return Object.entries(cls)
          .filter(([, condition]) => condition)
          .map(([className]) => className)
          .join(' ');
      }
      return '';
    })
    .filter(Boolean)
    .join(' ');
}

