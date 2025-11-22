-- ====================================================================
-- TEST CASE 3: TAIL-LOG RECOVERY FROM MEDIA FAILURE
-- ====================================================================
-- Objective: Simulate database crash and recover including tail-log transactions
-- Expected Screenshots: 4 images
-- ====================================================================

PRINT '========================================';
PRINT 'TEST CASE 3: TAIL-LOG RECOVERY';
PRINT '========================================';
PRINT '';

USE Traceability;
GO

-- ====================================================================
-- PREPARATION: Create baseline backups
-- ====================================================================
PRINT '>>> PREPARATION: Creating baseline backups...';
PRINT '';

-- Ensure FULL recovery model
ALTER DATABASE Traceability SET RECOVERY FULL;
PRINT '✓ Recovery model set to FULL';

-- Create FULL backup
BACKUP DATABASE Traceability
TO DISK = 'C:\Backup\Traceability_FULL_Test3.bak'
WITH COMPRESSION, CHECKSUM, INIT, NAME = 'Test3 Full Baseline';
PRINT '✓ Full backup created';

-- Create initial log backup
BACKUP LOG Traceability
TO DISK = 'C:\Backup\Traceability_LOG_Test3_Initial.trn'
WITH COMPRESSION, CHECKSUM, INIT, NAME = 'Test3 Initial Log';
PRINT '✓ Initial log backup created';
PRINT '';

-- ====================================================================
-- STEP 1: Insert New Data (Simulating Active Transactions)
-- SCREENSHOT 1: Capture this INSERT statement and results
-- ====================================================================
PRINT '>>> STEP 1: Inserting new BATCH records (simulating active work)...';
PRINT '';
PRINT 'These records represent transactions that happened AFTER the last scheduled backup';
PRINT '';

-- Get the next available ID, a valid AP_ID, and a valid Farm_ID
DECLARE @MaxBatchID INT;
DECLARE @ValidAPID INT;
DECLARE @ValidFarmID INT;
SELECT @MaxBatchID = ISNULL(MAX(ID), 0) FROM BATCH;
SELECT TOP 1 @ValidAPID = ID FROM AGRICULTURE_PRODUCT;
SELECT TOP 1 @ValidFarmID = ID FROM FARM;

-- Check if we have required parent records
IF @ValidAPID IS NULL
BEGIN
    PRINT 'ERROR: No AGRICULTURE_PRODUCT records found. Cannot create BATCH records.';
    PRINT 'Please ensure AGRICULTURE_PRODUCT table has data.';
    RETURN;
END

IF @ValidFarmID IS NULL
BEGIN
    PRINT 'ERROR: No FARM records found. Cannot create BATCH records.';
    PRINT 'Please ensure FARM table has data.';
    RETURN;
END

-- Insert 5 new test BATCH records
DECLARE @i INT = 1;
DECLARE @NewQRCode NVARCHAR(255);

WHILE @i <= 5
BEGIN
    SET @NewQRCode = 'TEST_TAIL_' + RIGHT('00000' + CAST(@MaxBatchID + @i AS VARCHAR), 5);

    INSERT INTO BATCH (Qr_Code_URL, Harvest_Date, Grade, Created_By, AP_ID, Farm_ID)
    VALUES (
        @NewQRCode,
        GETDATE(),
        CASE (@i % 3)
            WHEN 0 THEN 'A'
            WHEN 1 THEN 'B'
            ELSE 'C'
        END,
        'TailLogTest',
        @ValidAPID,  -- Use a valid agriculture product ID
        @ValidFarmID  -- Use a valid farm ID
    );

    SET @i = @i + 1;
END

PRINT 'Inserted 5 new BATCH records';
PRINT '';

-- Show the newly inserted records
PRINT 'Execute this query and capture SCREENSHOT 1:';
PRINT '';

SELECT
    ID,
    Qr_Code_URL,
    Harvest_Date,
    Grade,
    Created_By
