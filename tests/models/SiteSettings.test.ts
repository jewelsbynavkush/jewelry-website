/**
 * SiteSettings Model Tests
 * 
 * Tests for SiteSettings model:
 * - Schema validation
 * - Default values
 * - Settings retrieval
 * - Settings update
 * - Edge cases
 */

import { describe, it, expect, beforeEach } from 'vitest';
import connectDB from '@/lib/mongodb';
import SiteSettings from '@/models/SiteSettings';
import { createTestSiteSettings } from '../helpers/test-utils';

describe('SiteSettings Model', () => {
  beforeEach(async () => {
    await connectDB();
  });

  describe('Schema Validation', () => {
    it('should create site settings with valid data', async () => {
      const settingsData = createTestSiteSettings();
      const settings = await SiteSettings.create(settingsData);

      expect(settings).toBeDefined();
      expect(settings.type).toBe(settingsData.type);
      expect(settings.data).toBeDefined();
      expect((settings.data as Record<string, unknown>).siteName).toBe((settingsData.data as Record<string, unknown>).siteName);
    });

    it('should allow minimal required fields', async () => {
      const settings = await SiteSettings.create({
        type: 'general',
        data: {
          siteName: 'Test Site',
        },
      });

      expect(settings).toBeDefined();
      expect(settings.type).toBe('general');
      expect((settings.data as Record<string, unknown>).siteName).toBe('Test Site');
    });

    it('should allow all optional fields', async () => {
      const settings = await SiteSettings.create({
        type: 'general',
        data: {
          siteName: 'Test Site',
          siteDescription: 'Test description',
          contactEmail: 'test@example.com',
          contactPhone: '+911234567890',
          socialMedia: {
            facebook: 'https://facebook.com/test',
            instagram: 'https://instagram.com/test',
          },
          seo: {
            metaTitle: 'Test Title',
            metaDescription: 'Test Description',
          },
        },
      });

      expect(settings).toBeDefined();
      const data = settings.data as Record<string, unknown>;
      expect((data.socialMedia as Record<string, unknown>)?.facebook).toBe('https://facebook.com/test');
      expect((data.seo as Record<string, unknown>)?.metaTitle).toBe('Test Title');
    });
  });

  describe('Settings Retrieval', () => {
    it('should retrieve all settings', async () => {
      await SiteSettings.create(createTestSiteSettings());

      const settings = await SiteSettings.findOne();
      expect(settings).toBeDefined();
      expect(settings?.type).toBeDefined();
      expect(settings?.data).toBeDefined();
    });

    it('should allow multiple settings documents', async () => {
      await SiteSettings.create({
        type: 'general',
        data: {
          siteName: 'Settings 1',
        },
      });

      await SiteSettings.create({
        type: 'hero',
        data: {
          title: 'Hero Title',
        },
      });

      const allSettings = await SiteSettings.find();
      expect(allSettings.length).toBe(2);
    });
  });

  describe('Settings Update', () => {
    it('should update existing settings', async () => {
      const settings = await SiteSettings.create(createTestSiteSettings());

      const data = settings.data as Record<string, unknown>;
      data.siteName = 'Updated Site Name';
      data.contactEmail = 'updated@example.com';
      settings.markModified('data'); // Mark data field as modified for Mixed type
      await settings.save();

      const updated = await SiteSettings.findById(settings._id);
      const updatedData = updated?.data as Record<string, unknown>;
      expect(updatedData?.siteName).toBe('Updated Site Name');
      expect(updatedData?.contactEmail).toBe('updated@example.com');
    });

    it('should update nested objects', async () => {
      const settings = await SiteSettings.create({
        type: 'general',
        data: {
          siteName: 'Test Site',
          socialMedia: {
            facebook: 'https://facebook.com/old',
          },
        },
      });

      const data = settings.data as Record<string, unknown>;
      if (data.socialMedia) {
        (data.socialMedia as Record<string, unknown>).instagram = 'https://instagram.com/new';
      }
      settings.markModified('data'); // Mark data field as modified for Mixed type
      await settings.save();

      const updated = await SiteSettings.findById(settings._id);
      const updatedData = updated?.data as Record<string, unknown>;
      const socialMedia = updatedData?.socialMedia as Record<string, unknown>;
      expect(socialMedia?.facebook).toBe('https://facebook.com/old');
      expect(socialMedia?.instagram).toBe('https://instagram.com/new');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long site name', async () => {
      const longName = 'A'.repeat(200);
      const settings = await SiteSettings.create({
        type: 'general',
        data: {
          siteName: longName,
        },
      });

      const data = settings.data as Record<string, unknown>;
      expect(data.siteName).toBe(longName);
    });

    it('should handle invalid email format', async () => {
      // Email validation is not enforced at model level, only in API
      const settings = await SiteSettings.create({
        type: 'general',
        data: {
          siteName: 'Test Site',
          contactEmail: 'invalid-email',
        },
      });

      expect(settings).toBeDefined();
    });

    it('should handle empty social media object', async () => {
      const settings = await SiteSettings.create({
        type: 'general',
        data: {
          siteName: 'Test Site',
          socialMedia: {},
        },
      });

      const data = settings.data as Record<string, unknown>;
      expect(data.socialMedia).toBeDefined();
    });

    it('should handle null values for optional fields', async () => {
      const settings = await SiteSettings.create({
        type: 'general',
        data: {
          siteName: 'Test Site',
          siteDescription: null,
          contactEmail: null,
        },
      });

      expect(settings).toBeDefined();
    });
  });
});
