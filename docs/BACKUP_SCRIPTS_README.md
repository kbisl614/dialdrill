# Database Backup & Restore Scripts

Utility scripts for backing up and restoring your DialDrill database.

## Available Scripts

### Backup Database
```bash
npm run backup
# or
npm run backup-db
```

Creates a JSON backup of all database tables. Backups are stored in the `backups/` directory with timestamps.

**Features:**
- Exports all tables to JSON format
- Includes table metadata (row counts, timestamps)
- Safety check for production environments
- Shows backup file size and statistics

### Restore Database
```bash
npm run restore
# or
npm run restore-db
```

Restores the database from a backup file. You'll be prompted to select which backup to restore.

**Features:**
- Interactive backup selection (by number or filename)
- Transaction-based restore (rolls back on error)
- Preserves data integrity
- Shows restore progress and statistics

### List Backups
```bash
npm run list-backups
```

Lists all available backup files with details:
- File size
- Creation date
- Number of tables
- Total row count

### Cleanup Old Backups
```bash
npm run cleanup-backups [days]
# Default: keeps last 30 days
npm run cleanup-backups 7  # Keep only last 7 days
```

Removes backup files older than the specified number of days.

## Usage Examples

### Before Running Migrations
```bash
# 1. Create a backup
npm run backup

# 2. Run your migration
npm run migrate

# 3. If something goes wrong, restore
npm run restore
```

### Before Resetting Dev Data
```bash
# 1. Backup current state
npm run backup

# 2. Reset data
npm run db:reset

# 3. If you need to restore
npm run restore
```

### Regular Maintenance
```bash
# List all backups
npm run list-backups

# Clean up backups older than 30 days
npm run cleanup-backups

# Clean up backups older than 7 days
npm run cleanup-backups 7
```

## Backup File Format

Backups are stored as JSON files with the following structure:

```json
{
  "timestamp": "2024-12-20T10:30:00.000Z",
  "tables": {
    "users": {
      "count": 5,
      "data": [...]
    },
    "call_logs": {
      "count": 10,
      "data": [...]
    }
  }
}
```

## Safety Features

- **Production warnings**: Scripts warn before running against production databases
- **Confirmation prompts**: Destructive operations require explicit confirmation
- **Transaction safety**: Restore operations use database transactions
- **Error handling**: Scripts exit gracefully on errors

## File Locations

- **Backup files**: `backups/dialdrill_backup_YYYYMMDD_HHMMSS.json`
- **Scripts**: `scripts/backup-db.sh`, `scripts/restore-db.sh`, etc.

## Notes

- Backups are stored locally in the `backups/` directory
- The `backups/` directory is gitignored (don't commit backups)
- Backup files can be large depending on your data size
- Restore operations will overwrite existing data
- Always test restore operations in development first


