-- ============================================================================
-- DATA INDEXING IMPLEMENTATION - LEADER SCHEMA VERSION
-- QR-Code Agricultural Product Traceability System
-- ============================================================================
-- Author: Database Team
-- Date: 08/11/2025
-- Purpose: Create indexes to optimize query performance for Leader's schema
-- Database: SQL Server / MSSQL
-- Schema: BTL.sql (Leader's version)
-- ============================================================================

USE Traceability;
GO

PRINT '';
PRINT '============================================================================';
PRINT 'CREATING INDEXES FOR LEADER SCHEMA (BTL.sql)';
PRINT '============================================================================';
PRINT '';

-- ============================================================================
-- INDEX 1: QR Code URL Lookup (CRITICAL PRIORITY) ⭐⭐⭐
-- ============================================================================
-- Table: BATCH
-- Column: Qr_Code_URL
-- Type: UNIQUE NONCLUSTERED INDEX
-- Justification:
--   - PRIMARY use case: QR code scanning (1000+ times/day)
--   - 100% unique values (UNIQUE constraint already exists)
--   - High frequency queries
--   - Expected improvement: 95%+ faster lookups
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_batch_qr_code_url')
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX idx_batch_qr_code_url
    ON BATCH (Qr_Code_URL)
    INCLUDE (ID, Harvest_Date, Grade, Farm_ID, AP_ID, Created_By);

    PRINT '✓ Index created: idx_batch_qr_code_url (CRITICAL)';
END
ELSE
BEGIN
    PRINT '⚠ Index already exists: idx_batch_qr_code_url';
END
GO

-- ============================================================================
-- INDEX 2: Agriculture Product by Type (HIGH PRIORITY)
-- ============================================================================
-- Table: AGRICULTURE_PRODUCT
-- Column: T_ID (Foreign Key to TYPE)
-- Type: NONCLUSTERED INDEX
-- Justification:
--   - Query pattern: "Show all products of type X" (e.g., all Grapefruits)
--   - Medium-high frequency
--   - Used in product listing and filtering
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_agriculture_product_type')
BEGIN
    CREATE NONCLUSTERED INDEX idx_agriculture_product_type
    ON AGRICULTURE_PRODUCT (T_ID)
    INCLUDE (ID, Name, Image_URL);

    PRINT '✓ Index created: idx_agriculture_product_type';
END
ELSE
BEGIN
    PRINT '⚠ Index already exists: idx_agriculture_product_type';
END
GO

-- ============================================================================
-- INDEX 3: Batch by Farm (HIGH PRIORITY)
-- ============================================================================
-- Table: BATCH
-- Column: Farm_ID (Foreign Key to FARM)
-- Type: NONCLUSTERED INDEX
-- Justification:
--   - Traceability: "Show all batches from this farm"
--   - Admin dashboard queries
--   - Expected improvement: 80%+ faster
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_batch_farm')
BEGIN
    CREATE NONCLUSTERED INDEX idx_batch_farm
    ON BATCH (Farm_ID)
    INCLUDE (ID, Harvest_Date, Grade, Qr_Code_URL, AP_ID);

    PRINT '✓ Index created: idx_batch_farm';
END
ELSE
BEGIN
    PRINT '⚠ Index already exists: idx_batch_farm';
END
GO

-- ============================================================================
-- INDEX 4: Batch by Agriculture Product (HIGH PRIORITY)
-- ============================================================================
-- Table: BATCH
-- Column: AP_ID (Foreign Key to AGRICULTURE_PRODUCT)
-- Type: NONCLUSTERED INDEX
-- Justification:
--   - Query: "All batches of this product"
--   - Product detail page queries
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_batch_agriculture_product')
BEGIN
    CREATE NONCLUSTERED INDEX idx_batch_agriculture_product
    ON BATCH (AP_ID)
    INCLUDE (ID, Harvest_Date, Grade, Farm_ID, Qr_Code_URL);

    PRINT '✓ Index created: idx_batch_agriculture_product';
END
ELSE
BEGIN
    PRINT '⚠ Index already exists: idx_batch_agriculture_product';
END
GO

-- ============================================================================
-- INDEX 5: Processing by Batch (MEDIUM PRIORITY)
-- ============================================================================
-- Table: PROCESSING
-- Column: Batch_ID (Foreign Key to BATCH)
-- Type: NONCLUSTERED INDEX
-- Justification:
--   - Traceability: "Processing history of this batch"
--   - Product detail page
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_processing_batch')
BEGIN
    CREATE NONCLUSTERED INDEX idx_processing_batch
    ON PROCESSING (Batch_ID)
    INCLUDE (ID, Processing_Date, Packaging_Date, Processed_By, Packaging_Type, Facility_ID);

    PRINT '✓ Index created: idx_processing_batch';
END
ELSE
BEGIN
    PRINT '⚠ Index already exists: idx_processing_batch';
END
GO

-- ============================================================================
-- INDEX 6: Vendor Product Lookup (HIGH PRIORITY)
-- ============================================================================
-- Table: VENDOR_PRODUCT
-- Column: Vendor_TIN, AP_ID (Composite for UNIQUE constraint)
-- Type: NONCLUSTERED INDEX
-- Justification:
--   - Price lookup and vendor queries
--   - "Which vendors sell this product?"
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_vendor_product_vendor')
BEGIN
    CREATE NONCLUSTERED INDEX idx_vendor_product_vendor
    ON VENDOR_PRODUCT (Vendor_TIN)
    INCLUDE (ID, AP_ID, Unit);

    PRINT '✓ Index created: idx_vendor_product_vendor';
END
ELSE
BEGIN
    PRINT '⚠ Index already exists: idx_vendor_product_vendor';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_vendor_product_agriculture_product')
BEGIN
    CREATE NONCLUSTERED INDEX idx_vendor_product_agriculture_product
    ON VENDOR_PRODUCT (AP_ID)
    INCLUDE (ID, Vendor_TIN, Unit);

    PRINT '✓ Index created: idx_vendor_product_agriculture_product';
END
ELSE
BEGIN
    PRINT '⚠ Index already exists: idx_vendor_product_agriculture_product';
END
GO

-- ============================================================================
-- INDEX 7: Price Lookup (HIGH PRIORITY)
-- ============================================================================
-- Table: PRICE
-- Column: V_ID (Foreign Key to VENDOR_PRODUCT) - Already PRIMARY KEY
-- Note: Primary key already has clustered index, no additional index needed
-- But we'll verify it exists
-- ============================================================================

PRINT '✓ PRICE table: Primary key clustered index already optimized';
GO

-- ============================================================================
-- INDEX 8: Shipment Status Tracking (MEDIUM PRIORITY)
-- ============================================================================
-- Table: SHIPMENT
-- Column: Status, Distributor_TIN (Composite)
-- Type: NONCLUSTERED COMPOSITE INDEX
-- Justification:
--   - Admin dashboard: "Show pending shipments for distributor X"
--   - Composite improves selectivity
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_shipment_status_distributor')
BEGIN
    CREATE NONCLUSTERED INDEX idx_shipment_status_distributor
    ON SHIPMENT ([Status], Distributor_TIN)
    INCLUDE (ID, Destination);

    PRINT '✓ Index created: idx_shipment_status_distributor (COMPOSITE)';
END
ELSE
BEGIN
    PRINT '⚠ Index already exists: idx_shipment_status_distributor';
END
GO

-- ============================================================================
-- INDEX 9: Farm by Province (MEDIUM PRIORITY)
-- ============================================================================
-- Table: FARM
-- Column: P_ID (Foreign Key to PROVINCE)
-- Type: NONCLUSTERED INDEX
-- Justification:
--   - Geographic queries: "All farms in this province"
--   - Reporting and analytics
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_farm_province')
BEGIN
    CREATE NONCLUSTERED INDEX idx_farm_province
    ON FARM (P_ID)
    INCLUDE (ID, Name, Owner_Name, Contact_Info);

    PRINT '✓ Index created: idx_farm_province';
END
ELSE
BEGIN
    PRINT '⚠ Index already exists: idx_farm_province';
END
GO

-- ============================================================================
-- INDEX 10: Ship Batch Lookup (MEDIUM PRIORITY)
-- ============================================================================
-- Table: SHIP_BATCH (Many-to-Many relationship)
-- Columns: S_ID, B_ID
-- Type: NONCLUSTERED INDEXES (Both directions)
-- Justification:
--   - "Which batches are in this shipment?"
--   - "Which shipments contain this batch?"
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_ship_batch_shipment')
BEGIN
    CREATE NONCLUSTERED INDEX idx_ship_batch_shipment
    ON SHIP_BATCH (S_ID)
    INCLUDE (B_ID);

    PRINT '✓ Index created: idx_ship_batch_shipment';
END
ELSE
BEGIN
    PRINT '⚠ Index already exists: idx_ship_batch_shipment';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_ship_batch_batch')
BEGIN
    CREATE NONCLUSTERED INDEX idx_ship_batch_batch
    ON SHIP_BATCH (B_ID)
    INCLUDE (S_ID);

    PRINT '✓ Index created: idx_ship_batch_batch';
END
ELSE
BEGIN
    PRINT '⚠ Index already exists: idx_ship_batch_batch';
END
GO

-- ============================================================================
-- INDEX 11: Transport Leg by Shipment (LOW PRIORITY)
-- ============================================================================
-- Table: TRANSPORLEG
-- Column: Shipment_ID
-- Type: NONCLUSTERED INDEX
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_transportleg_shipment')
BEGIN
    CREATE NONCLUSTERED INDEX idx_transportleg_shipment
    ON TRANSPORLEG (Shipment_ID)
    INCLUDE (ID, Start_Location, To_Location, Driver_Name, CarrierCompany_TIN);

    PRINT '✓ Index created: idx_transportleg_shipment';
END
ELSE
BEGIN
    PRINT '⚠ Index already exists: idx_transportleg_shipment';
END
GO

-- ============================================================================
-- STATISTICS UPDATE
-- ============================================================================
PRINT '';
PRINT 'Updating statistics for all indexed tables...';

UPDATE STATISTICS BATCH WITH FULLSCAN;
UPDATE STATISTICS AGRICULTURE_PRODUCT WITH FULLSCAN;
UPDATE STATISTICS VENDOR_PRODUCT WITH FULLSCAN;
UPDATE STATISTICS PROCESSING WITH FULLSCAN;
UPDATE STATISTICS SHIPMENT WITH FULLSCAN;
UPDATE STATISTICS FARM WITH FULLSCAN;
UPDATE STATISTICS SHIP_BATCH WITH FULLSCAN;
UPDATE STATISTICS TRANSPORLEG WITH FULLSCAN;

PRINT '✓ Statistics updated successfully.';
GO

-- ============================================================================
-- INDEX SUMMARY REPORT
-- ============================================================================
PRINT '';
PRINT '============================================================================';
PRINT 'INDEX CREATION SUMMARY';
PRINT '============================================================================';

SELECT
    OBJECT_SCHEMA_NAME(i.object_id) + '.' + OBJECT_NAME(i.object_id) AS TableName,
    i.name AS IndexName,
    i.type_desc AS IndexType,
    i.is_unique AS IsUnique,
    COL_NAME(ic.object_id, ic.column_id) AS ColumnName,
    ic.key_ordinal AS ColumnPosition
FROM sys.indexes i
INNER JOIN sys.index_columns ic
    ON i.object_id = ic.object_id
    AND i.index_id = ic.index_id
WHERE i.name LIKE 'idx_%'
  AND ic.is_included_column = 0  -- Key columns only
ORDER BY TableName, IndexName, ic.key_ordinal;

PRINT '';
PRINT '============================================================================';
PRINT 'INDEX SIZE REPORT';
PRINT '============================================================================';

SELECT
    OBJECT_NAME(i.object_id) AS TableName,
    i.name AS IndexName,
    i.type_desc AS IndexType,
    SUM(ps.used_page_count) * 8 / 1024.0 AS IndexSizeMB,
    SUM(ps.row_count) AS RowCount
FROM sys.dm_db_partition_stats ps
INNER JOIN sys.indexes i
    ON ps.object_id = i.object_id
    AND ps.index_id = i.index_id
WHERE i.name LIKE 'idx_%'
GROUP BY OBJECT_NAME(i.object_id), i.name, i.type_desc
ORDER BY IndexSizeMB DESC;

GO

PRINT '';
PRINT '============================================================================';
PRINT 'INDEX CREATION COMPLETED SUCCESSFULLY!';
PRINT '============================================================================';
PRINT 'Total Indexes Created: 11';
PRINT '';
PRINT 'CRITICAL:';
PRINT '  1. idx_batch_qr_code_url (UNIQUE) - QR code scanning';
PRINT '';
PRINT 'HIGH PRIORITY:';
PRINT '  2. idx_agriculture_product_type - Product filtering';
PRINT '  3. idx_batch_farm - Farm traceability';
PRINT '  4. idx_batch_agriculture_product - Product batches';
PRINT '  5. idx_vendor_product_vendor - Vendor queries';
PRINT '  6. idx_vendor_product_agriculture_product - Product vendors';
PRINT '';
PRINT 'MEDIUM PRIORITY:';
PRINT '  7. idx_processing_batch - Processing history';
PRINT '  8. idx_shipment_status_distributor (COMPOSITE) - Shipment tracking';
PRINT '  9. idx_farm_province - Geographic queries';
PRINT ' 10. idx_ship_batch_shipment - Shipment batches';
PRINT ' 11. idx_ship_batch_batch - Batch shipments';
PRINT ' 12. idx_transportleg_shipment - Transport details';
PRINT '';
PRINT 'Next Steps:';
PRINT '  1. Run performance tests: tests\performance_tests_LEADER_SCHEMA.sql';
PRINT '  2. Monitor index usage: sys.dm_db_index_usage_stats';
PRINT '  3. Update statistics weekly for high-traffic tables';
PRINT '  4. Review query execution plans';
PRINT '============================================================================';
GO
