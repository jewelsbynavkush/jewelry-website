import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { validateSanityEnv } from '@/lib/security/env-validation';

// Validate environment variables on server-side
if (typeof window === 'undefined') {
  try {
    validateSanityEnv();
  } catch (error) {
    // In development, log the error; in production, fail silently to prevent build errors
    if (process.env.NODE_ENV === 'development') {
      console.error('Sanity configuration error:', error);
    }
  }
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01';

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
});

const builder = imageUrlBuilder(client);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

