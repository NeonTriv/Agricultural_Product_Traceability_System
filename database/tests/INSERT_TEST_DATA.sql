-- ============================================================================
-- INSERT TEST DATA FOR PERFORMANCE TESTING
-- This script inserts sufficient test data for screenshot demonstrations
-- ============================================================================

USE Traceability;
GO

PRINT '============================================================================';
PRINT 'INSERTING TEST DATA FOR PERFORMANCE TESTING';
PRINT '============================================================================';
PRINT '';

-- ============================================================================
-- STEP 1: Insert base/lookup tables (no dependencies)
-- ============================================================================

PRINT '--- STEP 1: Inserting base tables (COUNTRY, CATEGORY, etc.) ---';

-- Insert COUNTRY
IF NOT EXISTS (SELECT * FROM COUNTRY WHERE Name = N'Vietnam')
BEGIN
    INSERT INTO COUNTRY (Name) VALUES (N'Vietnam');
    PRINT '✓ Inserted: COUNTRY - Vietnam';
END

IF NOT EXISTS (SELECT * FROM COUNTRY WHERE Name = N'Thailand')
BEGIN
    INSERT INTO COUNTRY (Name) VALUES (N'Thailand');
    PRINT '✓ Inserted: COUNTRY - Thailand';
END

-- Insert CATEGORY
IF NOT EXISTS (SELECT * FROM CATEGORY WHERE Name = N'Vegetables')
BEGIN
    INSERT INTO CATEGORY (Name) VALUES (N'Vegetables');
    PRINT '✓ Inserted: CATEGORY - Vegetables';
END

IF NOT EXISTS (SELECT * FROM CATEGORY WHERE Name = N'Fruits')
BEGIN
    INSERT INTO CATEGORY (Name) VALUES (N'Fruits');
    PRINT '✓ Inserted: CATEGORY - Fruits';
END

-- Insert CARRIER COMPANY
-- Removed: CARRIERCOMPANY direct inserts; must insert into VENDOR first, then child CARRIERCOMPANY

GO

-- ============================================================================
-- STEP 2: Insert PROVINCE (depends on COUNTRY)
-- ============================================================================

PRINT '';
PRINT '--- STEP 2: Inserting PROVINCE ---';

DECLARE @VietnamID INT = (SELECT ID FROM COUNTRY WHERE Name = N'Vietnam');
DECLARE @ThailandID INT = (SELECT ID FROM COUNTRY WHERE Name = N'Thailand');

IF NOT EXISTS (SELECT * FROM PROVINCE WHERE Name = N'Ho Chi Minh' AND C_ID = @VietnamID)
BEGIN
    INSERT INTO PROVINCE (Name, C_ID) VALUES
        (N'Ho Chi Minh', @VietnamID),
        (N'Hanoi', @VietnamID),
        (N'Da Nang', @VietnamID),
        (N'Can Tho', @VietnamID),
        (N'Lam Dong', @VietnamID),
        (N'Bangkok', @ThailandID);
    PRINT '✓ Inserted: PROVINCE (6 records)';
END

GO

-- ============================================================================
-- STEP 3: Insert TYPE (depends on CATEGORY)
-- ============================================================================

PRINT '';
PRINT '--- STEP 3: Inserting TYPE ---';

DECLARE @VegCategoryID INT = (SELECT ID FROM CATEGORY WHERE Name = N'Vegetables');
DECLARE @FruitCategoryID INT = (SELECT ID FROM CATEGORY WHERE Name = N'Fruits');

IF NOT EXISTS (SELECT * FROM [TYPE] WHERE Variety = N'Lettuce')
BEGIN
    -- Updated: TYPE has only Variety and C_ID
    INSERT INTO [TYPE] (Variety, C_ID) VALUES
        (N'Lettuce', @VegCategoryID),
        (N'Carrot', @VegCategoryID),
        (N'Cabbage', @VegCategoryID),
        (N'Strawberry', @FruitCategoryID),
        (N'Orange', @FruitCategoryID),
        (N'Mango', @FruitCategoryID);
    PRINT '✓ Inserted: TYPE (6 records)';
END

GO

-- ============================================================================
-- STEP 4: Insert FARM (depends on PROVINCE)
-- ============================================================================

PRINT '';
PRINT '--- STEP 4: Inserting FARM ---';

DECLARE @HCMID INT = (SELECT ID FROM PROVINCE WHERE Name = N'Ho Chi Minh');
DECLARE @HanoiID INT = (SELECT ID FROM PROVINCE WHERE Name = N'Hanoi');
DECLARE @DaNangID INT = (SELECT ID FROM PROVINCE WHERE Name = N'Da Nang');
DECLARE @CanThoID INT = (SELECT ID FROM PROVINCE WHERE Name = N'Can Tho');
DECLARE @LamDongID INT = (SELECT ID FROM PROVINCE WHERE Name = N'Lam Dong');

