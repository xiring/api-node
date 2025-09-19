# Release & Environments

## Environments
- Local: developers; .env
- Test/CI: ephemeral DB/Redis; seeded data
- Staging: near-prod; manual QA
- Production: monitored and scaled

## CI/CD Flow (high level)
- Lint + tests
- Build artifact
- Migrate DB (prisma migrate deploy)
- Deploy API
- Smoke tests

## Promotion Checklist
- All tests green
- Migrated DB on target env
- Feature flags/configs set
- Rollback plan prepared

## Config Matrix (examples)
- JWT secrets, DB URLs, Redis endpoints per env
- Rate limits: may be stricter in prod
- Log levels: debug (dev), info/warn (staging), warn/error (prod)
