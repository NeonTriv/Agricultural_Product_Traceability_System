# Database Backup & Recovery Guide

Complete guide for backing up and restoring the Traceability Database.

---

## Table of Contents

1. [Overview](#overview)
2. [Backup Types](#backup-types)
3. [Quick Start](#quick-start)
4. [Manual Backup](#manual-backup)
5. [Automated Backup](#automated-backup)
6. [Recovery Procedures](#recovery-procedures)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Overview

### Backup Strategy

- **Full Backup**: Daily at 2:00 AM (automated)
- **Differential Backup**: Optional, as needed
- **Transaction Log Backup**: For point-in-time recovery
- **Retention**: 30 days

### Storage Locations

- **Backup Files**: `C:\Backup\`
- **Log Files**: `database/backup-recovery/logs/`
- **Scripts**: `database/backup-recovery/scripts/`

---

## Backup Types

### 1. Full Backup
- Complete copy of entire database
- Base for all other backups
- **File naming**: `Traceability_DB_FULL_YYYYMMDD_HHMMSS.bak`

### 2. Differential Backup
- Only changes since last full backup
- Faster than full backup
- **File naming**: `Traceability_DB_DIFF_YYYYMMDD_HHMMSS.bak`

### 3. Transaction Log Backup
- Record of all transactions
- Enables point-in-time recovery
- **File naming**: `Traceability_DB_LOG_YYYYMMDD_HHMMSS.trn`

---

## Quick Start

### Setup Automated Backups (One-time)

```powershell
# Run as Administrator
cd database\backup-recovery\scripts
powershell -ExecutionPolicy Bypass -File schedule_backup.ps1
```

This creates a Windows Task Scheduler job that runs daily at 2:00 AM.

### Manual Backup Right Now

```bash
cd database\backup-recovery\scripts
sqlcmd -S localhost -E -i manual_backup.sql
```

---

## Manual Backup

### Full Backup

```bash
# Navigate to scripts folder
cd database\backup-recovery\scripts

# Run full backup
sqlcmd -S localhost -E -i manual_backup.sql
```

**Output**: `C:\Backup\Traceability_DB_FULL_YYYYMMDD_HHMMSS.bak`

### Differential Backup

```bash
# Requires a full backup to exist first
sqlcmd -S localhost -E -i differential_backup.sql
```

**Output**: `C:\Backup\Traceability_DB_DIFF_YYYYMMDD_HHMMSS.bak`

### Transaction Log Backup

```bash
# Database must be in FULL recovery model
sqlcmd -S localhost -E -i transaction_log_backup.sql
```

**Output**: `C:\Backup\Traceability_DB_LOG_YYYYMMDD_HHMMSS.trn`

---

## Automated Backup

### Setup Windows Task Scheduler

**Option 1: Use PowerShell Script (Recommended)**

```powershell
# Run as Administrator
cd database\backup-recovery\scripts
powershell -ExecutionPolicy Bypass -File schedule_backup.ps1
```

**Option 2: Manual Task Creation**

1. Open Task Scheduler (`taskschd.msc`)
2. Create New Task
3. **General Tab**:
   - Name: `TraceabilityDB_DailyBackup`
   - Run with highest privileges
   - Run whether user is logged on or not
4. **Triggers Tab**:
   - Daily at 2:00 AM
5. **Actions Tab**:
   - Program: `cmd.exe`
   - Arguments: `/c "path\to\automated_backup.bat"`
6. **Settings Tab**:
   - Allow task to be run on demand
   - If task fails, restart every 10 minutes

### Verify Scheduled Task

```powershell
# Check if task exists
Get-ScheduledTask -TaskName "TraceabilityDB_DailyBackup"

# Run task manually
Start-ScheduledTask -TaskName "TraceabilityDB_DailyBackup"

# View task history
Get-ScheduledTaskInfo -TaskName "TraceabilityDB_DailyBackup"
```

### Check Backup Logs

```bash
# View latest log
type database\backup-recovery\logs\backup_log_YYYYMMDD.txt
```

---

## Recovery Procedures

### Scenario 1: Restore Latest Full Backup

**When to use**: Database corrupted, need to restore to last night's backup

```sql
-- 1. Edit restore_full.sql and update backup file path
-- 2. Run restore
sqlcmd -S localhost -E -i restore_full.sql
```

**Steps**:
1. Open `scripts\restore_full.sql`
2. Update `@BackupFile` to your backup location
3. Run the script

### Scenario 2: Point-in-Time Recovery

**When to use**: Accidental data deletion, need to restore to specific time

**Requirements**:
- Full backup
- Transaction log backups

**Steps**:

1. Open `scripts\restore_point_in_time.sql`
2. Update these variables:
   ```sql
   @FullBackupFile = 'C:\Backup\Traceability_DB_FULL_20251120.bak'
   @LogBackupFile1 = 'C:\Backup\Traceability_DB_LOG_20251120_120000.trn'
   @LogBackupFile2 = 'C:\Backup\Traceability_DB_LOG_20251120_140000.trn'
   @RestoreToDateTime = '2025-11-20 14:30:00'  -- Your desired time
   ```
3. Run the script:
   ```bash
   sqlcmd -S localhost -E -i restore_point_in_time.sql
   ```

### Scenario 3: Restore to Different Server

**Steps**:

1. Copy backup file to target server
2. Update data/log file paths in restore script
3. Run restore script on target server

```sql
-- Update these paths in restore_full.sql
@DataPath = N'D:\SQLData\'
@LogPath = N'D:\SQLData\'
```

---

## Best Practices

### Before Backup

✅ **DO**:
- Verify SQL Server service is running
- Ensure sufficient disk space (at least 2x database size)
- Test backup scripts in development first
- Document backup schedule

❌ **DON'T**:
- Run backups during peak hours (unless using differential)
- Store backups on same drive as database
- Forget to test restore procedures

### During Backup

✅ **DO**:
- Monitor backup progress
- Check for errors in logs
- Verify backup file size is reasonable

### After Backup

✅ **DO**:
- Verify backup completed successfully
- Test restore procedure monthly
- Move backups to offsite storage
- Clean up old backups (30-day retention)

❌ **DON'T**:
- Assume backup worked without verification
- Keep unlimited backups (disk space!)

### Recovery Model

**FULL** (Recommended for Production):
- Enables point-in-time recovery
- Requires transaction log backups
- More storage needed

**SIMPLE** (For Development):
- No point-in-time recovery
- Automatic log cleanup
- Less storage needed

**Check current model**:
```sql
SELECT name, recovery_model_desc
FROM sys.databases
WHERE name = 'Traceability_DB';
```

**Change to FULL**:
```sql
ALTER DATABASE Traceability_DB SET RECOVERY FULL;
```

---

## Troubleshooting

### Issue: "Cannot open backup device"

**Cause**: Backup folder doesn't exist or no permissions

**Solution**:
```powershell
# Create backup folder
New-Item -Path "C:\Backup" -ItemType Directory -Force

# Grant SQL Server service account permissions
icacls "C:\Backup" /grant "NT SERVICE\MSSQLSERVER:(OI)(CI)F" /T
```

### Issue: "Database is in use" during restore

**Cause**: Active connections to database

**Solution**:
```sql
-- Kill all connections
ALTER DATABASE Traceability_DB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
-- Then run restore
-- After restore:
ALTER DATABASE Traceability_DB SET MULTI_USER;
```

### Issue: Transaction log growing too large

**Cause**: Log backups not running

**Solution**:
```bash
# Run transaction log backup
sqlcmd -S localhost -E -i transaction_log_backup.sql

# Or shrink log (NOT recommended for production)
sqlcmd -S localhost -E -d Traceability_DB -Q "DBCC SHRINKFILE (Traceability_DB_log, 1);"
```

### Issue: Backup taking too long

**Solutions**:
1. Use differential backups between full backups
2. Enable backup compression (already enabled in scripts)
3. Increase SQL Server memory allocation
4. Use faster storage (SSD)

### Issue: "Not enough disk space"

**Solution**:
```powershell
# Check disk space
Get-PSDrive C | Select-Object Used,Free

# Clean old backups
cd C:\Backup
Get-ChildItem -Filter "*.bak" | Where-Object {$_.LastWriteTime -lt (Get-Date).AddDays(-30)} | Remove-Item

# Or change backup location to larger drive
```

---

## Backup Verification

### Check Backup File

```sql
-- View backup header information
RESTORE HEADERONLY FROM DISK = 'C:\Backup\Traceability_DB_FULL_20251120.bak';

-- Verify backup integrity
RESTORE VERIFYONLY FROM DISK = 'C:\Backup\Traceability_DB_FULL_20251120.bak';
```

### List All Backups

```sql
-- Show all backups for database
SELECT
    database_name,
    backup_start_date,
    backup_finish_date,
    type,
    backup_size / 1024 / 1024 AS backup_size_mb,
    compressed_backup_size / 1024 / 1024 AS compressed_size_mb
FROM msdb.dbo.backupset
WHERE database_name = 'Traceability_DB'
ORDER BY backup_start_date DESC;
```

---

## Recovery Time Objective (RTO) & Recovery Point Objective (RPO)

### Current Configuration

- **RPO**: 24 hours (daily full backup)
- **RTO**: ~30 minutes (restore time depends on database size)

### To Improve RPO

```bash
# Add hourly transaction log backups
# Create Windows Task with hourly trigger
# Action: sqlcmd -S localhost -E -i transaction_log_backup.sql
```

With hourly log backups:
- **RPO**: 1 hour
- Enables recovery to any point within last hour

---

## Offsite Backup

### Manual Copy to Cloud

```powershell
# Example: Copy to OneDrive/Google Drive
$SourcePath = "C:\Backup"
$DestPath = "D:\OneDrive\DatabaseBackups"

Copy-Item -Path "$SourcePath\*.bak" -Destination $DestPath -Force
```

### Automated Cloud Sync

**Option 1: Azure Storage**
```powershell
# Install Azure PowerShell
Install-Module -Name Az -AllowClobber -Scope CurrentUser

# Upload to Azure Blob Storage
Connect-AzAccount
$StorageAccount = Get-AzStorageAccount -ResourceGroupName "MyRG" -Name "mystorageaccount"
Set-AzStorageBlobContent -File "C:\Backup\backup.bak" -Container "backups" -Context $StorageAccount.Context
```

**Option 2: AWS S3**
```powershell
# Install AWS PowerShell
Install-Module -Name AWS.Tools.S3

# Upload to S3
Write-S3Object -BucketName "my-backups" -File "C:\Backup\backup.bak"
```

---

## Emergency Recovery Checklist

When disaster strikes, follow this checklist:

- [ ] 1. Stay calm and assess the situation
- [ ] 2. Identify the issue (corruption, deletion, hardware failure)
- [ ] 3. Determine recovery point needed (latest backup or specific time)
- [ ] 4. Locate backup files (local or offsite)
- [ ] 5. Stop application servers (backend/frontend)
- [ ] 6. Kill all database connections
- [ ] 7. Run appropriate restore script
- [ ] 8. Verify database integrity (DBCC CHECKDB)
- [ ] 9. Test critical queries
- [ ] 10. Restart application servers
- [ ] 11. Notify stakeholders
- [ ] 12. Document incident for post-mortem

---

## Support

For questions or issues:
1. Check troubleshooting section above
2. Review backup logs in `backup-recovery/logs/`
3. Check SQL Server error log
4. Contact database administrator

---

**Last Updated**: November 2025
