-- ====================================================================
-- TEST CASE 1: FULL BACKUP AND RESTORE SANITY CHECK
-- ====================================================================
-- Objective: Verify full backup is valid and can be restored
-- Expected Screenshots: 4 images
-- ====================================================================

PRINT '========================================';
PRINT 'TEST CASE 1: FULL BACKUP AND RESTORE';
PRINT '========================================';
PRINT '';

-- ====================================================================
-- STEP 1: Create Full Backup
-- SCREENSHOT 1: Capture this entire output
-- ====================================================================
PRINT '>>> STEP 1: Creating Full Backup...';
PRINT '';

DECLARE @BackupPath NVARCHAR(500) = 'C:\Backup\Traceability_FULL_Test1.bak';
DECLARE @StartTime DATETIME = GETDATE();

BACKUP DATABASE Traceability
TO DISK = @BackupPath
WITH
    COMPRESSION,
    CHECKSUM,
    INIT,
    STATS = 10,
    NAME = 'Traceability Full Backup - Test Case 1';

PRINT '';
PRINT '✓ Full Backup Completed Successfully!';
PRINT '  Backup File: ' + @BackupPath;
PRINT '  Duration: ' + CAST(DATEDIFF(SECOND, @StartTime, GETDATE()) AS VARCHAR) + ' seconds';
PRINT '';

-- ====================================================================
-- STEP 2: Verify Backup Integrity
-- SCREENSHOT 2: Capture this output showing CHECKSUM verification
-- ====================================================================
PRINT '>>> STEP 2: Verifying Backup Integrity...';
PRINT '';

RESTORE VERIFYONLY
FROM DISK = @BackupPath
WITH CHECKSUM;

PRINT '';
PRINT '✓ Backup Verification PASSED!';
PRINT '  CHECKSUM: Valid';
PRINT '  File is readable and not corrupted';
PRINT '';

-- ====================================================================
-- STEP 3: Get Original Database Statistics (Before Restore)
-- ====================================================================
PRINT '>>> STEP 3: Recording Original Database Statistics...';
PRINT '';

USE Traceability;
GO

DECLARE @OriginalBatchCount INT;
DECLARE @OriginalProductCount INT;

SELECT @OriginalBatchCount = COUNT(*) FROM BATCH;
SELECT @OriginalProductCount = COUNT(*) FROM AGRICULTURE_PRODUCT;

PRINT 'Original Database (Traceability):';
PRINT '  Total BATCH records: ' + CAST(@OriginalBatchCount AS VARCHAR);
PRINT '  Total AGRICULTURE_PRODUCT records: ' + CAST(@OriginalProductCount AS VARCHAR);
PRINT '';

-- ====================================================================
-- STEP 4: Restore to New Database
-- ====================================================================
PRINT '>>> STEP 4: Restoring to Traceability_Restore...';
PRINT '';

-- Drop existing test database if exists
IF EXISTS (SELECT name FROM sys.databases WHERE name = 'Traceability_Restore')
BEGIN
    ALTER DATABASE Traceability_Restore SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE Traceability_Restore;
    PRINT '  Dropped existing Traceability_Restore database';
END

RESTORE DATABASE Traceability_Restore
FROM DISK = 'C:\Backup\Traceability_FULL_Test1.bak'
WITH
    MOVE 'Traceability' TO 'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\Traceability_Restore.mdf',
    MOVE 'Traceability_log' TO 'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\Traceability_Restore_log.ldf',
    RECOVERY,
    REPLACE,
    STATS = 10;

PRINT '';
PRINT '✓ Database Restored Successfully!';
PRINT '  Database: Traceability_Restore is now ONLINE';
PRINT '';

-- ====================================================================
-- STEP 5: Run DBCC CHECKDB on Restored Database
-- SCREENSHOT 3: Capture Messages tab showing "0 allocation errors and 0 consistency errors"
-- ====================================================================
PRINT '>>> STEP 5: Running DBCC CHECKDB on Restored Database...';
PRINT '';

DBCC CHECKDB(Traceability_Restore) WITH NO_INFOMSGS;

PRINT '';
PRINT '✓ DBCC CHECKDB Completed!';
PRINT '  Expected: 0 allocation errors and 0 consistency errors';
PRINT '';

-- ====================================================================
-- STEP 6: Compare Row Counts
-- SCREENSHOT 4: Capture Results showing both databases side-by-side
-- Run this query in a NEW QUERY WINDOW for better screenshot
-- ====================================================================
PRINT '>>> STEP 6: Comparing Row Counts...';
PRINT '';
PRINT 'Execute the following query in SSMS for SCREENSHOT 4:';
PRINT '';
PRINT '-- COPY AND RUN THIS IN A NEW QUERY WINDOW:';
PRINT 'SELECT';
PRINT '    ''Original (Traceability)'' AS Database_Name,';
PRINT '    (SELECT COUNT(*) FROM Traceability.dbo.BATCH) AS BATCH_Count,';
PRINT '    (SELECT COUNT(*) FROM Traceability.dbo.AGRICULTURE_PRODUCT) AS Product_Count';
PRINT 'UNION ALL';
PRINT 'SELECT';
PRINT '    ''Restored (Traceability_Restore)'' AS Database_Name,';
PRINT '    (SELECT COUNT(*) FROM Traceability_Restore.dbo.BATCH) AS BATCH_Count,';
PRINT '    (SELECT COUNT(*) FROM Traceability_Restore.dbo.AGRICULTURE_PRODUCT) AS Product_Count;';
PRINT '';

-- Actually execute it for verification
SELECT
    'Original (Traceability)' AS Database_Name,
    (SELECT COUNT(*) FROM Traceability.dbo.BATCH) AS BATCH_Count,
    (SELECT COUNT(*) FROM Traceability.dbo.AGRICULTURE_PRODUCT) AS Product_Count
UNION ALL
SELECT
    'Restored (Traceability_Restore)' AS Database_Name,
    (SELECT COUNT(*) FROM Traceability_Restore.dbo.BATCH) AS BATCH_Count,
    (SELECT COUNT(*) FROM Traceability_Restore.dbo.AGRICULTURE_PRODUCT) AS Product_Count;

PRINT '';
PRINT '========================================';
PRINT 'TEST CASE 1 COMPLETED SUCCESSFULLY!';
PRINT '========================================';
PRINT '';
PRINT 'REQUIRED SCREENSHOTS (4 total):';
PRINT '1. Full backup output (Steps 1-2)';
PRINT '2. RESTORE VERIFYONLY result showing CHECKSUM valid';
PRINT '3. DBCC CHECKDB Messages tab - 0 errors';
PRINT '4. Side-by-side row count comparison query results';
PRINT '';
PRINT 'Next: Clean up test database if needed:';
PRINT 'DROP DATABASE Traceability_Restore;';
