-- ============================================================================
-- POINT-IN-TIME RESTORE SCRIPT - TRACEABILITY DATABASE
-- ============================================================================
-- Purpose: Restore database to a specific point in time
-- Usage: Modify @RestoreToDateTime and backup file paths, then execute
-- ============================================================================

USE master;
GO

-- CONFIGURATION - UPDATE THESE PATHS
DECLARE @FullBackupFile NVARCHAR(500) = N'C:\Backup\Traceability_FULL_20251120.bak';
DECLARE @DiffBackupFile NVARCHAR(500) = N'C:\Backup\Traceability_DIFF_20251120.bak'; -- Optional
DECLARE @LogBackupFile1 NVARCHAR(500) = N'C:\Backup\Traceability_LOG_20251120_120000.trn';
DECLARE @LogBackupFile2 NVARCHAR(500) = N'C:\Backup\Traceability_LOG_20251120_140000.trn';

DECLARE @DatabaseName NVARCHAR(100) = 'Traceability';
DECLARE @RestoreToDateTime DATETIME = '2025-11-20 14:30:00'; -- CHANGE THIS TO YOUR DESIRED TIME

DECLARE @DataPath NVARCHAR(500) = N'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\';
DECLARE @LogPath NVARCHAR(500) = N'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\';

-- Print restore information
PRINT '========================================';
PRINT 'POINT-IN-TIME RESTORE';
PRINT '========================================';
PRINT 'Database: ' + @DatabaseName;
PRINT 'Restore to: ' + CONVERT(NVARCHAR(50), @RestoreToDateTime, 120);
PRINT 'Start Time: ' + CONVERT(NVARCHAR(50), GETDATE(), 120);
PRINT '========================================';
PRINT '';

-- Kill all connections
DECLARE @SQL NVARCHAR(MAX);
SET @SQL = N'ALTER DATABASE [' + @DatabaseName + '] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;';

PRINT 'Disconnecting all users...';
BEGIN TRY
    EXEC sp_executesql @SQL;
    PRINT '✓ All connections closed';
END TRY
BEGIN CATCH
    PRINT 'No existing database or already in single user mode';
END CATCH

PRINT '';
PRINT '========================================';
PRINT 'STEP 1: RESTORE FULL BACKUP';
PRINT '========================================';

-- Restore full backup (WITH NORECOVERY to allow log restores)
RESTORE DATABASE @DatabaseName
FROM DISK = @FullBackupFile
WITH
    FILE = 1,
    MOVE @DatabaseName TO @DataPath + @DatabaseName + '.mdf',
    MOVE @DatabaseName + '_log' TO @LogPath + @DatabaseName + '_log.ldf',
    NORECOVERY,                 -- Keep database in restoring state
    REPLACE,
    STATS = 10;

PRINT '✓ Full backup restored';
PRINT '';

-- Restore differential backup if provided
IF @DiffBackupFile IS NOT NULL AND @DiffBackupFile != ''
BEGIN
    PRINT '========================================';
    PRINT 'STEP 2: RESTORE DIFFERENTIAL BACKUP';
    PRINT '========================================';

    RESTORE DATABASE @DatabaseName
    FROM DISK = @DiffBackupFile
    WITH
        FILE = 1,
        NORECOVERY,
        STATS = 10;

    PRINT '✓ Differential backup restored';
    PRINT '';
END

-- Restore transaction log backups
IF @LogBackupFile1 IS NOT NULL AND @LogBackupFile1 != ''
BEGIN
    PRINT '========================================';
    PRINT 'STEP 3: RESTORE TRANSACTION LOG 1';
    PRINT '========================================';

    RESTORE LOG @DatabaseName
    FROM DISK = @LogBackupFile1
    WITH
        NORECOVERY,
        STATS = 10;

    PRINT '✓ Transaction log 1 restored';
    PRINT '';
END

IF @LogBackupFile2 IS NOT NULL AND @LogBackupFile2 != ''
BEGIN
    PRINT '========================================';
    PRINT 'STEP 4: RESTORE TRANSACTION LOG 2';
    PRINT '========================================';

    RESTORE LOG @DatabaseName
    FROM DISK = @LogBackupFile2
    WITH
        NORECOVERY,
        STOPAT = @RestoreToDateTime,  -- Stop at specific time
        STATS = 10;

    PRINT '✓ Transaction log 2 restored';
    PRINT '';
END

-- Recover database
PRINT '========================================';
PRINT 'STEP 5: RECOVERING DATABASE';
PRINT '========================================';

RESTORE DATABASE @DatabaseName WITH RECOVERY;

-- Set to multi-user
SET @SQL = N'ALTER DATABASE [' + @DatabaseName + '] SET MULTI_USER;';
EXEC sp_executesql @SQL;

PRINT '✓ Database recovered and online';
PRINT '';

PRINT '========================================';
PRINT 'POINT-IN-TIME RESTORE COMPLETED!';
PRINT '========================================';
PRINT 'Database restored to: ' + CONVERT(NVARCHAR(50), @RestoreToDateTime, 120);
PRINT 'End Time: ' + CONVERT(NVARCHAR(50), GETDATE(), 120);
PRINT '========================================';
PRINT '';

-- Verify database
DBCC CHECKDB(@DatabaseName) WITH NO_INFOMSGS;
PRINT '✓ Database integrity verified!';

GO
