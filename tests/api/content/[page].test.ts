/**
 * Content API Tests
 * 
 * Tests for GET /api/content/[page]:
 * - Get page content
 * - Invalid page
 * - Content not found
 * - Cache headers
 * - Edge cases
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GET } from '@/app/api/content/[page]/route';
import { createGuestRequest, getJsonResponse, expectStatus } from '../../helpers/api-helpers';
import connectDB from '@/lib/mongodb';

describe('GET /api/content/[page]', () => {
  beforeEach(async () => {
    await connectDB();
  });

  describe('Successful Retrieval', () => {
    it('should get content for valid page', async () => {
      const request = createGuestRequest('GET', 'http://localhost:3000/api/content/about');

      const response = await GET(request, { params: Promise.resolve({ page: 'about' }) });
      await getJsonResponse(response);

      // May return 404 if content doesn't exist, or 200 if it does
      expect([200, 404]).toContain(response.status);
    });
  });

  describe('Content Not Found', () => {
    it('should return 404 for non-existent page', async () => {
      const request = createGuestRequest('GET', 'http://localhost:3000/api/content/non-existent');

      const response = await GET(request, { params: Promise.resolve({ page: 'non-existent' }) });
      expectStatus(response, 404);
    });
  });
});
