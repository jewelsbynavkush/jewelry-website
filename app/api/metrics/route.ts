/**
 * Metrics endpoint for APM and alerting.
 * Exposes in-memory latency buckets, request counts by status, and DB timing percentiles.
 * Protect in production (e.g. admin-only or IP allowlist).
 */

import { NextRequest } from 'next/server';
import { applyApiSecurity, createSecureResponse } from '@/lib/security/api-security';
import { getApiStats, getDbTimingStats } from '@/lib/observability/metrics';
import { requireAdmin } from '@/lib/auth/middleware';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const securityResponse = applyApiSecurity(request, { enableRateLimit: true });
  if (securityResponse) return securityResponse;

  const authResult = await requireAdmin(request);
  if ('error' in authResult) {
    return authResult.error;
  }

  const api = getApiStats();
  const db = getDbTimingStats();

  const payload = {
    api: {
      latencyBuckets: api.latencyBuckets,
      countByStatus: api.countByStatus,
    },
    db: {
      samples: db.samples,
      p50Ms: db.p50,
      p95Ms: db.p95,
      p99Ms: db.p99,
    },
  };

  return createSecureResponse(payload, 200, request);
}
