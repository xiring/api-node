# Local Development Guide

## Prerequisites
- Node.js >= 16
- PostgreSQL >= 12
- Redis >= 6

## Setup
```bash
cp env.example .env
npm install
npm run db:generate
npm run db:push
npm run db:seed
```

## Running
```bash
# API
npm run dev

# Test DB setup + tests
npm run test:setup
npm run test
```

## Useful Scripts
- `npm run db:generate` – Prisma client
- `npm run db:push` – Apply schema
- `npm run db:seed` – Seed sample data
- `npm run test:ci` – CI-friendly testing

## Troubleshooting
- Ensure Postgres/Redis are running
- Verify DATABASE_URL and Redis envs
- Clear cache if needed (queue endpoint or CacheService)
