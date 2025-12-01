-- ============================================================================
-- DIFFERENTIAL BACKUP SCRIPT - TRACEABILITY DATABASE
-- ============================================================================
-- Purpose: Create a differential backup (only changes since last full backup)
-- Usage: sqlcmd -S localhost -E -i differential_backup.sql
-- Note: Requires a full backup to exist first
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
SET @BackupFileName = @BackupPath + @DatabaseName + '_DIFF_' + @Timestamp + '.bak';

-- Print backup information
PRINT '========================================';
PRINT 'DIFFERENTIAL DATABASE BACKUP';
PRINT '========================================';
PRINT 'Database: ' + @DatabaseName;
PRINT 'Backup File: ' + @BackupFileName;
PRINT 'Start Time: ' + CONVERT(NVARCHAR(50), GETDATE(), 120);
PRINT '========================================';
PRINT '';

-- Perform differential backup
DECLARE @BackupName NVARCHAR(200) = @DatabaseName + ' Differential Backup';
DECLARE @BackupDesc NVARCHAR(300) = 'Differential backup created on ' + CONVERT(NVARCHAR(50), GETDATE(), 120);

BACKUP DATABASE @DatabaseName
TO DISK = @BackupFileName
WITH
    DIFFERENTIAL,               -- Differential backup
    FORMAT,
    COMPRESSION,
    STATS = 10,
    CHECKSUM,
    NAME = @BackupName,
    DESCRIPTION = @BackupDesc;

-- Print completion message
PRINT '';
PRINT '========================================';
PRINT 'DIFFERENTIAL BACKUP COMPLETED!';
PRINT 'End Time: ' + CONVERT(NVARCHAR(50), GETDATE(), 120);
PRINT 'Backup Location: ' + @BackupFileName;
PRINT '========================================';

-- Verify backup
RESTORE VERIFYONLY FROM DISK = @BackupFileName;

PRINT '';
PRINT '✓ Differential backup verification completed!';
PRINT '';

GO
