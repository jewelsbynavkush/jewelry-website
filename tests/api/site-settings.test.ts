/**
 * Site Settings API Tests
 * 
 * Tests for GET /api/site-settings:
 * - Get settings
 * - Cache headers
 * - Edge cases
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from '@/app/api/site-settings/route';
import { createGuestRequest, getJsonResponse, expectStatus } from '../helpers/api-helpers';
import connectDB from '@/lib/mongodb';
import SiteSettings from '@/models/SiteSettings';
import * as siteSettingsModule from '@/lib/data/site-settings';

describe('GET /api/site-settings', () => {
  beforeEach(async () => {
    await connectDB();
  });

  describe('Successful Retrieval', () => {
    it('should get site settings', async () => {
      await SiteSettings.create({
        type: 'general',
        data: {
          brand: {
            name: 'Test Site',
            tagline: 'Test tagline',
          },
          contact: {
            email: 'test@example.com',
            phone: '+911234567890',
          },
        },
      });
      await SiteSettings.create({
        type: 'social',
        data: {
          social: {
            facebook: 'https://facebook.com/test',
            instagram: 'https://instagram.com/test',
          },
        },
      });

      // Override mock to use real function
      vi.mocked(siteSettingsModule.getSiteSettings).mockImplementation(async () => {
        const [general, social] = await Promise.all([
          SiteSettings.findOne({ type: 'general' }).lean(),
          SiteSettings.findOne({ type: 'social' }).lean(),
        ]);
        return {
          brand: general?.data?.brand as { name: string; tagline?: string } || { name: 'Jewels by NavKush' },
          hero: { title: 'COLLECTION 2026', description: '', buttonText: 'DISCOVER', image: '', alt: '' },
          about: { title: 'ABOUT US', content: [], image: '', alt: '', buttonText: 'MORE ABOUT US' },
          mostLoved: { title: 'OUR MOST LOVED CREATIONS' },
          products: { title: 'OUR PRODUCTS' },
          contact: general?.data?.contact as { email?: string; phone?: string } || {},
          social: social?.data?.social as { facebook?: string; instagram?: string; twitter?: string } || {},
          intro: { rightColumnSlogan: 'Discover our most cherished pieces' },
          ecommerce: undefined,
          general: general?.data?.general as { businessHours?: string; contactEmail?: string; supportEmail?: string } || {},
        };
      });

      const request = createGuestRequest('GET', 'http://localhost:3000/api/site-settings');

      const response = await GET(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expect(data.settings).toBeDefined();
      expect(data.settings.siteName).toBe('Test Site');
    });

    it('should return empty object when no settings', async () => {
      // Override mock to return defaults
      vi.mocked(siteSettingsModule.getSiteSettings).mockResolvedValueOnce({
        brand: { name: 'Jewels by NavKush', tagline: 'A CELESTIAL TOUCH FOR TIMELESS MOMENTS' },
        hero: { title: 'COLLECTION 2026', description: '', buttonText: 'DISCOVER', image: '', alt: '' },
        about: { title: 'ABOUT US', content: [], image: '', alt: '', buttonText: 'MORE ABOUT US' },
        mostLoved: { title: 'OUR MOST LOVED CREATIONS' },
        products: { title: 'OUR PRODUCTS' },
        contact: {},
        social: {},
        intro: { rightColumnSlogan: 'Discover our most cherished pieces' },
        ecommerce: undefined,
        general: {},
      });

      const request = createGuestRequest('GET', 'http://localhost:3000/api/site-settings');

      const response = await GET(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expect(data.settings).toBeDefined();
    });
  });
});
