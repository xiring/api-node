# Health and Readiness Probes

## Endpoints
- Liveness: `GET /api/health`
  - Returns 200 OK when the HTTP server is responsive
  - Payload: `{ status, message, timestamp, version }`

- Readiness: `GET /api/ready`
  - Checks critical dependencies and returns overall status
  - Status codes:
    - 200 OK: All checks pass (ready)
    - 503 Service Unavailable: One or more checks failed (degraded)
  - Payload: `{ status: 'ready'|'degraded', checks: { db, redis, queue, email }, timestamp }`

## What is checked
- db: Prisma connectivity via `SELECT 1`
- redis: `PING` via ioredis healthCheck
- queue: Bull queues status via `QueueService.healthCheck()`
- email: `EmailService.healthCheck()` transporter verify

## Notes
- Kubernetes: map `/api/health` to livenessProbe, `/api/ready` to readinessProbe
- Degraded status should trigger traffic removal until checks pass
