# API Error Contract

## Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* payload */ }
}
```

## Error Response
```json
{
  "success": false,
  "message": "Detailed error message",
  "error": {
    "statusCode": 400,
    "message": "Validation error",
    "details": { /* optional, schema-specific */ }
  }
}
```

## Common Status Codes
- 400: Validation/Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict
- 422: Unprocessable Entity
- 500: Internal Server Error
- 503: Service Unavailable

## Validation Errors (Joi)
- `error.details` contains field-level messages

Example:
```json
{
  "success": false,
  "message": "Validation error",
  "error": {
    "statusCode": 400,
    "message": "Validation error",
    "details": {
      "email": "Email must be a valid email",
      "password": "Password must meet complexity requirements"
    }
  }
}
```

## Retryability
- 4xx: Do not retry unless the request is corrected
- 429: Backoff and retry after window
- 5xx: Retry with exponential backoff (idempotent endpoints only)

## Error Mapping
- Auth: 401 (invalid credentials/token), 403 (role/permission)
- Resource: 404 (missing), 409 (duplicate)
- Validation: 400 with `details`
- Rate limiting: 429 (if exposed) or 400 with message
