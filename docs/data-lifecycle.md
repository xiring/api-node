# Data Lifecycle

## PII Locations
- Users: name, email, password hash (bcrypt)
- Orders: recipient name, delivery address, contact numbers
- Vendors: name, email, phone, address

## Retention
- Operational data: retained indefinitely unless business policy dictates purge
- Logs: default retention 30 days (configurable)
- Reports: CSV files in `reports/` retained 7 days (recommended) with cleanup job

## Purge/Cleanup Jobs
- Logs: `/api/security/cleanup` endpoint to clean logs older than N days
- Reports: scheduled job (future) to delete files older than 7 days
- Cache: on-demand invalidation and periodic clear-all if needed

## Audit Trails
- SecurityLogger for auth events, refresh rotations, suspicious activity
- Access logs via morgan
- Future: DB-level audit (before/after) for critical changes

## Data Protection
- Passwords hashed with bcrypt
- JWT signed with HS256, expiry configurable
- Refresh tokens stored only server-side (Redis) with TTL and rotation
