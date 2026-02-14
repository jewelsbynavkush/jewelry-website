# Backend Standards

Checklist for new or updated API routes and backend code. See also: [BACKEND_COMPREHENSIVE_AUDIT_2025_FINAL.md](./BACKEND_COMPREHENSIVE_AUDIT_2025_FINAL.md), [API_GUIDE.md](./API_GUIDE.md), [SWAGGER_API_DOCUMENTATION.md](./SWAGGER_API_DOCUMENTATION.md).

## 1. Request / response models

- **Types:** Add or reuse interfaces in `types/api.ts`:
  - Request: `*Request` (e.g. `AddToCartRequest`).
  - Response: `*Response` (e.g. `GetCartResponse`).
- **Usage:** Route handlers should type request body and response payload with these types.
- **Error shape:** Use `ErrorResponse` and `createSecureErrorResponse()` for consistent error responses.

## 2. Validation

- **Input:** Validate all request body and path/query params with **Zod**.
  - Define schema in route file or in `lib/validations/` (e.g. `schemas.ts`, `address-country-aware.ts`).
  - Use `.parse()` or `.parseAsync()`; surface validation errors via `formatZodError()` and return 400.
- **Boundaries:** Validate at the API boundary; keep business logic in services/models.

## 3. Queries

- **Read-only:** Use `.lean()` for queries that do not need Mongoose documents (e.g. no `.save()`).
- **Projection:** Use `.select()` to limit fields (e.g. exclude sensitive data, select only needed fields).
- **Sensitive fields:** Use `+password` only when the route must read the password field.

## 4. Business logic

- **Location:** Controllers/routes should orchestrate only; put business logic in:
  - `lib/inventory/`, `lib/cart/`, etc.
  - Model statics/methods where appropriate.
- **Transactions:** Use MongoDB sessions for multi-document updates (e.g. order + stock + cart).

## 5. Security

- **Every route:** Use `applyApiSecurity()` (CORS, CSRF, rate limit as configured).
- **Auth:** Use `requireAuth()`, `requireAdmin()`, or `optionalAuth()` as appropriate.
- **Input:** Sanitize and validate; no raw user input in queries or responses.

## 6. Tests

- **Location:** `tests/api/<route-path>.test.ts` (e.g. `tests/api/cart/route.test.ts`, `tests/api/orders/[orderId]/cancel.test.ts`).
- **Cover:** Success, validation errors, auth/authorization, edge cases (e.g. empty cart, insufficient stock).
- **Run:** `npm run test -- --run` (optionally `--coverage` to include coverage report).
- **Thresholds:** Vitest coverage thresholds (see `vitest.config.ts`): lines 70%, functions 65%, branches 60%, statements 70%. Tests that use MongoMemoryServer require network/all permissions to bind.

## 7. Swagger

- **Spec:** Add or update the route in `app/api/docs/route.ts` under `paths` and, if needed, `components.schemas`.
- **Match API:** Path, method, request body schema, and response schema must match the implementation (e.g. response field names like `inventory` not `product`).
- **Exclusions:** Dev-only routes (e.g. `/api/test-db`) are intentionally omitted from the public spec.
- **Coverage:** All public API routes (cart, orders, auth, users, products, categories, content, site-settings, contact, health, inventory) are documented in the OpenAPI spec. GET `/api/docs` returns the spec and is not itself listed in the spec.

## 8. Idempotency

- **Mutation APIs:** For create-order, cancel-order, restock, etc., support `idempotencyKey` in body where applicable; document in Swagger and use existing helpers (e.g. `generateIdempotencyKey`, model `checkIdempotencyKey`).

## Quick checklist (new API)

| Item | Done |
|------|------|
| Request/response types in `types/api.ts` | |
| Zod schema and parse in route | |
| `.select()` / `.lean()` where appropriate | |
| Business logic in service/model | |
| `applyApiSecurity()` + auth | |
| Test file with success + error cases | |
| Path + request/response in `app/api/docs/route.ts` | |
