/**
 * Metrics for APM and alerting: latency, error rate, DB timings.
 * In-memory by default; wire to StatsD/Datadog/OpenTelemetry in production.
 */

import { isTest } from '@/lib/utils/env';

export interface ApiRequestMetric {
  method: string;
  path: string;
  status: number;
  durationMs?: number;
}

export interface DbTimingMetric {
  operation: string;
  durationMs: number;
}

const BUCKET_MS = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000];

function findBucket(ms: number): number {
  const b = BUCKET_MS.find((x) => ms <= x);
  return b ?? BUCKET_MS[BUCKET_MS.length - 1];
}

const apiLatencyBuckets: Record<string, number> = {};
const apiCountByStatus: Record<string, number> = {};
const dbTimings: number[] = [];
const maxDbSamples = 1000;

function getKey(method: string, path: string): string {
  const normalized = path.replace(/[0-9a-f]{24}/gi, ':id').replace(/\/api/, '');
  return `${method} ${normalized}`;
}

export function recordApiRequest(metric: ApiRequestMetric): void {
  if (isTest()) return;
  const key = getKey(metric.method, metric.path);
  if (metric.durationMs != null) {
    const bucket = findBucket(metric.durationMs);
    const bucketKey = `${key}_${bucket}ms`;
    apiLatencyBuckets[bucketKey] = (apiLatencyBuckets[bucketKey] ?? 0) + 1;
  }
  const statusKey = `${key}_${metric.status}`;
  apiCountByStatus[statusKey] = (apiCountByStatus[statusKey] ?? 0) + 1;
}

export function recordDbTiming(operation: string, durationMs: number): void {
  if (isTest()) return;
  dbTimings.push(durationMs);
  if (dbTimings.length > maxDbSamples) {
    dbTimings.shift();
  }
}

export function getApiStats(): { latencyBuckets: Record<string, number>; countByStatus: Record<string, number> } {
  return {
    latencyBuckets: { ...apiLatencyBuckets },
    countByStatus: { ...apiCountByStatus },
  };
}

export function getDbTimingStats(): { samples: number; p50: number; p95: number; p99: number } {
  if (dbTimings.length === 0) {
    return { samples: 0, p50: 0, p95: 0, p99: 0 };
  }
  const sorted = [...dbTimings].sort((a, b) => a - b);
  const p = (q: number) => sorted[Math.min(Math.floor((q / 100) * sorted.length), sorted.length - 1)] ?? 0;
  return {
    samples: sorted.length,
    p50: p(50),
    p95: p(95),
    p99: p(99),
  };
}

/**
 * Reset in-memory metrics (for tests).
 */
export function resetMetrics(): void {
  Object.keys(apiLatencyBuckets).forEach((k) => delete apiLatencyBuckets[k]);
  Object.keys(apiCountByStatus).forEach((k) => delete apiCountByStatus[k]);
  dbTimings.length = 0;
}

/**
 * Parse request start from Vercel header (seconds since epoch) for latency.
 */
export function getRequestDurationMs(request: Request): number | undefined {
  const vercelStart = request.headers.get('x-vercel-request-start');
  if (!vercelStart) return undefined;
  const startSec = parseFloat(vercelStart);
  if (Number.isNaN(startSec)) return undefined;
  return Math.round(Date.now() - startSec * 1000);
}
