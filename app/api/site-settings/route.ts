import { NextRequest } from 'next/server';
import { getSiteSettings } from '@/lib/data/site-settings';
import { applyApiSecurity, createSecureResponse, createSecureErrorResponse } from '@/lib/security/api-security';
import { logError } from '@/lib/security/error-handler';
import { SECURITY_CONFIG } from '@/lib/security/constants';
import type { GetSiteSettingsResponse } from '@/types/api';

export async function GET(request: NextRequest) {
  // Apply security (CORS, CSRF, rate limiting)
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: SECURITY_CONFIG.RATE_LIMIT.PUBLIC_BROWSING,
  });
  if (securityResponse) return securityResponse;

  try {
    const settingsData = await getSiteSettings();
    
    // Map to API response format
    const settings: GetSiteSettingsResponse['settings'] = {
      siteName: settingsData.brand.name,
      siteDescription: settingsData.brand.tagline,
      contactEmail: settingsData.contact.email,
      contactPhone: settingsData.contact.phone,
      socialMedia: {
        facebook: settingsData.social.facebook,
        instagram: settingsData.social.instagram,
        twitter: settingsData.social.twitter,
      },
    };
    
    const responseData: GetSiteSettingsResponse = { settings };
    const response = createSecureResponse(responseData, 200, request);
    
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return response;
  } catch (error) {
    logError('site-settings API', error);
    return createSecureErrorResponse('Failed to fetch site settings', 500, request);
  }
}

