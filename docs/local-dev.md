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

## MailHog (Dev Email)
```bash
# Start MailHog (Docker)
docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog

# Web UI
open http://localhost:8025
```
Emails sent in development are captured by MailHog using MAILHOG_HOST/MAILHOG_PORT.

## Useful Scripts
- `npm run db:generate` – Prisma client
- `npm run db:push` – Apply schema
- `npm run db:seed` – Seed sample data
- `npm run test:ci` – CI-friendly testing

## Troubleshooting
- Ensure Postgres/Redis are running
- Verify DATABASE_URL and Redis envs
- Clear cache if needed (queue endpoint or CacheService)
