# Observability

## Logs
- Application: morgan (dev/combined)
- Security: `SecurityLogger` with endpoints `/api/security/logs`, `/metrics`, `/health`
- Activity: database-backed `activity_logs` table, endpoint `/api/activity/logs` (Admin)
- Queue events: job completion/failure logs

### File outputs (date-stamped)
- Combined: `logs/YYYY-MM-DD-combined.log`
- Errors: `logs/YYYY-MM-DD-error.log`
- Security: `logs/YYYY-MM-DD-security.log`
- Audit: `logs/YYYY-MM-DD-audit.log`

Rotation strategy: filenames are stamped per day; external rotation (e.g., logrotate) can archive/compress older files.

## Request Correlation
- Incoming requests receive/respond with `X-Request-Id` header
- Correlated in logs as `[rid:<uuid>]`
- Useful for tracing requests across services and logs

## Metrics (future extension)
- Request rate, p95 latency by route
- Error rates by type
- Queue depth, job processing time
- DB query timings (Prisma middleware)

## Queue Health
- `QueueService.getAllQueueStats()` exposed under `/api/queue/status`
- Track waiting/active/completed/failed jobs per queue

## Dashboard KPIs
- Orders/Shipments created per day
- Deliveries per day
- Top cities by orders
- Revenue total (sum of `totalAmount` in range)