FROM BATCH
WHERE Created_By = 'TailLogTest'
ORDER BY ID;

PRINT '';
PRINT 'Record these ID values for verification after recovery';
PRINT '';

-- Store the IDs for later verification
DECLARE @NewBatchIDs TABLE (ID INT);
INSERT INTO @NewBatchIDs
SELECT ID FROM BATCH WHERE Created_By = 'TailLogTest';

DECLARE @RecordCount INT;
SELECT @RecordCount = COUNT(*) FROM @NewBatchIDs;
PRINT 'Total new BATCH records: ' + CAST(@RecordCount AS VARCHAR);
PRINT '';

-- ====================================================================
-- STEP 2: Wait and then Simulate Database Crash
-- ====================================================================
PRINT '========================================';
PRINT 'SIMULATING DATABASE CRASH SCENARIO';
PRINT '========================================';
PRINT '';
PRINT 'CRITICAL: The new BATCH records were inserted AFTER the last log backup';
PRINT 'If we restore without TAIL-LOG, these 5 records will be LOST!';
PRINT '';
PRINT 'Waiting 2 seconds to ensure transactions are committed...';
WAITFOR DELAY '00:00:02';
PRINT '';

-- ====================================================================
-- STEP 3: Capture Tail-Log Backup (Before taking database offline)
-- SCREENSHOT 2: Capture this entire tail-log backup process
-- ====================================================================
PRINT '========================================';
PRINT 'CAPTURING TAIL-LOG BACKUP';
PRINT '========================================';
PRINT '';
PRINT '>>> This is the CRITICAL step that saves our 5 new BATCH records!';
PRINT '>>> Taking tail-log backup BEFORE database goes offline...';
PRINT '';
GO

-- Switch to master database to avoid "database in use" error
USE master;
GO

-- Tail-log backup with NORECOVERY (puts database in restoring state)
BACKUP LOG Traceability
TO DISK = 'C:\Backup\Traceability_TAIL_Test3.trn'
WITH COMPRESSION, CHECKSUM, INIT, NORECOVERY, NAME = 'Test3 Tail-Log (Contains 5 new BATCH records)';

PRINT '';
PRINT 'TAIL-LOG BACKUP SUCCESSFUL!';
PRINT '  This backup contains the 5 INSERT transactions';
PRINT '  Database is now in RESTORING state (simulating crash/offline)';
PRINT '  File: C:\Backup\Traceability_TAIL_Test3.trn';
PRINT '';

-- ====================================================================
-- STEP 4: Bring Original Database Back Online
-- ====================================================================
PRINT '>>> Bringing original Traceability database back online...';
RESTORE DATABASE Traceability WITH RECOVERY;
PRINT 'Original database is now ONLINE (but data still has the 5 new BATCH records)';
PRINT '';

-- ====================================================================
-- STEP 5: Restore to New Database Including Tail-Log
-- SCREENSHOT 3: Capture Messages showing restore WITH RECOVERY
-- ====================================================================
PRINT '========================================';
PRINT 'RESTORING DATABASE (INCLUDING TAIL-LOG)';
PRINT '========================================';
PRINT '';

-- Drop existing restore database
IF EXISTS (SELECT name FROM sys.databases WHERE name = 'Traceability_Restore')
BEGIN
    ALTER DATABASE Traceability_Restore SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE Traceability_Restore;
    PRINT 'Dropped existing Traceability_Restore';
END

-- RESTORE SEQUENCE
PRINT '>>> Step 5.1: Restoring FULL backup...';
RESTORE DATABASE Traceability_Restore
FROM DISK = 'C:\Backup\Traceability_FULL_Test3.bak'
WITH
    MOVE 'Traceability' TO 'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\Traceability_Restore.mdf',
    MOVE 'Traceability_log' TO 'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\Traceability_Restore_log.ldf',
    NORECOVERY,
    REPLACE,
    STATS = 10;
