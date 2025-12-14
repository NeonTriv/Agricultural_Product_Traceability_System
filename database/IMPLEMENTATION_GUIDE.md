# Hướng dẫn triển khai Database

Database truy xuất nguồn gốc nông sản.

---

## Cách deploy

Mở PowerShell hoặc CMD, cd vào thư mục database rồi chạy:

```powershell
sqlcmd -S localhost -E -i "C:\Users\Admin\Documents\DB-repo\database\Master_Deploy.sql"
```

Hoặc nếu đang ở thư mục `database`:

```powershell
sqlcmd -S localhost -E -i Master_Deploy.sql
```

Script sẽ tự chạy lần lượt:
1. Tạo schema (tables)
2. Insert master data  
3. Tạo indexes
4. Setup backup jobs

**Lưu ý:** Check SQL Server Agent đang chạy để backup tự động hoạt động.

### Đổi path

Mở file `Master_Deploy.sql`, sửa dòng:

```sql
:setvar Path "C:\Users\Admin\Documents\DB-repo\database"
```

---

## File nào làm gì

| File | Việc |
|------|------|
| `BTL_LEADER_SCHEMA.sql` | Tạo tables |
| `INSERT_MASTER_DATA.sql` | Data mẫu |
| `indexes/create_indexes_LEADER_SCHEMA.sql` | Indexes |
| `backup-recovery/Setup_Automated_Backup.sql` | Backup jobs |

Chạy lại bao nhiêu lần cũng được, script tự check.

---

## Indexes

Có 12 indexes cho các query hay dùng:
- `idx_batch_qr_code_url` - scan QR (quan trọng nhất)
- `idx_batch_farm` - trace theo farm
- `idx_processing_batch` - lịch sử chế biến
- `idx_shipment_from_vendor`, `idx_shipment_to_vendor` - tracking

Check index có được dùng không:

```sql
SELECT OBJECT_NAME(s.object_id) AS Tbl, i.name AS Idx, s.user_seeks
FROM sys.dm_db_index_usage_stats s
JOIN sys.indexes i ON s.object_id = i.object_id AND s.index_id = i.index_id
WHERE database_id = DB_ID('Traceability') AND i.name LIKE 'idx_%'
ORDER BY s.user_seeks DESC;
```

---

## Backup

Sau khi deploy, hệ thống tự backup:

| Loại | Lịch | Giữ |
|------|------|-----|
| Full | 00:00 mỗi ngày | 30 ngày |
| Diff | 6h một lần | 7 ngày |
| Log | 15 phút | 3 ngày |

Backup lưu ở `D:\Backup\`

Check backup gần đây:

```sql
SELECT TOP 5 type, backup_finish_date, backup_size/1024/1024 AS MB
FROM msdb.dbo.backupset
WHERE database_name = 'Traceability'
ORDER BY backup_finish_date DESC;
```

---

## Recovery

Recovery phải làm tay vì cần người quyết định restore về lúc nào.

### Server crash

```sql
-- Crash lúc 14:35, restore về gần nhất

-- Full backup 00:00
RESTORE DATABASE Traceability
FROM DISK = 'D:\Backup\Traceability_FULL_20251214_000000.bak'
WITH NORECOVERY, REPLACE;

-- Diff 12:00
RESTORE DATABASE Traceability
FROM DISK = 'D:\Backup\Traceability_DIFF_20251214_120000.bak'
WITH NORECOVERY;

-- Log files từ 12:00 đến 14:30
RESTORE LOG Traceability FROM DISK = 'D:\Backup\Traceability_LOG_20251214_121500.trn' WITH NORECOVERY;
RESTORE LOG Traceability FROM DISK = 'D:\Backup\Traceability_LOG_20251214_143000.trn' WITH RECOVERY;

ALTER DATABASE Traceability SET MULTI_USER;
```

### Xóa nhầm data

```sql
-- Xóa nhầm lúc 14:25, muốn quay về 14:24

USE master;
ALTER DATABASE Traceability SET SINGLE_USER WITH ROLLBACK IMMEDIATE;

RESTORE DATABASE Traceability
FROM DISK = 'D:\Backup\Traceability_FULL_20251214_000000.bak'
WITH NORECOVERY, REPLACE;

RESTORE DATABASE Traceability
FROM DISK = 'D:\Backup\Traceability_DIFF_20251214_120000.bak'
WITH NORECOVERY;

RESTORE LOG Traceability
FROM DISK = 'D:\Backup\Traceability_LOG_20251214_143000.trn'
WITH STOPAT = '2025-12-14 14:24:00', RECOVERY;

ALTER DATABASE Traceability SET MULTI_USER;
```

### Test restore

```sql
-- Restore vào db test để check backup ok không
RESTORE DATABASE Traceability_Test
FROM DISK = 'D:\Backup\Traceability_FULL_20251214_000000.bak'
WITH MOVE 'Traceability' TO 'D:\Data\Traceability_Test.mdf',
     MOVE 'Traceability_log' TO 'D:\Data\Traceability_Test_log.ldf',
     RECOVERY;
```

---

## Lỗi hay gặp

**SQL Server Agent không chạy**
- Right-click SQL Server Agent > Start

**Log backup lỗi**
```sql
ALTER DATABASE Traceability SET RECOVERY FULL;
BACKUP DATABASE Traceability TO DISK = 'D:\Backup\init.bak' WITH COMPRESSION;
```

**Restore lỗi "database in use"**
```sql
USE master;
ALTER DATABASE Traceability SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
-- restore...
ALTER DATABASE Traceability SET MULTI_USER;
```

**Lỗi :setvar khi chạy Master_Deploy**
- Chưa bật SQLCMD Mode. Vào Query > SQLCMD Mode

---

## Tổng kết

RPO: 15 phút (mất max 15 phút data)
RTO: ~30 phút restore
