# DialDrill Scripts - Commands Reference

## For Google Sheets Copy-Paste

### User Commands (NPM Scripts)

| Command | Description | Usage |
|---------|-------------|-------|
| `npm run backup` | Create database backup | Before risky operations |
| `npm run backup-db` | Create database backup (alias) | Same as above |
| `npm run restore` | Restore from backup | After failed operations |
| `npm run restore-db` | Restore from backup (alias) | Same as above |
| `npm run list-backups` | List all backups | Check available backups |
| `npm run cleanup-backups` | Clean old backups (30 days) | Maintenance |
| `npm run cleanup-backups 7` | Clean backups older than 7 days | Custom retention |
| `npm run db:reset` | Reset dev data | Clear test data |
| `npm run migrate` | Run migrations | Database schema updates |
| `npm run verify-build` | Verify build | Before committing |
| `npm run health-check` | Health check | System status |
| `npm run smoke-test` | Smoke test | Quick validation |
| `npm run dev` | Start dev server | Development |
| `npm run build` | Build production | Production build |
| `npm run start` | Start production | Run production server |

### Agent Commands (Direct Script Execution)

| Command | Description | Usage |
|---------|-------------|-------|
| `bash scripts/backup-db.sh` | Create database backup | Direct script execution |
| `bash scripts/restore-db.sh` | Restore from backup | Direct script execution |
| `bash scripts/list-backups.sh` | List all backups | Direct script execution |
| `bash scripts/cleanup-backups.sh` | Clean old backups | Direct script execution |
| `bash scripts/reset-dev-data.sh` | Reset dev data | Direct script execution |
| `bash scripts/run-migrations.sh` | Run migrations | Direct script execution |
| `bash scripts/verify-build.sh` | Verify build | Direct script execution |
| `bash scripts/health-check.sh` | Health check | Direct script execution |
| `bash scripts/smoke-test.sh` | Smoke test | Direct script execution |
| `bash scripts/dev-start.sh` | Dev startup | Direct script execution |
| `bash scripts/setup-hooks.sh` | Setup git hooks | Direct script execution |

### Agent Commands (Testing/Verification)

| Command | Description | Usage |
|---------|-------------|-------|
| `bash -n scripts/backup-db.sh` | Syntax check backup script | Verify script syntax |
| `bash -n scripts/restore-db.sh` | Syntax check restore script | Verify script syntax |
| `bash -n scripts/list-backups.sh` | Syntax check list script | Verify script syntax |
| `bash -n scripts/cleanup-backups.sh` | Syntax check cleanup script | Verify script syntax |
| `chmod +x scripts/*.sh` | Make scripts executable | Set permissions |
| `ls -la scripts/*.sh` | List all scripts | Check script files |

### Common Workflows

| Workflow | Commands |
|---------|----------|
| Before Migration | `npm run backup` → `npm run migrate` |
| After Failed Migration | `npm run restore` |
| Before Reset | `npm run backup` → `npm run db:reset` |
| Regular Maintenance | `npm run list-backups` → `npm run cleanup-backups` |
| Pre-Commit | `npm run verify-build` |
| Dev Setup | `npm run health-check` → `npm run dev` |


