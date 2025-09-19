# Performance & SLOs

## Targets
- p95 latency: < 300ms for cached GETs, < 500ms for other GETs, < 800ms for POST/PUT
- Throughput: sized by infra; scale horizontally if p95 exceeds targets
- Max payload: JSON body limit 10MB (configured)
- Pagination caps: default limit 10, max 100

## Rate Limits
- General: 100 requests / 15 minutes per IP (configurable)
- Auth endpoints: stricter limit (5 / 15 minutes)
- Slow down: 500ms per request above threshold up to 20s

## Guidance
- Use pagination for list endpoints
- Avoid N+1 queries; prefer Prisma includes
- Use Redis caching for hot paths
- Stream large exports via queue
