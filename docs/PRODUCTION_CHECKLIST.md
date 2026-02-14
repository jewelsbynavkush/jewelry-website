# Production Checklist

Technical pre-launch checklist. Use with [PRODUCTION_LAUNCH_GUIDE.md](./PRODUCTION_LAUNCH_GUIDE.md) for full business launch.

## Environment

- [ ] `NEXT_PUBLIC_ENV=production`
- [ ] `NEXT_PUBLIC_BASE_URL` = production URL (https)
- [ ] `MONGODB_URI` = production Atlas URI
- [ ] `JWT_SECRET` = strong secret (min 32 chars)
- [ ] `CORS_ALLOWED_ORIGINS` = production origin(s)
- [ ] `GMAIL_*` or SMTP vars for email
- [ ] `SUPPORT_EMAIL` or `CONTACT_EMAIL`
- [ ] `CONTACT_EMAIL`, `CONTACT_PHONE`, `CONTACT_ADDRESS` (contact page / migration)
- [ ] `OBFUSCATION_KEY` or `NEXT_PUBLIC_OBFUSCATION_KEY` (min 32 chars)

## Database

- [ ] Run `npm run migrate:site-settings` after deploy (or run once manually)
- [ ] Run `npm run migrate:country-settings` if using country settings
- [ ] MongoDB IP allowlist / VPC includes deployment (e.g. Vercel IPs if needed)

## Security

- [ ] Security headers: applied in root `proxy.ts`. No extra setup if using default Next.js.
- [ ] CSP: `proxy.ts` uses `script-src 'self' 'unsafe-inline'` (no `unsafe-eval`). For strict CSP (e.g. nonces), see `lib/security/constants.ts` and `proxy.ts`.
- [ ] Rate limiting: in-memory by default (single instance). For **multi-instance** (e.g. serverless, multiple replicas), implement a distributed store (e.g. Redis) using the interface in `lib/security/rate-limit-store.ts` and wire it so `checkRateLimit` uses it.
- [ ] Swagger/API docs: set `ENABLE_SWAGGER=false` in production or use `SWAGGER_IP_WHITELIST` to restrict access.

## CI / Deploy

- [ ] GitHub Actions CI runs on PRs (lint, typecheck, test, build). See `.github/workflows/ci.yml`.
- [ ] Build env vars set in Vercel (or host) so `npm run build` succeeds.

## Observability

- [ ] Health: `GET /api/health` returns 200 when DB is connected. Use for load balancer or uptime checks.
- [ ] Logs: production logger outputs one JSON line per log; pipe to your log aggregator (Datadog, CloudWatch, etc.).
- [ ] API responses are logged (method, path, status, correlationId) via `createSecureResponse` / `createSecureErrorResponse`.

## Post-deploy

- [ ] Confirm contact page shows correct email/phone/address (from DB or env).
- [ ] Confirm `/api/health` returns healthy.
- [ ] Test login, checkout, and one critical path end-to-end.
