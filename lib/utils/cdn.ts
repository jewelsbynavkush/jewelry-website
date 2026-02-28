/**
 * CDN utility functions for handling static asset URLs
 * Supports multiple CDN providers with fallback to local assets
 */

import { getCDNBaseUrl as getCDNBaseUrlFromEnv, getCDNProvider as getCDNProviderFromEnv } from '@/lib/utils/env';

type CDNProvider = 'cloudinary' | 'imagekit' | 'jsdelivr' | 'github' | 'r2' | 'local';

function getCDNBaseUrl(): string | null {
  return getCDNBaseUrlFromEnv();
}

function getCDNProvider(): CDNProvider {
  const explicitProvider = getCDNProviderFromEnv();
  if (explicitProvider) {
    return explicitProvider as CDNProvider;
  }
  const cdnBaseUrl = getCDNBaseUrl();
  if (!cdnBaseUrl) {
    return 'local';
  }
  
  // Auto-detect provider from URL
  if (cdnBaseUrl.includes('cloudinary.com')) {
    return 'cloudinary';
  }
  if (cdnBaseUrl.includes('imagekit.io')) {
    return 'imagekit';
  }
  if (cdnBaseUrl.includes('jsdelivr.net')) {
    return 'jsdelivr';
  }
  if (cdnBaseUrl.includes('raw.githubusercontent.com')) {
    return 'github';
  }
  if (cdnBaseUrl.includes('r2.dev')) {
    return 'r2';
  }
  
  return 'local';
}

/**
 * Check if URL is already a full URL (starts with http:// or https://)
 */
function isFullUrl(url: string): boolean {
  return /^https?:\/\//.test(url);
}

/**
 * Check if URL is a data URL
 */
function isDataUrl(url: string): boolean {
  return /^data:/.test(url);
}

/**
 * Normalize local asset path (remove leading slash if present, ensure it starts with assets/)
 */
function normalizeLocalPath(path: string): string {
  let normalized = path.startsWith('/') ? path.slice(1) : path;
  
  // If path doesn't start with 'assets/', assume it's relative to assets
  if (!normalized.startsWith('assets/')) {
    normalized = `assets/${normalized}`;
  }
  
  return normalized;
}

/**
 * Get CDN URL for an asset
 * 
 * @param assetPath - Local asset path (e.g., '/assets/products/ring.png' or 'assets/products/ring.png')
 * @returns Full CDN URL or local path if CDN not configured
 * 
 * @example
 * getCDNUrl('/assets/products/ring.png')
 * // Returns: 'https://res.cloudinary.com/cloud/image/upload/v1/assets/products/ring.png'
 * 
 * @example
 * getCDNUrl('assets/products/ring.png')
 * // Returns: 'https://res.cloudinary.com/cloud/image/upload/v1/assets/products/ring.png'
 */
export function getCDNUrl(assetPath: string | null | undefined): string {
  // Handle null/undefined
  if (!assetPath) {
    return '';
  }

  // Return as-is if already a full URL or data URL
  if (isFullUrl(assetPath) || isDataUrl(assetPath)) {
    return assetPath;
  }

  const cdnBaseUrl = getCDNBaseUrl();
  const provider = getCDNProvider();

  // If no CDN configured, return local path
  if (!cdnBaseUrl || provider === 'local') {
    // Ensure local paths start with /
    return assetPath.startsWith('/') ? assetPath : `/${assetPath}`;
  }

  // Normalize the path
  const normalizedPath = normalizeLocalPath(assetPath);

  // Build CDN URL based on provider
  switch (provider) {
    case 'cloudinary':
      // Cloudinary format: base/v1/path
      return `${cdnBaseUrl.replace(/\/$/, '')}/v1/${normalizedPath}`;
    
    case 'imagekit':
      // ImageKit format: base/path
      return `${cdnBaseUrl.replace(/\/$/, '')}/${normalizedPath}`;
    
    case 'jsdelivr':
      // jsDelivr format: base/path
      return `${cdnBaseUrl.replace(/\/$/, '')}/${normalizedPath}`;
    
    case 'github':
      // GitHub raw format: https://raw.githubusercontent.com/USER/REPO/BRANCH/path
      // If base URL is already a full GitHub raw URL, use it directly
      if (cdnBaseUrl.includes('raw.githubusercontent.com')) {
        return `${cdnBaseUrl.replace(/\/$/, '')}/${normalizedPath}`;
      }
      // Otherwise, construct from base URL pattern
      // Expected format: https://raw.githubusercontent.com/USER/REPO/BRANCH
      return `${cdnBaseUrl.replace(/\/$/, '')}/${normalizedPath}`;
    
    case 'r2':
      // R2 format: base/path
      return `${cdnBaseUrl.replace(/\/$/, '')}/${normalizedPath}`;
    
    default:
      // Fallback to local
      return assetPath.startsWith('/') ? assetPath : `/${assetPath}`;
  }
}

/**
 * Get optimized image URL with transformations (Cloudinary/ImageKit specific)
 * 
 * @param assetPath - Local asset path
 * @param options - Transformation options
 * @returns Optimized CDN URL
 */
export function getOptimizedImageUrl(
  assetPath: string | null | undefined,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpg' | 'png';
  }
): string {
  const baseUrl = getCDNUrl(assetPath);
  const provider = getCDNProvider();

  // If already a full URL or no options, return base URL
  if (isFullUrl(assetPath || '') || !options || provider === 'local' || provider === 'jsdelivr' || provider === 'github' || provider === 'r2') {
    return baseUrl;
  }

  const { width, height, quality = 80, format } = options;
  const transformations: string[] = [];

  // Cloudinary transformations
  if (provider === 'cloudinary') {
    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    if (quality) transformations.push(`q_${quality}`);
    if (format) transformations.push(`f_${format}`);
    
    if (transformations.length > 0) {
      const baseUrlWithoutVersion = baseUrl.replace(/\/v\d+\//, '/');
      return baseUrlWithoutVersion.replace(
        /\/upload\//,
        `/upload/${transformations.join(',')}/`
      );
    }
  }

  // ImageKit transformations
  if (provider === 'imagekit') {
    if (width) transformations.push(`w-${width}`);
    if (height) transformations.push(`h-${height}`);
    if (quality) transformations.push(`q-${quality}`);
    if (format) transformations.push(`f-${format}`);
    
    if (transformations.length > 0) {
      const separator = baseUrl.includes('?') ? '&' : '?';
      return `${baseUrl}${separator}tr=${transformations.join(',')}`;
    }
  }

  return baseUrl;
}

/**
 * Check if CDN is configured
 */
export function isCDNConfigured(): boolean {
  return !!getCDNBaseUrl() && getCDNProvider() !== 'local';
}
