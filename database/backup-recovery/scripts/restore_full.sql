-- ============================================================================
-- RESTORE FULL BACKUP SCRIPT - TRACEABILITY DATABASE
-- ============================================================================
-- Purpose: Restore database from a full backup file
-- Usage: sqlcmd -S localhost -E -i restore_full.sql -v BackupFile="path\to\backup.bak"
-- ============================================================================

USE master;
GO

-- IMPORTANT: Update this path to your backup file location
DECLARE @BackupFile NVARCHAR(500) = N'C:\Backup\Traceability_FULL_LATEST.bak';
DECLARE @DatabaseName NVARCHAR(100) = 'Traceability';
DECLARE @DataPath NVARCHAR(500) = N'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\';
DECLARE @LogPath NVARCHAR(500) = N'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\';

-- Print restore information
PRINT '========================================';
PRINT 'DATABASE RESTORE FROM FULL BACKUP';
PRINT '========================================';
PRINT 'Database: ' + @DatabaseName;
PRINT 'Backup File: ' + @BackupFile;
PRINT 'Start Time: ' + CONVERT(NVARCHAR(50), GETDATE(), 120);
PRINT '========================================';
PRINT '';

-- Check if backup file exists and show backup info
RESTORE HEADERONLY FROM DISK = @BackupFile;

PRINT '';
PRINT 'Backup file verified successfully!';
PRINT '';

-- Kill all connections to the database
DECLARE @SQL NVARCHAR(MAX);
SET @SQL = N'ALTER DATABASE [' + @DatabaseName + '] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;';

PRINT 'Disconnecting all users from database...';
BEGIN TRY
    EXEC sp_executesql @SQL;
    PRINT '✓ All connections closed';
END TRY
BEGIN CATCH
    PRINT 'No existing database or already in single user mode';
END CATCH

PRINT '';
PRINT 'Starting restore process...';
PRINT '';

-- Restore database
RESTORE DATABASE @DatabaseName
FROM DISK = @BackupFile
WITH
    FILE = 1,                   -- First backup set in file
    MOVE @DatabaseName TO @DataPath + @DatabaseName + '.mdf',
    MOVE @DatabaseName + '_log' TO @LogPath + @DatabaseName + '_log.ldf',
    REPLACE,                    -- Overwrite existing database
    STATS = 10,                 -- Show progress every 10%
    RECOVERY;                   -- Database ready for use after restore

-- Set database to multi-user mode
SET @SQL = N'ALTER DATABASE [' + @DatabaseName + '] SET MULTI_USER;';
EXEC sp_executesql @SQL;

PRINT '';
PRINT '========================================';
PRINT 'RESTORE COMPLETED SUCCESSFULLY!';
PRINT 'End Time: ' + CONVERT(NVARCHAR(50), GETDATE(), 120);
PRINT 'Database is now online and ready to use';
PRINT '========================================';

-- Verify database integrity
PRINT '';
PRINT 'Running database integrity check...';
DBCC CHECKDB(@DatabaseName) WITH NO_INFOMSGS;
PRINT '✓ Database integrity verified!';
PRINT '';

GO