IF NOT EXISTS (SELECT * FROM FARM WHERE Name = N'Green Valley Farm')
BEGIN
    INSERT INTO FARM (Name, Owner_Name, Contact_Info, Address_detail, Longitude, Latitude, P_ID) VALUES
        (N'Green Valley Farm', N'Nguyen Van A', '0901111111', N'Cu Chi, HCM', 106.660172, 10.762622, @HCMID),
        (N'Organic Highlands', N'Tran Thi B', '0902222222', N'Son Tra, DN', 108.220833, 16.047079, @DaNangID),
        (N'Delta Fresh Farm', N'Le Van C', '0903333333', N'Soc Son, HN', 105.787120, 21.028511, @HanoiID),
        (N'Mekong Produce', N'Pham Thi D', '0904444444', N'Ninh Kieu, CT', 105.766670, 10.033333, @CanThoID),
        (N'Mountain View Farm', N'Vo Van E', '0905555555', N'Da Lat, LD', 108.433333, 11.933333, @LamDongID);
    PRINT '✓ Inserted: FARM (5 records)';
END

GO

-- ============================================================================
-- STEP 5: Insert AGRICULTURE_PRODUCT (depends on TYPE)
-- ============================================================================

PRINT '';
PRINT '--- STEP 5: Inserting AGRICULTURE_PRODUCT ---';

-- TYPE table only has Variety column (not Name) - query by Variety
DECLARE @LettuceTypeID INT = (SELECT ID FROM [TYPE] WHERE Variety = N'Lettuce');
DECLARE @CarrotTypeID INT = (SELECT ID FROM [TYPE] WHERE Variety = N'Carrot');
DECLARE @StrawberryTypeID INT = (SELECT ID FROM [TYPE] WHERE Variety = N'Strawberry');
DECLARE @OrangeTypeID INT = (SELECT ID FROM [TYPE] WHERE Variety = N'Orange');
DECLARE @MangoTypeID INT = (SELECT ID FROM [TYPE] WHERE Variety = N'Mango');

IF NOT EXISTS (SELECT * FROM AGRICULTURE_PRODUCT WHERE Name = N'Organic Lettuce')
BEGIN
    INSERT INTO AGRICULTURE_PRODUCT (Name, Image_URL, T_ID) VALUES
        (N'Organic Lettuce', 'https://example.com/lettuce.jpg', @LettuceTypeID),
        (N'Fresh Carrot', 'https://example.com/carrot.jpg', @CarrotTypeID),
        (N'Premium Strawberry', 'https://example.com/strawberry.jpg', @StrawberryTypeID),
        (N'Sweet Orange', 'https://example.com/orange.jpg', @OrangeTypeID),
        (N'Tropical Mango', 'https://example.com/mango.jpg', @MangoTypeID);
    PRINT '✓ Inserted: AGRICULTURE_PRODUCT (5 records)';
END

GO

-- ============================================================================
-- STEP 6: Insert VENDOR, DISTRIBUTOR
-- ============================================================================

PRINT '';
PRINT '--- STEP 6: Inserting VENDOR & DISTRIBUTOR ---';

IF NOT EXISTS (SELECT * FROM VENDOR WHERE TIN = 'DIST001')
BEGIN
    INSERT INTO VENDOR (TIN, Name, Address_detail, Contact_Info) VALUES
        ('DIST001', N'Metro Distribution', N'789 Commerce Blvd.', '0281234567'),
        ('DIST002', N'Fresh Supply Chain', N'321 Business Park', '0241234567'),
        ('DIST003', N'Green Network Ltd.', N'555 Industrial Zone', '0236123456');
    PRINT '✓ Inserted: VENDOR (3 records)';

    INSERT INTO DISTRIBUTOR (Vendor_TIN, Type) VALUES
        ('DIST001', 'Direct'),
        ('DIST002', 'Indirect'),
        ('DIST003', 'Direct');
    PRINT '✓ Inserted: DISTRIBUTOR (3 records)';
END

GO

-- ============================================================================
-- STEP 7: Insert SHIPMENT (depends on DISTRIBUTOR)
-- ============================================================================

PRINT '';
PRINT '--- STEP 7: Inserting SHIPMENT ---';

