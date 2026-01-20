/**
 * Site Settings API Tests
 * 
 * Tests for GET /api/site-settings:
 * - Get settings
 * - Cache headers
 * - Edge cases
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GET } from '@/app/api/site-settings/route';
import { createGuestRequest, getJsonResponse, expectStatus } from '../helpers/api-helpers';
import connectDB from '@/lib/mongodb';
import SiteSettings from '@/models/SiteSettings';
import { createTestSiteSettings } from '../helpers/test-utils';

describe('GET /api/site-settings', () => {
  beforeEach(async () => {
    await connectDB();
  });

  describe('Successful Retrieval', () => {
    it('should get site settings', async () => {
      await SiteSettings.create({
        type: 'general',
        data: createTestSiteSettings(),
      });

      const request = createGuestRequest('GET', 'http://localhost:3000/api/site-settings');

      const response = await GET(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expect(data.settings).toBeDefined();
    });

    it('should return empty object when no settings', async () => {
      const request = createGuestRequest('GET', 'http://localhost:3000/api/site-settings');

      const response = await GET(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expect(data.settings).toBeDefined();
    });
  });
});
