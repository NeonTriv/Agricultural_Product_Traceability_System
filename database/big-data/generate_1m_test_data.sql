-- ============================================================================
-- GENERATE 1 MILLION TEST BATCH RECORDS - FAST VERSION
-- ============================================================================
-- Purpose: Create large dataset using bulk insert (MUCH faster)
-- Expected time: ~1-2 minutes
-- Expected size: ~100MB
-- ============================================================================

USE Traceability;
GO

SET NOCOUNT ON;
SET QUOTED_IDENTIFIER ON;

PRINT '========================================';
PRINT 'GENERATING 1 MILLION TEST BATCH RECORDS';
PRINT '========================================';
PRINT '';

-- 1. Check current record count
DECLARE @CurrentCount INT;
SELECT @CurrentCount = COUNT(*) FROM BATCH;
PRINT 'Current BATCH records: ' + CAST(@CurrentCount AS VARCHAR(20));
PRINT '';

-- 2. Check if CATEGORY, TYPE, PROVINCE, AGRICULTURE_PRODUCT and FARM exist
DECLARE @CategoryId INT, @TypeId INT, @ProvinceId INT;
DECLARE @ProductIdA INT, @ProductIdB INT, @ProductIdC INT;
DECLARE @FarmIdA INT, @FarmIdB INT;

SELECT TOP 1 @CategoryId = ID FROM CATEGORY ORDER BY ID;
SELECT TOP 1 @TypeId = ID FROM [TYPE] ORDER BY ID;
SELECT TOP 1 @ProvinceId = ID FROM PROVINCE ORDER BY ID;
SELECT TOP 1 @ProductIdA = ID FROM AGRICULTURE_PRODUCT ORDER BY ID;
SELECT TOP 1 @FarmIdA = ID FROM FARM ORDER BY ID;

-- Create CATEGORY if not exists
IF @CategoryId IS NULL
BEGIN
    PRINT 'Creating dummy CATEGORY record...';
    INSERT INTO CATEGORY (Name) VALUES (N'Test Category');
    SELECT TOP 1 @CategoryId = ID FROM CATEGORY ORDER BY ID;
END;

-- Create TYPE if not exists
IF @TypeId IS NULL
BEGIN
    PRINT 'Creating dummy TYPE record...';
    -- SỬA: Bỏ Name, chỉ dùng Variety
    INSERT INTO [TYPE] (Variety, C_ID) VALUES (N'Test Type', @CategoryId);
    SELECT TOP 1 @TypeId = ID FROM [TYPE] ORDER BY ID;
END;

-- Create PROVINCE if not exists
IF @ProvinceId IS NULL
BEGIN
    PRINT 'Creating dummy PROVINCE record...';
    INSERT INTO PROVINCE (Name) VALUES (N'Test Province');
    SELECT TOP 1 @ProvinceId = ID FROM PROVINCE ORDER BY ID;
END;

-- Create AGRICULTURE_PRODUCT if not exists
IF @ProductIdA IS NULL
BEGIN
    PRINT 'Creating dummy AGRICULTURE_PRODUCT records...';
    INSERT INTO AGRICULTURE_PRODUCT (Name, T_ID)
    VALUES
        ('Test Product A', @TypeId),
        ('Test Product B', @TypeId),
        ('Test Product C', @TypeId);
END;

-- Create FARM if not exists
IF @FarmIdA IS NULL
BEGIN
    PRINT 'Creating dummy FARM records...';
    -- SỬA: Thêm Address_detail
    INSERT INTO FARM (Name, Owner_Name, Contact_Info, Address_detail, Longitude, Latitude, P_ID)
    VALUES
        (N'Test Farm A', N'Owner A', '0123456789', N'Address A', 106.123456, 10.123456, @ProvinceId),
        (N'Test Farm B', N'Owner B', '0123456789', N'Address B', 106.234567, 10.234567, @ProvinceId);
END;

PRINT '';

-- Get IDs
SELECT TOP 1 @ProductIdA = ID FROM AGRICULTURE_PRODUCT ORDER BY ID;
SELECT TOP 1 @ProductIdB = ID FROM AGRICULTURE_PRODUCT WHERE ID > @ProductIdA ORDER BY ID;
SELECT TOP 1 @ProductIdC = ID FROM AGRICULTURE_PRODUCT WHERE ID > @ProductIdB ORDER BY ID;

SELECT TOP 1 @FarmIdA = ID FROM FARM ORDER BY ID;
SELECT TOP 1 @FarmIdB = ID FROM FARM WHERE ID > @FarmIdA ORDER BY ID;

-- Fallback
IF @ProductIdB IS NULL SET @ProductIdB = @ProductIdA;
IF @ProductIdC IS NULL SET @ProductIdC = @ProductIdA;
IF @FarmIdB IS NULL SET @FarmIdB = @FarmIdA;

PRINT 'Using Product IDs: ' + CAST(@ProductIdA AS VARCHAR(10)) + ', ' +
      CAST(@ProductIdB AS VARCHAR(10)) + ', ' + CAST(@ProductIdC AS VARCHAR(10));
PRINT 'Using Farm IDs: ' + CAST(@FarmIdA AS VARCHAR(10)) + ', ' + CAST(@FarmIdB AS VARCHAR(10));
PRINT '';

-- 3. Create numbers table for bulk generation
PRINT 'Creating numbers table (0 to 999,999)...';
IF OBJECT_ID('tempdb..#Numbers') IS NOT NULL DROP TABLE #Numbers;

