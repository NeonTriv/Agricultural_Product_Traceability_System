-- ============================================================================
-- AUTOMATED INDEXING - TRACEABILITY DATABASE
-- ============================================================================
-- Purpose: Create performance indexes with idempotent checks
-- Safe to re-run: Skips existing indexes, no errors
-- ============================================================================

USE Traceability;
GO

SET NOCOUNT ON;

PRINT '>>> Starting index creation...';
PRINT '';

-- ============================================================================
-- QR Code Lookup (CRITICAL - 1000+ scans/day)
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('BATCH') AND name = 'idx_batch_qr_code_url')
BEGIN
    PRINT '>>> Creating idx_batch_qr_code_url...';
    CREATE UNIQUE NONCLUSTERED INDEX idx_batch_qr_code_url
    ON BATCH (Qr_Code_URL)
    INCLUDE (ID, Harvest_Date, Grade, Farm_ID, AP_ID, Created_By);
    PRINT '    ✓ Done';
END
ELSE
    PRINT '    → idx_batch_qr_code_url already exists, skipping';

-- ============================================================================
-- Product Type Filtering
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('AGRICULTURE_PRODUCT') AND name = 'idx_agriculture_product_type')
BEGIN
    PRINT '>>> Creating idx_agriculture_product_type...';
    CREATE NONCLUSTERED INDEX idx_agriculture_product_type
    ON AGRICULTURE_PRODUCT (T_ID)
    INCLUDE (ID, Name, Image_URL);
    PRINT '    ✓ Done';
END
ELSE
    PRINT '    → idx_agriculture_product_type already exists, skipping';

-- ============================================================================
-- Farm Traceability
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('BATCH') AND name = 'idx_batch_farm')
BEGIN
    PRINT '>>> Creating idx_batch_farm...';
    CREATE NONCLUSTERED INDEX idx_batch_farm
    ON BATCH (Farm_ID)
    INCLUDE (ID, Harvest_Date, Grade, Qr_Code_URL, AP_ID);
    PRINT '    ✓ Done';
END
ELSE
    PRINT '    → idx_batch_farm already exists, skipping';

-- ============================================================================
-- Batch by Product
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('BATCH') AND name = 'idx_batch_agriculture_product')
BEGIN
    PRINT '>>> Creating idx_batch_agriculture_product...';
    CREATE NONCLUSTERED INDEX idx_batch_agriculture_product
    ON BATCH (AP_ID)
    INCLUDE (ID, Harvest_Date, Grade, Farm_ID, Qr_Code_URL);
    PRINT '    ✓ Done';
END
ELSE
    PRINT '    → idx_batch_agriculture_product already exists, skipping';

-- ============================================================================
-- Processing History
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('PROCESSING') AND name = 'idx_processing_batch')
BEGIN
    PRINT '>>> Creating idx_processing_batch...';
    CREATE NONCLUSTERED INDEX idx_processing_batch
    ON PROCESSING (Batch_ID)
    INCLUDE (ID, Processing_Date, Packaging_Date, Processed_By, Packaging_Type, Facility_ID);
    PRINT '    ✓ Done';
END
ELSE
    PRINT '    → idx_processing_batch already exists, skipping';

-- ============================================================================
-- Vendor Queries
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('VENDOR_PRODUCT') AND name = 'idx_vendor_product_vendor')
BEGIN
    PRINT '>>> Creating idx_vendor_product_vendor...';
    CREATE NONCLUSTERED INDEX idx_vendor_product_vendor
    ON VENDOR_PRODUCT (Vendor_TIN)
    INCLUDE (ID, AP_ID, Unit);
    PRINT '    ✓ Done';
END
ELSE
    PRINT '    → idx_vendor_product_vendor already exists, skipping';

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('VENDOR_PRODUCT') AND name = 'idx_vendor_product_agriculture_product')
BEGIN
    PRINT '>>> Creating idx_vendor_product_agriculture_product...';
    CREATE NONCLUSTERED INDEX idx_vendor_product_agriculture_product
    ON VENDOR_PRODUCT (AP_ID)
    INCLUDE (ID, Vendor_TIN, Unit);
    PRINT '    ✓ Done';
