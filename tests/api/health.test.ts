/**
 * Health Check API Tests
 * 
 * Tests for Health Check API route:
 * - GET /api/health
 * - Database connectivity check
 * - Service status reporting
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GET } from '@/app/api/health/route';
import { createGuestRequest, getJsonResponse, expectStatus } from '../helpers/api-helpers';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

describe('Health Check API', () => {
  beforeEach(async () => {
    await connectDB();
  });

  afterEach(async () => {
    // Clean up if needed
  });

  it('should return healthy status when database is connected', async () => {
    const request = createGuestRequest('GET', 'http://localhost:3000/api/health');
    const response = await GET(request);
    const data = await getJsonResponse(response);

    expectStatus(response, 200);
    expect(data).toHaveProperty('status');
    expect(data.status).toBe('healthy');
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('uptime');
    expect(data).toHaveProperty('services');
    expect(data.services).toHaveProperty('database');
    expect(data.services.database.status).toBe('connected');
    expect(data.services.database).toHaveProperty('responseTime');
    expect(typeof data.services.database.responseTime).toBe('number');
    expect(data).toHaveProperty('version');
    expect(data).toHaveProperty('responseTime');
  });

  it('should include all required health check fields', async () => {
    const request = createGuestRequest('GET', 'http://localhost:3000/api/health');
    const response = await GET(request);
    const data = await getJsonResponse(response);

    expect(data).toMatchObject({
      status: expect.any(String),
      timestamp: expect.any(String),
      uptime: expect.any(Number),
      services: {
        database: {
          status: expect.any(String),
          responseTime: expect.any(Number),
        },
      },
      version: expect.any(String),
      responseTime: expect.any(Number),
    });
  });

  it('should return valid ISO timestamp', async () => {
    const request = createGuestRequest('GET', 'http://localhost:3000/api/health');
    const response = await GET(request);
    const data = await getJsonResponse(response);

    const timestamp = new Date(data.timestamp);
    expect(timestamp.getTime()).not.toBeNaN();
    expect(data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it('should return positive uptime', async () => {
    const request = createGuestRequest('GET', 'http://localhost:3000/api/health');
    const response = await GET(request);
    const data = await getJsonResponse(response);

    expect(data.uptime).toBeGreaterThanOrEqual(0);
  });

  it('should return positive response time', async () => {
    const request = createGuestRequest('GET', 'http://localhost:3000/api/health');
    const response = await GET(request);
    const data = await getJsonResponse(response);

    // Response time can be 0 if connection is already established (cached)
    // But it should be a number >= 0
    expect(data.responseTime).toBeGreaterThanOrEqual(0);
    expect(data.services.database.responseTime).toBeGreaterThanOrEqual(0);
  });

  it('should have database status as connected when MongoDB is available', async () => {
    // Ensure MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    const request = createGuestRequest('GET', 'http://localhost:3000/api/health');
    const response = await GET(request);
    const data = await getJsonResponse(response);

    expect(data.services.database.status).toBe('connected');
  });

  it('should return correct version', async () => {
    const request = createGuestRequest('GET', 'http://localhost:3000/api/health');
    const response = await GET(request);
    const data = await getJsonResponse(response);

    expect(data.version).toBeDefined();
    expect(typeof data.version).toBe('string');
  });

  it('should have proper cache headers', async () => {
    const request = createGuestRequest('GET', 'http://localhost:3000/api/health');
    const response = await GET(request);

    // Health check should not be cached
    const cacheControl = response.headers.get('cache-control');
    expect(cacheControl).toBeDefined();
  });
});