CREATE TABLE #Numbers (n INT PRIMARY KEY);

-- Insert 1000 rows using simple method
DECLARE @n INT = 0;
WHILE @n < 1000
BEGIN
    INSERT INTO #Numbers (n) VALUES (@n);
    SET @n = @n + 1;
END;

-- Cross join to get 1,000,000 rows (1000 * 1000)
IF OBJECT_ID('tempdb..#Numbers1M') IS NOT NULL DROP TABLE #Numbers1M;

SELECT (a.n * 1000 + b.n) AS n
INTO #Numbers1M
FROM #Numbers a
CROSS JOIN #Numbers b
WHERE (a.n * 1000 + b.n) < 1000000;

DECLARE @NumbersCount INT;
SELECT @NumbersCount = COUNT(*) FROM #Numbers1M;
PRINT 'Numbers table created: ' + CAST(@NumbersCount AS VARCHAR(20)) + ' rows';
PRINT '';

-- 4. Bulk insert 1 million records in batches
PRINT 'Inserting 1,000,000 records in batches of 100,000...';
PRINT 'This should take 1-2 minutes.';
PRINT '';

DECLARE @BatchSize INT = 100000;
DECLARE @TotalBatches INT = 10;
DECLARE @CurrentBatch INT = 1;
DECLARE @StartTime DATETIME = GETDATE();
DECLARE @MinN INT, @MaxN INT;

WHILE @CurrentBatch <= @TotalBatches
BEGIN
    SET @MinN = (@CurrentBatch - 1) * @BatchSize;
    SET @MaxN = @CurrentBatch * @BatchSize - 1;

    INSERT INTO BATCH (Qr_Code_URL, Harvest_Date, Grade, Created_By, AP_ID, Farm_ID)
    SELECT
        'BATCH_TEST_' + RIGHT('0000000' + CAST(n AS VARCHAR(10)), 7) AS Qr_Code_URL,
        DATEADD(MINUTE, -n, GETDATE()) AS Harvest_Date,
        CASE (n % 5)
            WHEN 0 THEN 'A'
            WHEN 1 THEN 'B'
            WHEN 2 THEN 'C'
            WHEN 3 THEN 'D'
            ELSE 'F'
        END AS Grade,
        CASE (n % 3)
            WHEN 0 THEN 'System'
            WHEN 1 THEN 'Admin'
            ELSE 'TestUser'
        END AS Created_By,
        CASE (n % 3)
            WHEN 0 THEN @ProductIdA
            WHEN 1 THEN @ProductIdB
            ELSE @ProductIdC
        END AS AP_ID,
        CASE (n % 2)
            WHEN 0 THEN @FarmIdA
            ELSE @FarmIdB
        END AS Farm_ID
    FROM #Numbers1M
    WHERE n >= @MinN AND n <= @MaxN;

    -- Show progress
    DECLARE @Progress INT = (@CurrentBatch * 100) / @TotalBatches;
    DECLARE @ElapsedSeconds INT = DATEDIFF(SECOND, @StartTime, GETDATE());
    DECLARE @RecordsGenerated INT = @CurrentBatch * @BatchSize;

    PRINT 'Progress: ' + CAST(@Progress AS VARCHAR(3)) + '% | ' +
          'Records: ' + CAST(@RecordsGenerated AS VARCHAR(20)) + ' | ' +
          'Elapsed: ' + CAST(@ElapsedSeconds AS VARCHAR(10)) + 's';

    SET @CurrentBatch = @CurrentBatch + 1;
END;

-- Cleanup
DROP TABLE #Numbers;
DROP TABLE #Numbers1M;

PRINT '';
PRINT 'Generation completed!';
PRINT '';

-- 5. Verify final count
DECLARE @FinalCount INT;
SELECT @FinalCount = COUNT(*) FROM BATCH;
PRINT 'Final BATCH records: ' + CAST(@FinalCount AS VARCHAR(20));
PRINT '';

-- 6. Show statistics
PRINT '========================================';
PRINT 'DATA STATISTICS';
PRINT '========================================';
PRINT '';

SELECT
    Grade,
    COUNT(*) AS Count,
    CAST(COUNT(*) * 100.0 / @FinalCount AS DECIMAL(5,2)) AS Percentage
FROM BATCH
GROUP BY Grade
ORDER BY Grade;

PRINT '';

SELECT
    Created_By,
    COUNT(*) AS Count,
    CAST(COUNT(*) * 100.0 / @FinalCount AS DECIMAL(5,2)) AS Percentage
FROM BATCH
GROUP BY Created_By
ORDER BY Count DESC;

PRINT '';
PRINT 'Date range:';
SELECT
    MIN(Harvest_Date) AS Earliest_Date,
    MAX(Harvest_Date) AS Latest_Date,
    DATEDIFF(DAY, MIN(Harvest_Date), MAX(Harvest_Date)) AS Days_Span
FROM BATCH;

PRINT '';
DECLARE @TotalTime INT = DATEDIFF(SECOND, @StartTime, GETDATE());
PRINT 'Total time: ' + CAST(@TotalTime AS VARCHAR(10)) + ' seconds (' +
      CAST(@TotalTime / 60 AS VARCHAR(10)) + ' minutes)';
PRINT '';
PRINT '========================================';
PRINT 'TEST DATA GENERATION COMPLETED!';
PRINT '========================================';

SET NOCOUNT OFF;
GO
