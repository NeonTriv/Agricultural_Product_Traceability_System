# Database Backup & Recovery

Automated backup and recovery system for Traceability Database.

---

## Quick Start

### 1. Manual Backup
```bash
cd database\backup-recovery\scripts
sqlcmd -S localhost -E -i manual_backup.sql
```
Output: `C:\Backup\Traceability_FULL.bak`

### 2. Setup Automated Backup
```powershell
# Run as Administrator
cd database\backup-recovery\scripts
powershell -ExecutionPolicy Bypass -File schedule_backup.ps1
```
Schedule: Daily at 2:00 AM

### 3. Restore Database
```bash
# Edit restore_full.sql to update backup file path, then run:
sqlcmd -S localhost -E -i restore_full.sql
```

---

## Test Cases

### Test Case 1: Full Backup & Restore
```bash
sqlcmd -S localhost -E -i testcase1_full_backup_restore.sql
```

### Test Case 2: Point-in-Time Recovery
```bash
sqlcmd -S localhost -E -i testcase2_point_in_time_recovery.sql
```

### Test Case 3: Tail-Log Recovery
```bash
sqlcmd -S localhost -E -i testcase3_taillog_recovery.sql
```

---

## Scripts

| File | Purpose |
|------|---------|
| `manual_backup.sql` | Full backup |
| `differential_backup.sql` | Differential backup |
| `transaction_log_backup.sql` | Transaction log backup |
| `restore_full.sql` | Full restore |
| `restore_point_in_time.sql` | Point-in-Time restore |
| `testcase1_full_backup_restore.sql` | Test full backup/restore |
| `testcase2_point_in_time_recovery.sql` | Test PITR |
| `testcase3_taillog_recovery.sql` | Test tail-log recovery |

---

## Backup Strategy

- Full backup: **Daily at 2 AM**
- Retention: **30 days**
- Compression: **Enabled**
- Location: **C:\Backup\**

---

For detailed documentation, see `BACKUP_RECOVERY_GUIDE.md`
