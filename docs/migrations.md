# Database Migrations (Laravel-like)

This project uses Prisma Migrate with npm scripts mirroring Laravel’s workflow.

## Commands

```bash
# Generate Prisma client
npm run db:generate

# Create a migration from schema changes (dev)
npx prisma migrate dev --name your_change

# Run dev migrations
npm run db:migrate

# Deploy migrations (prod/CI)
npm run db:deploy

# Reset database and auto-seed (DANGER: DROPS DATA)
npm run db:reset

# Show migration status
npm run db:status
```

## Seeding
- The Prisma seed hook runs `node src/seed.js`.
- You can run it manually: `npm run db:seed`.

## Initial Baseline
- The initial migration was created and baselined against an existing database.
- For existing environments, use `prisma migrate resolve --applied <migration_folder>` to baseline.

## Tips
- Prefer migrations over `prisma db push` for all shared environments.
- Keep schema changes small; name migrations descriptively.
- Review SQL in `prisma/migrations/*/migration.sql` before deploying.