IF NOT EXISTS (SELECT * FROM SHIPMENT WHERE ID = 1)
BEGIN
    SET IDENTITY_INSERT SHIPMENT ON;

    INSERT INTO SHIPMENT (ID, Status, Destination, Distributor_TIN) VALUES
        (1, 'In-Transit', N'HCMC Warehouse A', 'DIST001'),
        (2, 'Delivered',  N'Hanoi Hub B', 'DIST002'),
        (3, 'In-Transit', N'Da Nang Center C', 'DIST003'),
        (4, 'Pending',    N'HCMC Warehouse D', 'DIST001'),
        (5, 'Delivered',  N'Can Tho Hub E', 'DIST002'),
        (6, 'In-Transit', N'HCMC Warehouse F', 'DIST001'),
        (7, 'In-Transit', N'Hanoi Hub G', 'DIST002'),
        (8, 'Delivered',  N'Da Nang Center H', 'DIST003');

    SET IDENTITY_INSERT SHIPMENT OFF;
    PRINT '✓ Inserted: SHIPMENT (8 records)';
END

GO

-- ============================================================================
-- STEP 8: Insert TRANSPORLEG (depends on SHIPMENT, CARRIERCOMPANY)
-- ============================================================================

PRINT '';
PRINT '--- STEP 8: Inserting TRANSPORLEG ---';

IF NOT EXISTS (SELECT * FROM TRANSPORLEG WHERE ID = 1)
BEGIN
    SET IDENTITY_INSERT TRANSPORLEG ON;

    INSERT INTO TRANSPORLEG (ID, Shipment_ID, Driver_Name, Temperature_Profile, Start_Location, To_Location, CarrierCompany_TIN, D_Time, A_Time) VALUES
        (1, 1, N'Nguyen Van X', '2-8°C', N'Green Valley', N'HCMC A', 'CARRIER001', '2025-11-14T08:00:00+07:00', NULL),
        (2, 2, N'Tran Van Y', '0-5°C', N'Organic High', N'Hanoi B', 'CARRIER002', '2025-11-13T09:00:00+07:00', '2025-11-13T15:30:00+07:00'),
        (3, 3, N'Le Van Z', '2-8°C', N'Delta Fresh', N'Da Nang C', 'CARRIER001', '2025-11-15T07:00:00+07:00', NULL),
        (4, 5, N'Pham Van W', '0-5°C', N'Mekong Prod', N'Can Tho E', 'CARRIER002', '2025-11-12T10:00:00+07:00', '2025-11-12T18:00:00+07:00'),
        (5, 6, N'Vo Van V', '2-8°C', N'Mountain View', N'HCMC F', 'CARRIER001', '2025-11-14T11:00:00+07:00', NULL),
        (6, 7, N'Hoang Van U', '0-5°C', N'Green Valley', N'Hanoi G', 'CARRIER002', '2025-11-15T08:30:00+07:00', NULL),
        (7, 8, N'Dang Van T', '2-8°C', N'Organic High', N'Da Nang H', 'CARRIER001', '2025-11-11T06:00:00+07:00', '2025-11-11T14:00:00+07:00');

    SET IDENTITY_INSERT TRANSPORLEG OFF;
    PRINT '✓ Inserted: TRANSPORLEG (7 records)';
END

GO

-- ============================================================================
-- STEP 9: Insert PROCESSING_FACILITY
-- ============================================================================

PRINT '';
PRINT '--- STEP 9: Inserting PROCESSING_FACILITY ---';

IF NOT EXISTS (SELECT * FROM PROCESSING_FACILITY WHERE License_Number = 'LIC-001')
BEGIN
    INSERT INTO PROCESSING_FACILITY (Name, Address_detail, Contact_Info, License_Number) VALUES
        (N'Central Processing Plant', N'100 Industrial Rd.', '0281111111', 'LIC-001'),
        (N'Fresh Pack Facility', N'200 Factory St.', '0242222222', 'LIC-002'),
        (N'Clean Packaging Co.', N'300 Processing Ave.', '0236333333', 'LIC-003');
    PRINT '✓ Inserted: PROCESSING_FACILITY (3 records)';
END

GO

-- ============================================================================
-- STEP 10: Insert PROCESSING (depends on BATCH - will link to existing batches)
-- ============================================================================

PRINT '';
PRINT '--- STEP 10: Inserting PROCESSING (linked to existing BATCH) ---';

-- Get facility IDs
DECLARE @FacilityID1 INT = (SELECT ID FROM PROCESSING_FACILITY WHERE License_Number = 'LIC-001');
DECLARE @FacilityID2 INT = (SELECT ID FROM PROCESSING_FACILITY WHERE License_Number = 'LIC-002');
DECLARE @FacilityID3 INT = (SELECT ID FROM PROCESSING_FACILITY WHERE License_Number = 'LIC-003');

