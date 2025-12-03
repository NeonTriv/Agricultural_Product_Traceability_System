-- ====================================================================
-- TEST CASE 2: POINT-IN-TIME RECOVERY (PITR)
-- ====================================================================
-- Objective: Simulate accidental deletion and recover to exact time before error
-- Expected Screenshots: 4 images
-- ====================================================================

PRINT '========================================';
PRINT 'TEST CASE 2: POINT-IN-TIME RECOVERY';
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

-- Create FULL backup (baseline)
BACKUP DATABASE Traceability
TO DISK = 'C:\Backup\Traceability_FULL_Test2.bak'
WITH COMPRESSION, CHECKSUM, INIT, NAME = 'Test2 Full Baseline';

PRINT '✓ Full backup created';

-- Wait 2 seconds for clear separation
WAITFOR DELAY '00:00:02';

-- Create first transaction log backup
BACKUP LOG Traceability
TO DISK = 'C:\Backup\Traceability_LOG_Test2_1.trn'
WITH COMPRESSION, CHECKSUM, INIT, NAME = 'Test2 Log 1';

PRINT '✓ Transaction log backup 1 created';
PRINT '';

-- ====================================================================
-- STEP 1: Record Data BEFORE Deletion
-- SCREENSHOT 1: Capture this query result showing the target batch exists
-- ====================================================================
PRINT '>>> STEP 1: Recording data BEFORE accidental deletion...';
PRINT '';

-- Find the smallest BATCH ID in the database
DECLARE @MinBatchID INT;
DECLARE @MaxTargetID INT;
SELECT @MinBatchID = MIN(ID) FROM BATCH;

-- If no batches exist, insert test data
IF @MinBatchID IS NULL
BEGIN
    PRINT 'No BATCH records found. Inserting test data...';
    
    -- SỬA LỖI: Lấy ID của Farm và Product có sẵn để làm khóa ngoại
    DECLARE @FarmID INT, @ProductID INT;
    SELECT TOP 1 @FarmID = ID FROM FARM;
    SELECT TOP 1 @ProductID = ID FROM AGRICULTURE_PRODUCT;

    -- Kiểm tra nếu chưa có master data
    IF @FarmID IS NULL OR @ProductID IS NULL
    BEGIN
        PRINT 'ERROR: Master data (Farm/Product) missing. Run INSERT_MASTER_DATA.sql first.';
        RETURN;
    END

    -- Insert test BATCH records for demonstration (SỬA: Thêm Farm_ID, AP_ID)
    INSERT INTO BATCH (Qr_Code_URL, Harvest_Date, Grade, Created_By, Farm_ID, AP_ID)
    VALUES
        ('https://qr.test/batch001', GETDATE(), 'A', 'TestUser', @FarmID, @ProductID),
        ('https://qr.test/batch002', GETDATE(), 'B', 'TestUser', @FarmID, @ProductID),
        ('https://qr.test/batch003', GETDATE(), 'A', 'TestUser', @FarmID, @ProductID);

    SELECT @MinBatchID = MIN(ID) FROM BATCH;
    PRINT 'Test data inserted successfully';
    PRINT '';
END

-- Target: Delete the first 3 BATCH records
SET @MaxTargetID = @MinBatchID + 2;

PRINT 'Execute this query in SSMS and capture SCREENSHOT 1:';
PRINT '';

-- Select the batches we will delete
SELECT
    ID,
    Qr_Code_URL,
    Harvest_Date,
    Grade,
    Created_By
FROM BATCH
WHERE ID BETWEEN @MinBatchID AND @MaxTargetID
ORDER BY ID;

PRINT '';
PRINT 'Record these ' + CAST(@@ROWCOUNT AS VARCHAR) + ' records for verification after recovery';
PRINT 'Target deletion range: ID ' + CAST(@MinBatchID AS VARCHAR) + ' to ' + CAST(@MaxTargetID AS VARCHAR);
PRINT '';

-- Store the current time (this is our "safe" restore point)
DECLARE @SafeRestorePoint DATETIME = GETDATE();
PRINT 'SAFE RESTORE POINT: ' + CONVERT(VARCHAR, @SafeRestorePoint, 120);
PRINT '(We will restore to THIS time)';
PRINT '';

-- Wait 3 seconds to create clear time separation
WAITFOR DELAY '00:00:03';

