# Backup & Disaster Recovery

## Backups
- Database: daily logical backups (pg_dump) retained 7–14 days
- Config: environment files stored securely (not in repo)
- Reports: not backed up; regenerated on demand

## Restore
- Validate backup integrity
- Restore to staging before production
- Run Prisma migrations if needed

## RPO/RTO
- RPO: 24 hours (with daily backups)
- RTO: 4 hours target for critical incidents

## Procedures
- Documented runbook for backup/restore
- Test restores quarterly
