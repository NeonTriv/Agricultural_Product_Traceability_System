-- ============================================================================
-- CLEAR ALL DATA - Delete all data from all tables
-- ============================================================================

USE Traceability;
GO

PRINT '============================================================================';
PRINT 'CLEARING ALL DATA FROM DATABASE';
PRINT '============================================================================';

WAITFOR DELAY '00:00:03';

PRINT 'Deleting data in correct order (child to parent)...';
PRINT '';

-- Level 6: Most child tables
PRINT 'Level 6: Deleting child records...';
DELETE FROM TRANSPORLEG;
PRINT '  ✓ TRANSPORLEG: ' + CAST(@@ROWCOUNT AS VARCHAR(10)) + ' rows';

DELETE FROM SHIP_BATCH;
PRINT '  ✓ SHIP_BATCH: ' + CAST(@@ROWCOUNT AS VARCHAR(10)) + ' rows';

DELETE FROM STORED_IN;
PRINT '  ✓ STORED_IN: ' + CAST(@@ROWCOUNT AS VARCHAR(10)) + ' rows';

DELETE FROM PROCESS_STEP;
PRINT '  ✓ PROCESS_STEP: ' + CAST(@@ROWCOUNT AS VARCHAR(10)) + ' rows';

DELETE FROM PRODUCT_HAS_DISCOUNT;
PRINT '  ✓ PRODUCT_HAS_DISCOUNT: ' + CAST(@@ROWCOUNT AS VARCHAR(10)) + ' rows';

DELETE FROM FARM_CERTIFICATIONS;
PRINT '  ✓ FARM_CERTIFICATIONS: ' + CAST(@@ROWCOUNT AS VARCHAR(10)) + ' rows';

PRINT '';

-- Level 5
PRINT 'Level 5: Deleting mid-level records...';
DELETE FROM PROCESSING;
PRINT '  ✓ PROCESSING: ' + CAST(@@ROWCOUNT AS VARCHAR(10)) + ' rows';

DELETE FROM SHIPMENT;
PRINT '  ✓ SHIPMENT: ' + CAST(@@ROWCOUNT AS VARCHAR(10)) + ' rows';

DELETE FROM BATCH;
PRINT '  ✓ BATCH: ' + CAST(@@ROWCOUNT AS VARCHAR(10)) + ' rows';

DELETE FROM PRICE;
PRINT '  ✓ PRICE: ' + CAST(@@ROWCOUNT AS VARCHAR(10)) + ' rows';

PRINT '';

-- Level 4
PRINT 'Level 4: Deleting vendor products...';
DELETE FROM VENDOR_PRODUCT;
PRINT '  ✓ VENDOR_PRODUCT: ' + CAST(@@ROWCOUNT AS VARCHAR(10)) + ' rows';

PRINT '';

-- Level 3: Vendor types
PRINT 'Level 3: Deleting vendors...';
DELETE FROM RETAIL;
PRINT '  ✓ RETAIL: ' + CAST(@@ROWCOUNT AS VARCHAR(10)) + ' rows';

DELETE FROM DISTRIBUTOR;
PRINT '  ✓ DISTRIBUTOR: ' + CAST(@@ROWCOUNT AS VARCHAR(10)) + ' rows';

DELETE FROM CARRIERCOMPANY;
PRINT '  ✓ CARRIERCOMPANY: ' + CAST(@@ROWCOUNT AS VARCHAR(10)) + ' rows';

DELETE FROM VENDOR;
PRINT '  ✓ VENDOR: ' + CAST(@@ROWCOUNT AS VARCHAR(10)) + ' rows';

PRINT '';

-- Level 2: Location-based tables
PRINT 'Level 2: Deleting facilities and farms...';
DELETE FROM WAREHOUSE;
PRINT '  ✓ WAREHOUSE: ' + CAST(@@ROWCOUNT AS VARCHAR(10)) + ' rows';

DELETE FROM PROCESSING_FACILITY;
PRINT '  ✓ PROCESSING_FACILITY: ' + CAST(@@ROWCOUNT AS VARCHAR(10)) + ' rows';

DELETE FROM FARM;
PRINT '  ✓ FARM: ' + CAST(@@ROWCOUNT AS VARCHAR(10)) + ' rows';

PRINT '';

-- Level 1: Products and categories
PRINT 'Level 1: Deleting products and categories...';
DELETE FROM AGRICULTURE_PRODUCT;
PRINT '  ✓ AGRICULTURE_PRODUCT: ' + CAST(@@ROWCOUNT AS VARCHAR(10)) + ' rows';

DELETE FROM DISCOUNT;
PRINT '  ✓ DISCOUNT: ' + CAST(@@ROWCOUNT AS VARCHAR(10)) + ' rows';

DELETE FROM [TYPE];
PRINT '  ✓ TYPE: ' + CAST(@@ROWCOUNT AS VARCHAR(10)) + ' rows';

DELETE FROM CATEGORY;
PRINT '  ✓ CATEGORY: ' + CAST(@@ROWCOUNT AS VARCHAR(10)) + ' rows';

PRINT '';

-- Level 0: Base location tables
PRINT 'Level 0: Deleting provinces and countries...';
DELETE FROM PROVINCE;
PRINT '  ✓ PROVINCE: ' + CAST(@@ROWCOUNT AS VARCHAR(10)) + ' rows';

DELETE FROM COUNTRY;
PRINT '  ✓ COUNTRY: ' + CAST(@@ROWCOUNT AS VARCHAR(10)) + ' rows';

PRINT '';
PRINT '============================================================================';
PRINT 'ALL DATA DELETED SUCCESSFULLY!';
PRINT '============================================================================';
PRINT '';
PRINT 'Database is now empty and ready for fresh data insertion.';
PRINT '';
PRINT 'Next step:';
PRINT '  Run INSERT_MASTER_DATA.sql to populate with master data';
PRINT '============================================================================';
GO
