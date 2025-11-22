-- ============================================================================
-- MANUAL BACKUP SCRIPT - TRACEABILITY DATABASE
-- ============================================================================
-- Purpose: Create a full backup of Traceability_DB database
-- Usage: sqlcmd -S localhost -E -i manual_backup.sql
-- ============================================================================

USE master;
GO

DECLARE @BackupPath NVARCHAR(500);
DECLARE @BackupFileName NVARCHAR(500);
DECLARE @DatabaseName NVARCHAR(100) = 'Traceability';
DECLARE @Timestamp NVARCHAR(50);

-- Generate timestamp for backup file (YYYYMMDD_HHMMSS)
SET @Timestamp = CONVERT(NVARCHAR(50), GETDATE(), 112) + '_' +
                 REPLACE(CONVERT(NVARCHAR(50), GETDATE(), 108), ':', '');

-- Set backup path (change this to your desired location)
-- Default: C:\Backup\
SET @BackupPath = N'C:\Backup\';

-- Create backup filename
SET @BackupFileName = @BackupPath + @DatabaseName + '_FULL_' + @Timestamp + '.bak';

-- Print backup information
PRINT '========================================';
PRINT 'FULL DATABASE BACKUP';
PRINT '========================================';
PRINT 'Database: ' + @DatabaseName;
PRINT 'Backup File: ' + @BackupFileName;
PRINT 'Start Time: ' + CONVERT(NVARCHAR(50), GETDATE(), 120);
PRINT '========================================';
PRINT '';

-- Perform full backup
DECLARE @BackupName NVARCHAR(200) = @DatabaseName + ' Full Backup';
DECLARE @BackupDesc NVARCHAR(300) = 'Full backup created on ' + CONVERT(NVARCHAR(50), GETDATE(), 120);

BACKUP DATABASE @DatabaseName
TO DISK = @BackupFileName
WITH
    FORMAT,                     -- Overwrite existing backup set
    COMPRESSION,                -- Compress backup to save space
    STATS = 10,                 -- Show progress every 10%
    CHECKSUM,                   -- Verify backup integrity
    NAME = @BackupName,
    DESCRIPTION = @BackupDesc;

-- Print completion message
PRINT '';
PRINT '========================================';
PRINT 'BACKUP COMPLETED SUCCESSFULLY!';
PRINT 'End Time: ' + CONVERT(NVARCHAR(50), GETDATE(), 120);
PRINT 'Backup Location: ' + @BackupFileName;
PRINT '========================================';

-- Verify backup file
RESTORE VERIFYONLY FROM DISK = @BackupFileName;

PRINT '';
PRINT '✓ Backup verification completed successfully!';
PRINT '';

GO
