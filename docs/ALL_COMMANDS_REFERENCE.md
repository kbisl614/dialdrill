# DialDrill - Complete Scripts Reference
## For Google Sheets Copy-Paste

### USER COMMANDS (Quick Aliases - What You'll Actually Use)

| Command | Description | Category |
|---------|-------------|----------|
| `npm run go` | Start dev server + auto-open Chrome | Development |
| `npm run ok` | Quick health check | Validation |
| `npm run smoke` | Test all API endpoints | Testing |
| `npm run backup` | Create database backup | Database |
| `npm run restore` | Restore from backup | Database |
| `npm run hooks` | Install git pre-commit hooks (one-time) | Setup |
| `npm run check` | Fast typecheck + lint | Validation |
| `npm run ready` | Full pre-deploy check | Validation |
| `npm run nuke` | Reset dev database | Database |
| `npm run v` | Validate recent changes | Validation |
| `npm run diff` | Show uncommitted changes | Git |
| `npm run wtf` | Show codebase context | Agent Tool |

### USER COMMANDS (Full Names)

| Command | Description | Category |
|---------|-------------|----------|
| `npm run dev` | Start Next.js dev server | Development |
| `npm run build` | Production build | Build |
| `npm run start` | Start production server | Production |
| `npm run preview` | Build + run locally | Build |
| `npm run lint` | Check for lint issues | Validation |
| `npm run lint:fix` | Auto-fix lint issues | Validation |
| `npm run typecheck` | TypeScript check only | Validation |
| `npm run test` | Run Jest tests | Testing |
| `npm run test:watch` | Tests in watch mode | Testing |
| `npm run test:coverage` | Tests with coverage | Testing |
| `npm run verify-build` | Full pre-deploy verification | Validation |
| `npm run migrate` | Run database migrations | Database |
| `npm run db:reset` | Reset dev data | Database |
| `npm run health-check` | Full health check | Validation |
| `npm run setup-hooks` | Install git hooks | Setup |
| `npm run dev-start` | Start dev environment | Development |
| `npm run smoke-test` | API smoke test | Testing |
| `npm run backup-db` | Create backup | Database |
| `npm run restore-db` | Restore backup | Database |
| `npm run list-backups` | List all backups | Database |
| `npm run cleanup-backups` | Clean old backups | Database |
| `npm run safe-migrate` | Backup → migrate → auto-restore | Database |
| `npm run backup-then-reset` | Backup → reset workflow | Database |
| `npm run validate` | Validate changes | Validation |
| `npm run changes` | Show uncommitted changes | Git |
| `npm run context` | Codebase context | Agent Tool |
| `npm run schema` | Show database schema | Database |
| `npm run trace` | Trace error/function | Debugging |

### AGENT COMMANDS (For AI Agents)

| Command | Description | When to Use |
|---------|-------------|-------------|
| `npm run context` | Get codebase overview | Starting work on codebase |
| `npm run related <name>` | Find related files | Before editing component |
| `npm run test:file <name>` | Run tests for file | After making changes |
| `npm run validate` | Validate all changes | After completing work |
| `npm run new:component <Name>` | Scaffold component | Creating new component |
| `npm run new:api <path>` | Scaffold API route | Creating new API |
| `npm run changes` | See what changed | Reviewing session changes |
| `npm run schema` | Database structure | Working with database |
| `npm run trace <term>` | Find error source | Debugging issues |
| `npm run v` | Quick validation | Quick check |

### AGENT COMMANDS (Direct Script Execution)

| Command | Description |
|---------|-------------|
| `bash scripts/context.sh` | Codebase context |
| `bash scripts/related.sh <name>` | Find related files |
| `bash scripts/test-file.sh <name>` | Run file tests |
| `bash scripts/validate.sh` | Validate changes |
| `bash scripts/new-component.sh <Name>` | Create component |
| `bash scripts/new-api.sh <path>` | Create API route |
| `bash scripts/changes.sh` | Show changes |
| `bash scripts/schema.sh` | Database schema |
| `bash scripts/trace.sh <term>` | Trace error |
| `bash scripts/health-check.sh` | Health check |
| `bash scripts/backup-db.sh` | Create backup |
| `bash scripts/restore-db.sh` | Restore backup |
| `bash scripts/list-backups.sh` | List backups |
| `bash scripts/cleanup-backups.sh` | Clean backups |
| `bash scripts/safe-migrate.sh` | Safe migration |
| `bash scripts/backup-then-reset.sh` | Backup then reset |
| `bash scripts/verify-build.sh` | Verify build |
| `bash scripts/run-migrations.sh` | Run migrations |
| `bash scripts/reset-dev-data.sh` | Reset dev data |
| `bash scripts/smoke-test.sh` | Smoke test |
| `bash scripts/setup-hooks.sh` | Setup hooks |
| `bash scripts/dev-start.sh` | Dev start |

### COMMAND ALIASES REFERENCE

| Alias | Full Command |
|-------|--------------|
| `npm run ok` | `npm run health-check` |
| `npm run go` | `npm run dev-start` |
| `npm run smoke` | `npm run smoke-test` |
| `npm run backup` | `npm run backup-db` |
| `npm run restore` | `npm run restore-db` |
| `npm run hooks` | `npm run setup-hooks` |
| `npm run nuke` | `npm run db:reset` |
| `npm run v` | `npm run validate` |
| `npm run diff` | `npm run changes` |
| `npm run wtf` | `npm run context` |

### WORKFLOW EXAMPLES

| Workflow | Commands |
|----------|----------|
| Start development | `npm run go` |
| Before committing | `npm run check` |
| Before deploying | `npm run ready` |
| Before migration | `npm run backup` → `npm run migrate` |
| Safe migration | `npm run safe-migrate` |
| Reset dev data | `npm run backup-then-reset` |
| Agent validation | `npm run validate` |
| Agent context | `npm run context` |
| Find related files | `npm run related Button` |
| Create component | `npm run new:component CallTimer` |
| Create API | `npm run new:api analytics/sessions` |


