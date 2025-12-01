-- ============================================================================
-- TRANSACTION LOG BACKUP SCRIPT - TRACEABILITY DATABASE
-- ============================================================================
-- Purpose: Backup transaction log for point-in-time recovery
-- Usage: sqlcmd -S localhost -E -i transaction_log_backup.sql
-- Note: Database must be in FULL recovery model
-- ============================================================================

USE master;
GO

DECLARE @BackupPath NVARCHAR(500);
DECLARE @BackupFileName NVARCHAR(500);
DECLARE @DatabaseName NVARCHAR(100) = 'Traceability';
DECLARE @Timestamp NVARCHAR(50);

-- Generate timestamp
SET @Timestamp = CONVERT(NVARCHAR(50), GETDATE(), 112) + '_' +
                 REPLACE(CONVERT(NVARCHAR(50), GETDATE(), 108), ':', '');

-- Set backup path
SET @BackupPath = N'C:\Backup\';

-- Create backup filename
SET @BackupFileName = @BackupPath + @DatabaseName + '_LOG_' + @Timestamp + '.trn';

-- Check recovery model
DECLARE @RecoveryModel NVARCHAR(60);
SELECT @RecoveryModel = recovery_model_desc
FROM sys.databases
WHERE name = @DatabaseName;

IF @RecoveryModel != 'FULL'
BEGIN
    PRINT '========================================';
    PRINT 'WARNING: Database is not in FULL recovery model';
    PRINT 'Current model: ' + @RecoveryModel;
    PRINT 'Changing to FULL recovery model...';
    PRINT '========================================';

    DECLARE @SQL NVARCHAR(MAX);
    SET @SQL = 'ALTER DATABASE [' + @DatabaseName + '] SET RECOVERY FULL;';
    EXEC sp_executesql @SQL;

    PRINT '✓ Recovery model changed to FULL';
    PRINT '';
END

-- Print backup information
PRINT '========================================';
PRINT 'TRANSACTION LOG BACKUP';
PRINT '========================================';
PRINT 'Database: ' + @DatabaseName;
PRINT 'Backup File: ' + @BackupFileName;
PRINT 'Start Time: ' + CONVERT(NVARCHAR(50), GETDATE(), 120);
PRINT '========================================';
PRINT '';

-- Perform transaction log backup
DECLARE @BackupName NVARCHAR(200) = @DatabaseName + ' Transaction Log Backup';
DECLARE @BackupDesc NVARCHAR(300) = 'Transaction log backup created on ' + CONVERT(NVARCHAR(50), GETDATE(), 120);

BACKUP LOG @DatabaseName
TO DISK = @BackupFileName
WITH
    FORMAT,
    COMPRESSION,
    STATS = 10,
    CHECKSUM,
    NAME = @BackupName,
    DESCRIPTION = @BackupDesc;

-- Print completion message
PRINT '';
PRINT '========================================';
PRINT 'LOG BACKUP COMPLETED!';
PRINT 'End Time: ' + CONVERT(NVARCHAR(50), GETDATE(), 120);
PRINT 'Backup Location: ' + @BackupFileName;
PRINT '========================================';

-- Verify backup
RESTORE VERIFYONLY FROM DISK = @BackupFileName;

PRINT '';
PRINT '✓ Transaction log backup verification completed!';
PRINT '';

GO
