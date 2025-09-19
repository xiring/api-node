# API Versioning & Deprecation

## Versioning Strategy
- URL-based versioning recommended (e.g., /api/v1)
- Backward-compatible changes allowed within minor increments

## Breaking Changes
- Batched into new major versions
- Provide migration guide and timelines

## Deprecation Policy
- Mark endpoints as deprecated in Swagger with `deprecated: true`
- Provide alternative endpoints
- Deprecation window: 60–90 days (configurable)

## Changelog
- Maintain CHANGELOG.md with categories: Added, Changed, Deprecated, Fixed, Removed
- Reference PRs/issues

## Client Communication
- Announce deprecations and releases
- Provide SDKs/examples for new flows when applicable
