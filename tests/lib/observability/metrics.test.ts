import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  recordApiRequest,
  recordDbTiming,
  getApiStats,
  getDbTimingStats,
  getRequestDurationMs,
  resetMetrics,
} from '@/lib/observability/metrics';

vi.mock('@/lib/utils/env', () => ({
  isTest: vi.fn(() => false),
}));

describe('metrics', () => {
  beforeEach(async () => {
    const env = await import('@/lib/utils/env');
    vi.mocked(env.isTest).mockReturnValue(false);
    resetMetrics();
  });

  describe('recordApiRequest', () => {
    it('records request count by method, path, and status', () => {
      recordApiRequest({ method: 'GET', path: '/api/health', status: 200 });
      recordApiRequest({ method: 'GET', path: '/api/health', status: 200 });
      recordApiRequest({ method: 'POST', path: '/api/cart', status: 201 });
      const stats = getApiStats();
      expect(stats.countByStatus['GET /health_200']).toBe(2);
      expect(stats.countByStatus['POST /cart_201']).toBe(1);
    });

    it('normalizes path with object id to :id', () => {
      recordApiRequest({
        method: 'GET',
        path: '/api/orders/507f1f77bcf86cd799439011',
        status: 200,
      });
      const stats = getApiStats();
      expect(stats.countByStatus['GET /orders/:id_200']).toBe(1);
    });

    it('records latency bucket when durationMs is provided', () => {
      recordApiRequest({
        method: 'GET',
        path: '/api/products',
        status: 200,
        durationMs: 50,
      });
      recordApiRequest({
        method: 'GET',
        path: '/api/products',
        status: 200,
        durationMs: 150,
      });
      const stats = getApiStats();
      expect(stats.latencyBuckets['GET /products_50ms']).toBe(1);
      expect(stats.latencyBuckets['GET /products_250ms']).toBe(1);
    });

    it('uses highest bucket for duration above max', () => {
      recordApiRequest({
        method: 'GET',
        path: '/api/slow',
        status: 200,
        durationMs: 10000,
      });
      const stats = getApiStats();
      expect(stats.latencyBuckets['GET /slow_5000ms']).toBe(1);
    });
  });

  describe('recordDbTiming', () => {
    it('records db timing samples', () => {
      recordDbTiming('health_check', 25);
      recordDbTiming('health_check', 50);
      recordDbTiming('health_check', 75);
      const stats = getDbTimingStats();
      expect(stats.samples).toBe(3);
      expect(stats.p50).toBe(50);
      expect(stats.p95).toBe(75);
      expect(stats.p99).toBe(75);
    });
  });

  describe('getDbTimingStats', () => {
    it('returns zeros when no samples', () => {
      const stats = getDbTimingStats();
      expect(stats).toEqual({ samples: 0, p50: 0, p95: 0, p99: 0 });
    });
  });

  describe('getRequestDurationMs', () => {
    it('returns undefined when header is missing', () => {
      const request = new Request('http://localhost/api/health', {
        headers: {},
      });
      expect(getRequestDurationMs(request)).toBeUndefined();
    });

    it('returns undefined when header is not a number', () => {
      const request = new Request('http://localhost/api/health', {
        headers: { 'x-vercel-request-start': 'not-a-number' },
      });
      expect(getRequestDurationMs(request)).toBeUndefined();
    });

    it('returns duration ms when header is valid', () => {
      const startSec = (Date.now() - 100) / 1000;
      const request = new Request('http://localhost/api/health', {
        headers: { 'x-vercel-request-start': String(startSec) },
      });
      const duration = getRequestDurationMs(request);
      expect(duration).toBeGreaterThanOrEqual(95);
      expect(duration).toBeLessThanOrEqual(150);
    });
  });
});
