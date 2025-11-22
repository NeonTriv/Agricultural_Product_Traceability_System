# Database Backup & Recovery

Automated backup and recovery system for Traceability Database.

---

## Quick Commands

### Backup Now (Manual)

```bash
cd database\backup-recovery\scripts
sqlcmd -S localhost -E -i manual_backup.sql
```

**Output**: `C:\Backup\Traceability_DB_FULL_YYYYMMDD_HHMMSS.bak`

### Setup Automated Daily Backup

```powershell
# Run as Administrator
cd database\backup-recovery\scripts
powershell -ExecutionPolicy Bypass -File schedule_backup.ps1
```

**Schedule**: Daily at 2:00 AM

### Restore from Backup

```bash
# 1. Edit restore_full.sql and update backup file path
# 2. Run restore
sqlcmd -S localhost -E -i restore_full.sql
```

---

## Files Overview

### Scripts (`scripts/`)

| File | Purpose |
|------|---------|
| `manual_backup.sql` | Create full backup manually |
| `differential_backup.sql` | Create differential backup |
| `transaction_log_backup.sql` | Backup transaction log |
| `restore_full.sql` | Restore from full backup |
| `restore_point_in_time.sql` | Restore to specific time |
| `automated_backup.bat` | Windows batch script for automation |
| `schedule_backup.ps1` | Create Windows scheduled task |

### Documentation

- **[BACKUP_RECOVERY_GUIDE.md](BACKUP_RECOVERY_GUIDE.md)** - Complete guide

---

## Backup Types

| Type | When | File Size | Recovery |
|------|------|-----------|----------|
| **Full** | Daily | ~500KB | Complete database |
| **Differential** | As needed | Smaller | Since last full |
| **Transaction Log** | Hourly (optional) | Small | Point-in-time |

---

## Backup Strategy

- ✅ Full backup: **Daily at 2 AM**
- ✅ Retention: **30 days**
- ✅ Compression: **Enabled**
- ✅ Verification: **Automatic**
- ✅ Location: **C:\Backup\**

---

## Testing

Backup has been tested successfully:
- ✅ Full backup created: `572KB`
- ✅ Verification passed
- ✅ Database: `Traceability_DB`

---

## Support

See [BACKUP_RECOVERY_GUIDE.md](BACKUP_RECOVERY_GUIDE.md) for:
- Detailed procedures
- Point-in-time recovery
- Troubleshooting
- Best practices