-- ====================================================================
-- STEP 2: Simulate Accidental Deletion (THE ERROR)
-- SCREENSHOT 2: Capture query result showing data is MISSING
-- ====================================================================
PRINT '>>> STEP 2: Simulating ACCIDENTAL DELETION at ' + CONVERT(VARCHAR, GETDATE(), 120) + '...';
PRINT '';

-- THE MISTAKE: Accidental DELETE
DECLARE @DeletedCount INT;

-- Delete referenced records first (to avoid FK constraint violations)
-- SHIP_BATCH, PROCESSING, STORED_IN nếu có tham chiếu đến Batch này
DELETE FROM SHIP_BATCH WHERE B_ID BETWEEN @MinBatchID AND @MaxTargetID;
DELETE FROM PROCESSING WHERE Batch_ID BETWEEN @MinBatchID AND @MaxTargetID;
DELETE FROM STORED_IN WHERE B_ID BETWEEN @MinBatchID AND @MaxTargetID;

-- Now delete BATCH records in the target range
DELETE FROM BATCH WHERE ID BETWEEN @MinBatchID AND @MaxTargetID;
SET @DeletedCount = @@ROWCOUNT;

PRINT 'ERROR OCCURRED: Accidentally deleted ' + CAST(@DeletedCount AS VARCHAR) + ' BATCH records!';
PRINT 'Deleted range: ID ' + CAST(@MinBatchID AS VARCHAR) + ' to ' + CAST(@MaxTargetID AS VARCHAR);
PRINT '';

-- Verify data is gone
PRINT 'Execute this query and capture SCREENSHOT 2 showing NO RESULTS:';
PRINT '';

SELECT
    ID,
    Qr_Code_URL,
    Harvest_Date,
    Grade,
    Created_By
FROM BATCH
WHERE ID BETWEEN @MinBatchID AND @MaxTargetID
ORDER BY ID;

PRINT '';
IF @@ROWCOUNT = 0
    PRINT 'Data is MISSING (expected: no rows returned)';
ELSE
    PRINT 'WARNING: Data still exists (DELETE may have failed)';
PRINT '';

-- Create another log backup to capture the DELETE transaction
BACKUP LOG Traceability
TO DISK = 'C:\Backup\Traceability_LOG_Test2_2.trn'
WITH COMPRESSION, CHECKSUM, INIT, NAME = 'Test2 Log 2 - Contains DELETE';

PRINT '✓ Log backup created (contains the DELETE transaction)';
PRINT '';

-- ====================================================================
-- STEP 3: POINT-IN-TIME RESTORE
-- SCREENSHOT 3: Capture the Messages tab during this restore process
-- ====================================================================
-- Save restore point value for later use
DECLARE @RestorePointText VARCHAR(30) = CONVERT(VARCHAR, @SafeRestorePoint, 120);

-- Store the restore point and ID range in a temp table to preserve across GO statements
IF OBJECT_ID('tempdb..#RestorePoint') IS NOT NULL DROP TABLE #RestorePoint;
CREATE TABLE #RestorePoint (
    RestoreTime DATETIME,
    RestoreText VARCHAR(30),
    MinID INT,
    MaxID INT
);
INSERT INTO #RestorePoint VALUES (@SafeRestorePoint, @RestorePointText, @MinBatchID, @MaxTargetID);

PRINT '========================================';
PRINT 'STARTING POINT-IN-TIME RECOVERY';
PRINT '========================================';
PRINT '';
PRINT 'Restore Target Time: ' + @RestorePointText;
PRINT '(This is BEFORE the accidental deletion occurred)';
PRINT '';
GO

-- Now we are in a new batch - switch to master database
USE master;
GO

-- Retrieve the restore point and ID range from temp table
DECLARE @SafeRestorePoint DATETIME;
DECLARE @RestorePointText VARCHAR(30);
DECLARE @MinBatchID INT;
DECLARE @MaxTargetID INT;
SELECT
    @SafeRestorePoint = RestoreTime,
    @RestorePointText = RestoreText,
    @MinBatchID = MinID,
    @MaxTargetID = MaxID
FROM #RestorePoint;

-- Capture tail-log (current state)
-- Note: NORECOVERY will put database offline automatically
PRINT '>>> Capturing tail-log backup...';
BACKUP LOG Traceability
TO DISK = 'C:\Backup\Traceability_TAIL_Test2.trn'
WITH COMPRESSION, CHECKSUM, INIT, NORECOVERY, NAME = 'Test2 Tail-Log';
PRINT 'Tail-log captured (database is now in RESTORING state)';
PRINT '';