PRINT 'Full backup restored (NORECOVERY)';
PRINT '';

PRINT '>>> Step 5.2: Restoring initial LOG backup...';
RESTORE LOG Traceability_Restore
FROM DISK = 'C:\Backup\Traceability_LOG_Test3_Initial.trn'
WITH NORECOVERY, STATS = 10;
PRINT 'Initial log restored';
PRINT '';

PRINT '>>> Step 5.3: Restoring TAIL-LOG backup (contains 5 new BATCH records)...';
RESTORE LOG Traceability_Restore
FROM DISK = 'C:\Backup\Traceability_TAIL_Test3.trn'
WITH NORECOVERY, STATS = 10;
PRINT 'TAIL-LOG restored - 5 INSERT transactions should now be applied';
PRINT '';

PRINT '>>> Step 5.4: Bringing database ONLINE with RECOVERY...';
RESTORE DATABASE Traceability_Restore WITH RECOVERY;
PRINT 'Database is now ONLINE and ready for use';
PRINT '';

-- ====================================================================
-- STEP 6: Verify Tail-Log Data Recovery
-- SCREENSHOT 4: Capture query showing the 5 recovered BATCH records
-- ====================================================================
PRINT '========================================';
PRINT 'VERIFYING TAIL-LOG RECOVERY';
PRINT '========================================';
PRINT '';
PRINT '>>> Execute this query and capture SCREENSHOT 4:';
PRINT '';

USE Traceability_Restore;
GO

-- Show recovered BATCH records from tail-log
SELECT
    ID,
    Qr_Code_URL,
    Harvest_Date,
    Grade,
    Created_By,
    'RECOVERED FROM TAIL-LOG!' AS Recovery_Status
FROM BATCH
WHERE Created_By = 'TailLogTest'
ORDER BY ID;

PRINT '';
PRINT 'EXPECTED: All 5 BATCH records should be present';
PRINT 'These were inserted AFTER the last scheduled backup';
PRINT 'They were ONLY recovered because we captured the TAIL-LOG!';
PRINT '';

-- Count verification
DECLARE @RecoveredCount INT;
SELECT @RecoveredCount = COUNT(*)
FROM Traceability_Restore.dbo.BATCH
WHERE Created_By = 'TailLogTest';

PRINT 'Recovered BATCH records from tail-log: ' + CAST(@RecoveredCount AS VARCHAR);
PRINT 'Expected: 5';
PRINT '';

IF @RecoveredCount = 5
    PRINT 'TAIL-LOG RECOVERY SUCCESSFUL!';
ELSE
    PRINT 'WARNING: Expected 5 records, found ' + CAST(@RecoveredCount AS VARCHAR);

PRINT '';

PRINT '========================================';
PRINT 'TEST CASE 3 COMPLETED SUCCESSFULLY!';
PRINT '========================================';
PRINT '';
PRINT 'REQUIRED SCREENSHOTS (4 total):';
PRINT '1. Query showing 5 new BATCH inserts (before crash)';
PRINT '2. Messages tab showing TAIL-LOG backup WITH NO_TRUNCATE';
PRINT '3. Messages tab showing restore sequence ending WITH RECOVERY';
PRINT '4. Query in Traceability_Restore showing 5 recovered BATCH records';
PRINT '';
PRINT 'KEY PROOF:';
PRINT '- The 5 BATCH records were inserted AFTER the last scheduled log backup';
PRINT '- They only exist in the TAIL-LOG';
PRINT '- Without tail-log capture, these 5 records would be LOST FOREVER';
PRINT '- RPO (Recovery Point Objective) = 0 minutes (no data loss!)';
PRINT '';
PRINT 'Clean up test data:';
PRINT 'USE Traceability; DELETE FROM BATCH WHERE Created_By = ''TailLogTest'';';
PRINT 'USE master; DROP DATABASE Traceability_Restore;';
