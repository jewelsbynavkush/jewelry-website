# APM, Metrics, and Alerting

The app records **latency**, **error rate** (via status counts), and **DB timings** for observability and alerting.

## Built-in metrics

- **API:** Request count by method, path (normalized), and status; latency histogram buckets (10–5000 ms) when `x-vercel-request-start` is present (Vercel).
- **DB:** Health-check DB response time is recorded; percentiles (p50, p95, p99) are available in-memory.

**Module:** `lib/observability/metrics.ts`  
**Recording:** `createSecureResponse` / `createSecureErrorResponse` call `recordApiRequest`; health route calls `recordDbTiming('health_check', dbResponseTime)`.

## Metrics endpoint

- **GET /api/metrics** – Returns JSON: `api.latencyBuckets`, `api.countByStatus`, `db.samples`, `db.p50Ms`, `db.p95Ms`, `db.p99Ms`. **Admin-only** (requires valid JWT with admin role).

Use this for internal dashboards or to scrape into your APM. In production, restrict access (e.g. VPN, IP allowlist, or keep admin-only).

## Recommended alerts

| Alert | Condition | Action |
|-------|-----------|--------|
| **Error rate** | 5xx count or ratio above threshold (e.g. > 5% over 5 min) | Page on-call; check logs and health. |
| **Latency** | p95 or p99 above SLA (e.g. p99 > 2s) | Investigate slow queries, DB, or external calls. |
| **DB down** | `GET /api/health` returns 503 or DB status not `connected` | Check MongoDB Atlas, network, and connection limits. |
| **DB slow** | Health `responseTime` or DB p95 > threshold (e.g. 500 ms) | Check Atlas metrics, indexes, and load. |

## Wiring to an APM

- **Vercel Analytics:** Use Vercel’s built-in Web Vitals and serverless metrics; add custom events if needed.
- **Datadog:** Use DogStatsD or the Datadog API. In `lib/observability/metrics.ts`, call your StatsD client in `recordApiRequest` and `recordDbTiming` instead of (or in addition to) in-memory storage.
- **OpenTelemetry:** Add an OTLP exporter and record spans/metrics from the same points (request completion, health DB check).
- **Prometheus:** Scrape `GET /api/metrics` (or expose a `/metrics` endpoint in Prometheus format) and define PromQL rules for error rate, latency percentiles, and DB health.

## In-memory limits

- API buckets and counts grow unbounded (per path/status); restart or periodic reset clears them.
- DB timings keep the last 1000 samples only.

For production at scale, push metrics to an external system (StatsD, Datadog, OTLP) from `recordApiRequest` and `recordDbTiming` and use that for alerting and dashboards.
