# Test Strategy

## Types
- Unit: services, utilities
- Integration: routes/controllers with in-memory/mocked external deps
- E2E (optional): full stack with seeded DB and Redis

## Coverage Goals
- Critical services: >= 80%
- Routes: happy paths + error paths

## Fixtures & Helpers
- `src/tests/utils/testHelpers.js` for user/vendor/fare/order creation
- `src/tests/setupTestDb.js` to create/reset test DB
- In-memory CacheService mocks in `src/tests/setup.js`

## Mocking Patterns
- QueueService mocked in route tests to avoid Redis
- External services (email) mocked/stubbed

## CI
- Run `npm run test:setup` then `npm test`
- Use `--runInBand` for DB tests to avoid conflicts
