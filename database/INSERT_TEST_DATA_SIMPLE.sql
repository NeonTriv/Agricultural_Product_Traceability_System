-- ============================================================================
-- SIMPLE TEST DATA - ONLY INSERT 10,000 BATCHES
-- ============================================================================
-- Assumes master data already exists in database
-- ============================================================================

USE Traceability;
GO

PRINT 'Inserting 10,000 batches for performance testing...';
PRINT '';

-- Check if we have required master data
DECLARE @farmCount INT, @productCount INT;
SELECT @farmCount = COUNT(*) FROM FARM;
SELECT @productCount = COUNT(*) FROM AGRICULTURE_PRODUCT;

IF @farmCount = 0
BEGIN
    PRINT 'ERROR: No farms found in database!';
    PRINT 'Please run BTL_LEADER_SCHEMA.sql first to create master data.';
    RETURN;
END

IF @productCount = 0
BEGIN
    PRINT 'ERROR: No products found in database!';
    PRINT 'Please run BTL_LEADER_SCHEMA.sql first to create master data.';
    RETURN;
END

PRINT 'Found ' + CAST(@farmCount AS VARCHAR(10)) + ' farms';
PRINT 'Found ' + CAST(@productCount AS VARCHAR(10)) + ' products';
PRINT '';

-- Check existing batches
DECLARE @batchCount INT;
SELECT @batchCount = COUNT(*) FROM BATCH;
PRINT 'Current batches in database: ' + CAST(@batchCount AS VARCHAR(10));

-- Only insert if less than 10,000 batches
IF @batchCount >= 10000
BEGIN
    PRINT 'Database already has ' + CAST(@batchCount AS VARCHAR(10)) + ' batches.';
    PRINT 'Skipping insertion.';
    RETURN;
END

-- Delete existing batches for clean test
IF @batchCount > 0
BEGIN
    PRINT 'Deleting existing ' + CAST(@batchCount AS VARCHAR(10)) + ' batches for clean test...';
    DELETE FROM BATCH;
    PRINT 'Deleted successfully.';
    PRINT '';
END

-- Get first farm and product IDs
DECLARE @firstFarmID INT, @firstProductID INT;
SELECT TOP 1 @firstFarmID = ID FROM FARM ORDER BY ID;
SELECT TOP 1 @firstProductID = ID FROM AGRICULTURE_PRODUCT ORDER BY ID;

PRINT 'Using Farm ID: ' + CAST(@firstFarmID AS VARCHAR(10));
PRINT 'Using Product ID: ' + CAST(@firstProductID AS VARCHAR(10));
PRINT '';

-- Insert 10,000 batches
PRINT 'Inserting 10,000 batches...';
PRINT 'This may take 20-30 seconds...';
PRINT '';

DECLARE @i INT = 1;

WHILE @i <= 10000
BEGIN
    INSERT INTO BATCH (
        Qr_Code_URL,
        Harvest_Date,
        Grade,
        Seed_Batch,
        Farm_ID,
        AP_ID,
        Created_By
    )
    VALUES (
        'QR_BATCH_' + RIGHT('00000' + CAST(@i AS VARCHAR(5)), 5), -- QR_BATCH_00001, etc.
        DATEADD(DAY, -(@i % 365), GETDATE()), -- Random dates within last year
        CASE (@i % 3)
            WHEN 0 THEN 'A'
            WHEN 1 THEN 'B'
            ELSE 'C'
        END, -- Grade A, B, or C
        'SEED_' + RIGHT('00000' + CAST((@i % 100) + 1 AS VARCHAR(5)), 5), -- Seed batch
        @firstFarmID + ((@i % @farmCount)), -- Cycle through all farms
        @firstProductID + ((@i % @productCount)), -- Cycle through all products
        'System'
    );

    -- Print progress every 1000 batches
    IF @i % 1000 = 0
    BEGIN
        PRINT 'Inserted ' + CAST(@i AS VARCHAR(10)) + ' batches...';
    END

    SET @i = @i + 1;
END

PRINT '';
PRINT '✅ Successfully inserted 10,000 batches!';
PRINT '';

-- Verify
SELECT @batchCount = COUNT(*) FROM BATCH;
PRINT '============================================================================';
PRINT 'VERIFICATION';
PRINT '============================================================================';
PRINT 'Total batches: ' + CAST(@batchCount AS VARCHAR(10));
PRINT '';

-- Sample QR codes
PRINT 'Sample QR codes:';
SELECT TOP 5
    Qr_Code_URL,
    Harvest_Date,
    Grade,
    Seed_Batch,
    Farm_ID,
    AP_ID
FROM BATCH
ORDER BY ID;

PRINT '';
PRINT '============================================================================';
PRINT 'Ready for performance testing!';
PRINT '';
PRINT 'Now you can run:';
PRINT '  - Test WITH index: ~5ms, 3-5 logical reads';
PRINT '  - Test WITHOUT index: ~80ms, 1000+ logical reads';
PRINT '============================================================================';
GO
