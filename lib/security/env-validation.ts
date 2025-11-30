/**
 * Environment variable validation utilities
 * Ensures required environment variables are present
 */

/**
 * Assert that an environment variable exists
 */
export function assertEnvVar(
  value: string | undefined,
  name: string
): string {
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
      'Please check your .env.local file.'
    );
  }
  return value;
}

/**
 * Validate Firebase environment variables
 */
export function validateFirebaseEnv(): void {
  const required = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required Firebase environment variables: ${missing.join(', ')}. ` +
      'Please check your .env.local file.'
    );
  }
}

/**
 * Validate Sanity environment variables
 */
export function validateSanityEnv(): void {
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    throw new Error(
      'Missing required Sanity environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID. ' +
      'Please check your .env.local file.'
    );
  }
}

/**
 * Validate all required environment variables
 * Call this in development or during build
 */
export function validateAllEnv(): void {
  if (process.env.NODE_ENV === 'production') {
    // Only validate in production builds
    try {
      validateFirebaseEnv();
      validateSanityEnv();
    } catch (error) {
      console.error('Environment validation failed:', error);
      throw error;
    }
  }
}

