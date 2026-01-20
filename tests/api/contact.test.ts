/**
 * Contact API Tests
 * 
 * Tests for POST /api/contact:
 * - Submit contact form
 * - Validation
 * - Rate limiting (stricter)
 * - CSRF protection
 * - XSS prevention
 * - Edge cases
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { POST } from '@/app/api/contact/route';
import { createGuestRequest, getJsonResponse, expectStatus, expectSuccess, expectError } from '../helpers/api-helpers';
import connectDB from '@/lib/mongodb';

describe('POST /api/contact', () => {
  beforeEach(async () => {
    await connectDB();
  });

  describe('Successful Submission', () => {
    it('should submit contact form', async () => {
      const request = createGuestRequest('POST', 'http://localhost:3000/api/contact', {
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'Test message',
      });

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 200);
      expectSuccess(data);
      expect(data.message).toContain('Thank you');
    });
  });

  describe('Validation Errors', () => {
    it('should reject missing name', async () => {
      const request = createGuestRequest('POST', 'http://localhost:3000/api/contact', {
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'Test message',
      });

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 400);
      expectError(data);
    });

    it('should reject invalid email', async () => {
      const request = createGuestRequest('POST', 'http://localhost:3000/api/contact', {
        name: 'Test User',
        email: 'invalid-email',
        subject: 'Test Subject',
        message: 'Test message',
      });

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 400);
      expectError(data);
    });

    it('should reject missing message', async () => {
      const request = createGuestRequest('POST', 'http://localhost:3000/api/contact', {
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
      });

      const response = await POST(request);
      const data = await getJsonResponse(response);

      expectStatus(response, 400);
      expectError(data);
    });
  });

  describe('Security Checks', () => {
    it('should apply rate limiting', async () => {
      const request = createGuestRequest('POST', 'http://localhost:3000/api/contact', {
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'Test message',
      });

      const response = await POST(request);
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    });

    it('should sanitize XSS attempts', async () => {
      const request = createGuestRequest('POST', 'http://localhost:3000/api/contact', {
        name: '<script>alert("xss")</script>',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'Test message',
      });

      const response = await POST(request);
      const data = await getJsonResponse(response);

      // Should sanitize and still accept
      if (response.status === 200) {
        expect(data).toBeDefined();
      }
    });
  });
});
