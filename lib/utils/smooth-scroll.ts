/**
 * Smooth scroll utility functions for anchor link navigation
 */

/**
 * Checks if URL is an anchor link
 * @param href - URL to check
 * @returns True if href starts with #
 */
export function isAnchorLink(href: string): boolean {
  return href.startsWith('#');
}

/**
 * Extracts anchor ID from URL
 * @param href - URL string (e.g., '/contact#section' or '#section')
 * @returns Anchor ID or null if not found
 */
export function getAnchorId(href: string): string | null {
  const hashIndex = href.indexOf('#');
  if (hashIndex === -1) return null;
  return href.substring(hashIndex + 1);
}

