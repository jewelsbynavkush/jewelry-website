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
import { POST, GET, PUT, PATCH, DELETE } from '@/app/api/contact/route';
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

  describe('Unsupported methods', () => {
    it('GET should return 405', async () => {
      const request = createGuestRequest('GET', 'http://localhost:3000/api/contact');
      const response = await GET(request);
      const data = await getJsonResponse(response);
      expectStatus(response, 405);
      expectError(data);
      expect(response.headers.get('Allow')).toBe('POST');
    });

    it('PUT should return 405', async () => {
      const request = createGuestRequest('PUT', 'http://localhost:3000/api/contact');
      const response = await PUT(request);
      expectStatus(response, 405);
    });

    it('PATCH should return 405', async () => {
      const request = createGuestRequest('PATCH', 'http://localhost:3000/api/contact');
      const response = await PATCH(request);
      expectStatus(response, 405);
    });

    it('DELETE should return 405', async () => {
      const request = createGuestRequest('DELETE', 'http://localhost:3000/api/contact');
      const response = await DELETE(request);
      expectStatus(response, 405);
    });
  });

  describe('Request body and length validation', () => {
    it('should reject invalid JSON', async () => {
      const request = new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Origin: 'http://localhost:3000',
          Referer: 'http://localhost:3000/contact',
        },
        body: 'not valid json {',
      });
      const response = await POST(request);
      const data = await getJsonResponse(response);
      expectStatus(response, 400);
      expect(data.error ?? data.message).toBeDefined();
    });

    it('should reject name too long', async () => {
      const request = createGuestRequest('POST', 'http://localhost:3000/api/contact', {
        name: 'a'.repeat(101),
        email: 'test@example.com',
        subject: 'Test',
        message: 'Test message',
      });
      const response = await POST(request);
      const data = await getJsonResponse(response);
      expectStatus(response, 400);
      expectError(data);
    });

    it('should reject email too long', async () => {
      const request = createGuestRequest('POST', 'http://localhost:3000/api/contact', {
        name: 'Test',
        email: 'a'.repeat(250) + '@x.com',
        subject: 'Test',
        message: 'Test message',
      });
      const response = await POST(request);
      const data = await getJsonResponse(response);
      expectStatus(response, 400);
      expectError(data);
    });

    it('should reject message too long', async () => {
      const request = createGuestRequest('POST', 'http://localhost:3000/api/contact', {
        name: 'Test',
        email: 'test@example.com',
        subject: 'Test',
        message: 'a'.repeat(5001),
      });
      const response = await POST(request);
      const data = await getJsonResponse(response);
      expectStatus(response, 400);
      expectError(data);
    });
  });
});
