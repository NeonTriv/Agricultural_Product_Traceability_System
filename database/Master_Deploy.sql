/*
    Master_Deploy.sql
    -----------------
    Script deploy database Traceability.
    Chạy trong SSMS với SQLCMD Mode bật (Query > SQLCMD Mode).
    
    Gọi lần lượt:
      1. Schema (tables)
      2. Master data
      3. Indexes
      4. Backup jobs
    
    Chạy lại nhiều lần không sao, script tự check trước khi tạo.
*/

SET NOCOUNT ON;
GO

-- Config - sửa path nếu cần
:setvar Path "C:\Users\Admin\Documents\DB-repo\database"
:setvar DatabaseName "Traceability"

PRINT '';
PRINT 'Deploy $(DatabaseName)';
PRINT 'Time: ' + CONVERT(VARCHAR, GETDATE(), 120);
PRINT '----------------------------------------';
GO

-- 1. Schema (file schema sẽ tự tạo DB)
PRINT '';
PRINT '[1/4] Chay BTL_LEADER_SCHEMA.sql...';
GO
:r $(Path)\BTL_LEADER_SCHEMA.sql
GO

-- 2. Data
PRINT '';
PRINT '[2/4] Chay INSERT_MASTER_DATA.sql...';
GO
:r $(Path)\INSERT_MASTER_DATA.sql
GO

-- 3. Indexes
PRINT '';
PRINT '[3/4] Chay create_indexes_LEADER_SCHEMA.sql...';
GO
:r $(Path)\indexes\create_indexes_LEADER_SCHEMA.sql
GO

-- 4. Backup
PRINT '';
PRINT '[4/4] Chay Setup_Automated_Backup.sql...';
GO
:r $(Path)\backup-recovery\Setup_Automated_Backup.sql
GO

-- Done
PRINT '';
PRINT '----------------------------------------';
PRINT 'Xong! Kiem tra SQL Server Agent dang chay.';
PRINT '----------------------------------------';
GO