END
ELSE
    PRINT '    → idx_vendor_product_agriculture_product already exists, skipping';

-- ============================================================================
-- Shipment Tracking (Composite for better selectivity)
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('SHIPMENT') AND name = 'idx_shipment_status_distributor')
BEGIN
    PRINT '>>> Creating idx_shipment_status_distributor...';
    CREATE NONCLUSTERED INDEX idx_shipment_status_distributor
    ON SHIPMENT ([Status], Distributor_TIN)
    INCLUDE (ID, Destination);
    PRINT '    ✓ Done';
END
ELSE
    PRINT '    → idx_shipment_status_distributor already exists, skipping';

-- ============================================================================
-- Geographic Queries
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('FARM') AND name = 'idx_farm_province')
BEGIN
    PRINT '>>> Creating idx_farm_province...';
    CREATE NONCLUSTERED INDEX idx_farm_province
    ON FARM (P_ID)
    INCLUDE (ID, Name, Owner_Name, Contact_Info);
    PRINT '    ✓ Done';
END
ELSE
    PRINT '    → idx_farm_province already exists, skipping';

-- ============================================================================
-- Shipment-Batch Relationships (Many-to-Many)
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('SHIP_BATCH') AND name = 'idx_ship_batch_shipment')
BEGIN
    PRINT '>>> Creating idx_ship_batch_shipment...';
    CREATE NONCLUSTERED INDEX idx_ship_batch_shipment
    ON SHIP_BATCH (S_ID)
    INCLUDE (B_ID);
    PRINT '    ✓ Done';
END
ELSE
    PRINT '    → idx_ship_batch_shipment already exists, skipping';

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('SHIP_BATCH') AND name = 'idx_ship_batch_batch')
BEGIN
    PRINT '>>> Creating idx_ship_batch_batch...';
    CREATE NONCLUSTERED INDEX idx_ship_batch_batch
    ON SHIP_BATCH (B_ID)
    INCLUDE (S_ID);
    PRINT '    ✓ Done';
END
ELSE
    PRINT '    → idx_ship_batch_batch already exists, skipping';

-- ============================================================================
-- Transport Legs
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('TRANSPORLEG') AND name = 'idx_transportleg_shipment')
BEGIN
    PRINT '>>> Creating idx_transportleg_shipment...';
    CREATE NONCLUSTERED INDEX idx_transportleg_shipment
    ON TRANSPORLEG (Shipment_ID)
    INCLUDE (ID, Start_Location, To_Location, Driver_Name, CarrierCompany_TIN);
    PRINT '    ✓ Done';
END
ELSE
    PRINT '    → idx_transportleg_shipment already exists, skipping';

-- ============================================================================
-- Update Statistics (Important for query optimizer)
-- ============================================================================
PRINT '';
PRINT '>>> Updating statistics...';

UPDATE STATISTICS BATCH WITH FULLSCAN;
UPDATE STATISTICS AGRICULTURE_PRODUCT WITH FULLSCAN;
UPDATE STATISTICS VENDOR_PRODUCT WITH FULLSCAN;
UPDATE STATISTICS PROCESSING WITH FULLSCAN;
UPDATE STATISTICS SHIPMENT WITH FULLSCAN;
UPDATE STATISTICS FARM WITH FULLSCAN;
UPDATE STATISTICS SHIP_BATCH WITH FULLSCAN;
UPDATE STATISTICS TRANSPORLEG WITH FULLSCAN;

PRINT '    ✓ Statistics updated';

-- ============================================================================
-- Summary
-- ============================================================================
PRINT '';
PRINT '============================================================================';
PRINT 'INDEX SUMMARY';
PRINT '============================================================================';

SELECT
    OBJECT_NAME(i.object_id) AS [Table],
    i.name AS [Index],
    i.type_desc AS [Type],
    CASE i.is_unique WHEN 1 THEN 'Yes' ELSE 'No' END AS [Unique]
FROM sys.indexes i
WHERE i.name LIKE 'idx_%'
  AND i.is_hypothetical = 0
ORDER BY OBJECT_NAME(i.object_id), i.name;

PRINT '';
PRINT '✓ Index creation completed successfully';
PRINT '';

GO
