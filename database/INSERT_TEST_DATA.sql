-- ============================================================================
-- INSERT TEST DATA - 10,000 BATCHES FOR PERFORMANCE TESTING
-- ============================================================================
-- Purpose: Generate realistic test data to demonstrate index performance
-- Time: ~30 seconds
-- ============================================================================

USE Traceability;
GO

PRINT 'Starting test data insertion...';
PRINT '';

-- ============================================================================
-- STEP 1: Insert basic master data
-- ============================================================================

-- Insert Countries (if not exists)
IF NOT EXISTS (SELECT 1 FROM COUNTRY WHERE ID = 1)
BEGIN
    INSERT INTO COUNTRY (ID, Name) VALUES
    (1, 'Vietnam'),
    (2, 'Thailand'),
    (3, 'USA');
    PRINT 'Inserted 3 countries';
END

-- Insert Provinces
IF NOT EXISTS (SELECT 1 FROM PROVINCE WHERE ID = 1)
BEGIN
    INSERT INTO PROVINCE (ID, Name, C_ID) VALUES
    (1, 'Tien Giang', 1),
    (2, 'Dong Thap', 1),
    (3, 'Long An', 1),
    (4, 'Ben Tre', 1),
    (5, 'Can Tho', 1);
    PRINT 'Inserted 5 provinces';
END

-- Insert Farms
IF NOT EXISTS (SELECT 1 FROM FARM WHERE ID = 1)
BEGIN
    SET IDENTITY_INSERT FARM ON;
    INSERT INTO FARM (ID, Name, Owner_Name, Contact_Info, Longitude, Latitude, P_ID) VALUES
    (1, 'Green Valley Farm', 'Nguyen Van A', '0901234567', 106.123456, 10.123456, 1),
    (2, 'Sunrise Farm', 'Tran Van B', '0902345678', 106.234567, 10.234567, 2),
    (3, 'Golden Harvest', 'Le Van C', '0903456789', 106.345678, 10.345678, 3),
    (4, 'Mekong Delta Farm', 'Pham Van D', '0904567890', 106.456789, 10.456789, 4),
    (5, 'River View Farm', 'Vo Van E', '0905678901', 106.567890, 10.567890, 5);
    SET IDENTITY_INSERT FARM OFF;
    PRINT 'Inserted 5 farms';
END

-- Insert Agriculture Products
IF NOT EXISTS (SELECT 1 FROM AGRICULTURE_PRODUCT WHERE ID = 1)
BEGIN
    SET IDENTITY_INSERT AGRICULTURE_PRODUCT ON;
    INSERT INTO AGRICULTURE_PRODUCT (ID, Name, Type, Description) VALUES
    (1, 'Grapefruit', 'Fruit', 'Fresh grapefruit from Mekong Delta'),
    (2, 'Dragon Fruit', 'Fruit', 'Sweet dragon fruit'),
    (3, 'Mango', 'Fruit', 'Tropical mango'),
    (4, 'Durian', 'Fruit', 'King of fruits'),
    (5, 'Banana', 'Fruit', 'Organic banana'),
    (6, 'Coconut', 'Fruit', 'Fresh coconut'),
    (7, 'Papaya', 'Fruit', 'Sweet papaya'),
    (8, 'Pineapple', 'Fruit', 'Juicy pineapple');
    SET IDENTITY_INSERT AGRICULTURE_PRODUCT OFF;
    PRINT 'Inserted 8 agriculture products';
END

PRINT '';
PRINT 'Master data inserted successfully!';
PRINT '';

-- ============================================================================
-- STEP 2: Insert 10,000 BATCHES (Main performance test data)
-- ============================================================================

PRINT 'Inserting 10,000 batches...';
PRINT 'This may take 20-30 seconds...';
PRINT '';

DECLARE @i INT = 1;
DECLARE @batchCount INT;

-- Check existing batches
SELECT @batchCount = COUNT(*) FROM BATCH;
PRINT 'Current batches in database: ' + CAST(@batchCount AS VARCHAR(10));

-- Only insert if less than 10,000 batches
IF @batchCount < 10000
BEGIN
    -- Delete existing batches first (for clean test)
    IF @batchCount > 0
    BEGIN
        PRINT 'Deleting existing batches for clean test...';
        DELETE FROM BATCH;
        PRINT 'Deleted ' + CAST(@batchCount AS VARCHAR(10)) + ' old batches';
        PRINT '';
    END

    SET @i = 1;

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
            'QR_BATCH_' + RIGHT('00000' + CAST(@i AS VARCHAR(5)), 5), -- QR_BATCH_00001, QR_BATCH_00002, etc.
            DATEADD(DAY, -(@i % 365), GETDATE()), -- Random dates within last year
            CASE (@i % 3)
                WHEN 0 THEN 'A'
                WHEN 1 THEN 'B'
                ELSE 'C'
            END, -- Grade A, B, or C
            'SEED_' + RIGHT('00000' + CAST((@i % 100) + 1 AS VARCHAR(5)), 5), -- Seed batch
            ((@i % 5) + 1), -- Farm_ID 1-5
            ((@i % 8) + 1), -- AP_ID 1-8
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
END
ELSE
BEGIN
    PRINT '⚠ Database already has ' + CAST(@batchCount AS VARCHAR(10)) + ' batches.';
    PRINT 'Skipping insertion.';
END

PRINT '';

-- ============================================================================
-- STEP 3: Verify data
-- ============================================================================

PRINT '============================================================================';
PRINT 'DATA VERIFICATION';
PRINT '============================================================================';
PRINT '';

-- Count batches
DECLARE @totalBatches INT;
SELECT @totalBatches = COUNT(*) FROM BATCH;
PRINT 'Total batches: ' + CAST(@totalBatches AS VARCHAR(10));

-- Sample QR codes
PRINT '';
PRINT 'Sample QR codes:';
SELECT TOP 5 Qr_Code_URL, Harvest_Date, Grade, Seed_Batch
FROM BATCH
ORDER BY ID;

PRINT '';
PRINT 'Batches by Farm:';
SELECT f.Name AS Farm_Name, COUNT(*) AS Batch_Count
FROM BATCH b
JOIN FARM f ON b.Farm_ID = f.ID
GROUP BY f.Name
ORDER BY COUNT(*) DESC;

PRINT '';
PRINT 'Batches by Product:';
SELECT ap.Name AS Product_Name, COUNT(*) AS Batch_Count
FROM BATCH b
JOIN AGRICULTURE_PRODUCT ap ON b.AP_ID = ap.ID
GROUP BY ap.Name
ORDER BY COUNT(*) DESC;

PRINT '';
PRINT '============================================================================';
PRINT 'Test data ready for performance testing!';
PRINT '';
PRINT 'You can now run performance tests with realistic data.';
PRINT 'Expected results:';
PRINT '  - WITHOUT index: ~80ms, 1000+ logical reads';
PRINT '  - WITH index: ~5ms, 3-5 logical reads';
PRINT '============================================================================';
GO