-- Link to first 50 batches
IF NOT EXISTS (SELECT * FROM PROCESSING WHERE ID = 1)
BEGIN
    DECLARE @BatchID INT = 1;
    DECLARE @MaxBatchID INT = 50;

    WHILE @BatchID <= @MaxBatchID
    BEGIN
        INSERT INTO PROCESSING (Packaging_Date, Weight_per_unit, Processed_By, Packaging_Type, Processing_Date, Facility_ID, Batch_ID)
        VALUES (
            DATEADD(DAY, @BatchID % 7, '2025-11-10T10:00:00+07:00'),
            ROUND(RAND() * 5 + 0.5, 2), -- Random weight 0.5-5.5 kg
            N'Worker ' + CAST((@BatchID % 10 + 1) AS NVARCHAR(10)),
            CASE WHEN @BatchID % 3 = 0 THEN N'Vacuum Sealed'
                 WHEN @BatchID % 3 = 1 THEN N'Plastic Tray'
                 ELSE N'Cardboard Box' END,
            DATEADD(DAY, @BatchID % 7, '2025-11-09T14:00:00+07:00'),
            CASE WHEN @BatchID % 3 = 0 THEN @FacilityID1
                 WHEN @BatchID % 3 = 1 THEN @FacilityID2
                 ELSE @FacilityID3 END,
            @BatchID
        );

        SET @BatchID = @BatchID + 1;
    END

    PRINT '✓ Inserted: PROCESSING (50 records linked to BATCH 1-50)';
END

GO

-- ============================================================================
-- STEP 11: Insert SHIP_BATCH (many-to-many relationship)
-- ============================================================================

PRINT '';
PRINT '--- STEP 11: Inserting SHIP_BATCH ---';

IF NOT EXISTS (SELECT * FROM SHIP_BATCH WHERE S_ID = 1 AND B_ID = 1)
BEGIN
    -- Link batches to shipments (each shipment contains 5-10 batches)
    INSERT INTO SHIP_BATCH (S_ID, B_ID) VALUES
        -- Shipment 1 contains batches 1-8
        (1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8),
        -- Shipment 2 contains batches 9-15
        (2, 9), (2, 10), (2, 11), (2, 12), (2, 13), (2, 14), (2, 15),
        -- Shipment 3 contains batches 16-22
        (3, 16), (3, 17), (3, 18), (3, 19), (3, 20), (3, 21), (3, 22),
        -- Shipment 5 contains batches 23-30
        (5, 23), (5, 24), (5, 25), (5, 26), (5, 27), (5, 28), (5, 29), (5, 30),
        -- Shipment 6 contains batches 31-38
        (6, 31), (6, 32), (6, 33), (6, 34), (6, 35), (6, 36), (6, 37), (6, 38),
        -- Shipment 7 contains batches 39-45
        (7, 39), (7, 40), (7, 41), (7, 42), (7, 43), (7, 44), (7, 45),
        -- Shipment 8 contains batches 46-50
        (8, 46), (8, 47), (8, 48), (8, 49), (8, 50);

    PRINT '✓ Inserted: SHIP_BATCH (50 records linking batches to shipments)';
END

GO

-- ============================================================================
-- FINAL VERIFICATION
-- ============================================================================

PRINT '';
PRINT '============================================================================';
PRINT 'VERIFICATION - Record counts after insert:';
PRINT '============================================================================';

SELECT 'COUNTRY' AS TableName, COUNT(*) AS RecordCount FROM COUNTRY
UNION ALL SELECT 'CATEGORY', COUNT(*) FROM CATEGORY
UNION ALL SELECT 'PROVINCE', COUNT(*) FROM PROVINCE
UNION ALL SELECT 'TYPE', COUNT(*) FROM [TYPE]
UNION ALL SELECT 'FARM', COUNT(*) FROM FARM
UNION ALL SELECT 'AGRICULTURE_PRODUCT', COUNT(*) FROM AGRICULTURE_PRODUCT
UNION ALL SELECT 'VENDOR', COUNT(*) FROM VENDOR
UNION ALL SELECT 'DISTRIBUTOR', COUNT(*) FROM DISTRIBUTOR
UNION ALL SELECT 'SHIPMENT', COUNT(*) FROM SHIPMENT
UNION ALL SELECT 'TRANSPORLEG', COUNT(*) FROM TRANSPORLEG
UNION ALL SELECT 'PROCESSING_FACILITY', COUNT(*) FROM PROCESSING_FACILITY
UNION ALL SELECT 'PROCESSING', COUNT(*) FROM PROCESSING
UNION ALL SELECT 'SHIP_BATCH', COUNT(*) FROM SHIP_BATCH
UNION ALL SELECT 'BATCH', COUNT(*) FROM BATCH
UNION ALL SELECT 'CARRIERCOMPANY', COUNT(*) FROM CARRIERCOMPANY;

PRINT '';
PRINT '✅ TEST DATA INSERTION COMPLETE!';
PRINT '';
PRINT 'You can now:';
PRINT '  1. Run performance tests with JOIN queries';
PRINT '  2. Capture screenshots showing Index Seek improvements';
PRINT '  3. Demonstrate composite index on SHIPMENT (Status, Distributor_TIN)';
PRINT '';
PRINT '============================================================================';
GO