-- Bring database back online with RECOVERY
PRINT '>>> Bringing original database back online...';
RESTORE DATABASE Traceability WITH RECOVERY;
PRINT 'Original database is now ONLINE';
PRINT '';

-- Drop existing restore database if exists
IF EXISTS (SELECT name FROM sys.databases WHERE name = 'Traceability_Restore')
BEGIN
    ALTER DATABASE Traceability_Restore SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE Traceability_Restore;
    PRINT 'Dropped existing Traceability_Restore database';
END

-- RESTORE SEQUENCE (PITR)
PRINT '>>> Step 3.1: Restoring FULL backup...';
RESTORE DATABASE Traceability_Restore
FROM DISK = 'C:\Backup\Traceability_FULL_Test2.bak'
WITH
    MOVE 'Traceability' TO 'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\Traceability_Restore.mdf',
    MOVE 'Traceability_log' TO 'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\Traceability_Restore_log.ldf',
    NORECOVERY,
    REPLACE,
    STATS = 10;
PRINT 'Full backup restored (NORECOVERY)';
PRINT '';

PRINT '>>> Step 3.2: Restoring LOG backup 1...';
RESTORE LOG Traceability_Restore
FROM DISK = 'C:\Backup\Traceability_LOG_Test2_1.trn'
WITH NORECOVERY, STATS = 10;
PRINT 'Log 1 restored';
PRINT '';

PRINT '>>> Step 3.3: Restoring LOG backup 2 with STOPAT (this contains the DELETE)...';
PRINT 'CRITICAL: Using STOPAT = ' + @RestorePointText;
RESTORE LOG Traceability_Restore
FROM DISK = 'C:\Backup\Traceability_LOG_Test2_2.trn'
WITH STOPAT = @SafeRestorePoint, NORECOVERY, STATS = 10;
PRINT 'Log 2 restored UP TO safe restore point (DELETE is NOT applied)';
PRINT '';

PRINT '>>> Step 3.4: Bringing database ONLINE...';
RESTORE DATABASE Traceability_Restore WITH RECOVERY;
PRINT 'Database is now ONLINE';
PRINT '';

-- ====================================================================
-- STEP 4: Verify Recovery - Data Should Be BACK
-- SCREENSHOT 4: Capture query result showing RECOVERED data
-- ====================================================================
PRINT '========================================';
PRINT 'VERIFYING POINT-IN-TIME RECOVERY';
PRINT '========================================';
PRINT '';
PRINT '>>> Execute this query and capture SCREENSHOT 4:';
PRINT '';

USE Traceability_Restore;
GO

-- Retrieve ID range from temp table
DECLARE @MinBatchID INT;
DECLARE @MaxTargetID INT;
SELECT @MinBatchID = MinID, @MaxTargetID = MaxID FROM #RestorePoint;

-- Query the recovered data
SELECT
    ID,
    Qr_Code_URL,
    Harvest_Date,
    Grade,
    Created_By
FROM BATCH
WHERE ID BETWEEN @MinBatchID AND @MaxTargetID
ORDER BY ID;

DECLARE @RecoveredCount INT = @@ROWCOUNT;

PRINT '';
IF @RecoveredCount > 0
    PRINT 'SUCCESS: Recovered ' + CAST(@RecoveredCount AS VARCHAR) + ' BATCH records!';
ELSE
    PRINT 'WARNING: No data recovered (expected ' + CAST(@MaxTargetID - @MinBatchID + 1 AS VARCHAR) + ' records)';

PRINT 'EXPECTED: Data should be PRESENT (successfully recovered)';
PRINT '';
PRINT '========================================';
PRINT 'TEST CASE 2 COMPLETED SUCCESSFULLY!';
PRINT '========================================';
PRINT '';
PRINT 'REQUIRED SCREENSHOTS (4 total):';
PRINT '1. Query result BEFORE deletion (batch records exist)';
PRINT '2. Query result AFTER deletion (NO rows returned)';
PRINT '3. Messages tab showing PITR restore with STOPAT timestamp';
PRINT '4. Query result in Traceability_Restore (data RECOVERED)';
PRINT '';
PRINT 'Clean up:';
PRINT 'USE master; DROP DATABASE Traceability_Restore;';
PRINT 'Note: Original Traceability database still has deleted data';
PRINT 'To restore original: run PITR on Traceability itself';
PRINT '';
PRINT 'Clean up temp table:';
PRINT 'DROP TABLE #RestorePoint;';