# Request IDs and Idempotency

## Request IDs
- Middleware: `src/middleware/requestContext.js`
- Behavior:
  - Accepts inbound `X-Request-Id` or generates a UUID
  - Adds `X-Request-Id` to responses
  - Logger includes `[rid:<uuid>]` in each line
- Usage:
  - Send `X-Request-Id` from clients/load balancers for end-to-end tracing

## Idempotency
- Middleware: `src/middleware/idempotency.js`
- Scope: Applied to POST `/api/orders` and `/api/shipments`
- Behavior:
  - If `Idempotency-Key` (or `X-Idempotency-Key`) header is present, responses are cached
  - Subsequent identical requests with the same key return the original response (status + body) with `Idempotent-Replay: true`
  - Storage: Redis via `CacheService` with 24h TTL (configurable)
- Client guidance:
  - Generate a unique key per logical create action
  - Reuse the same key on retries (e.g., network timeouts)
