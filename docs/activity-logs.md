# Activity Logs

The API records every HTTP request in the `activity_logs` database table via middleware.

- Redacts sensitive fields (password, tokens, secrets)
- Captures method, path, route, status, latency, IP, user-agent, referer
- Persists query, params, and body with size limits
- Writes are best-effort and non-blocking

## Endpoint

- Route: `/api/activity/logs` (GET)
- Auth: Admin only (JWT bearer)

### Filters
- `userId`: string
- `method`: GET|POST|PUT|PATCH|DELETE
- `statusCode`: integer
- `path`: substring match
- `ip`: substring match
- `startDate`, `endDate`: ISO date-time
- `minDurationMs`, `maxDurationMs`: integers
- `page`, `limit`: pagination (limit <= 100)

### Example
```bash
curl -G 'http://localhost:3000/api/activity/logs' \
  -H 'Authorization: Bearer <admin-token>' \
  --data-urlencode 'method=GET' \
  --data-urlencode 'statusCode=200' \
  --data-urlencode 'path=/api/orders' \
  --data-urlencode 'page=1' \
  --data-urlencode 'limit=20'
```

### Response
```json
{
  "success": true,
  "message": "Activity logs retrieved successfully",
  "data": [
    {
      "id": "log_123",
      "userId": "user_1",
      "userEmail": "user@example.com",
      "method": "GET",
      "path": "/api/orders",
      "route": "/orders",
      "statusCode": 200,
      "durationMs": 42,
      "ip": "127.0.0.1",
      "userAgent": "Mozilla/5.0",
      "referer": null,
      "query": {},
      "params": {},
      "body": null,
      "createdAt": "2025-09-19T12:00:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 1, "pages": 1 }
}
```

## Schema

Key fields in `prisma/schema.prisma` under `ActivityLog`.
