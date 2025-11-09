-- ============================================================================
-- PERFORMANCE TESTING SCRIPT - LEADER SCHEMA VERSION
-- QR-Code Agricultural Product Traceability System
-- ============================================================================
-- Purpose: Measure query performance for Leader's schema (BTL.sql)
-- How to use:
--   1. Run tests WITHOUT indexes first (baseline)
--   2. Record results
--   3. Create indexes using create_indexes_LEADER_SCHEMA.sql
--   4. Run tests again WITH indexes
--   5. Compare improvement
-- ============================================================================

USE Traceability;
GO

-- Enable execution time and I/O statistics
SET STATISTICS TIME ON;
SET STATISTICS IO ON;
GO

PRINT '';
PRINT '============================================================================';
PRINT 'PERFORMANCE TESTING - LEADER SCHEMA';
PRINT 'Agricultural Product Traceability System';
PRINT '============================================================================';
PRINT '';

-- ============================================================================
-- TEST CASE 1: QR Code Lookup (MOST CRITICAL) ⭐⭐⭐
-- ============================================================================
PRINT '============================================================================';
PRINT 'TEST CASE 1: QR Code Lookup Performance';
PRINT 'Query: Find batch by QR code (PRIMARY use case)';
PRINT 'Expected: 90%+ improvement with index';
PRINT '============================================================================';
PRINT '';

-- Clear cache for accurate testing
DBCC DROPCLEANBUFFERS;
DBCC FREEPROCCACHE;
GO

-- Test query: Full product trace by QR code
SELECT
    -- Batch info
    b.ID AS Batch_ID,
    b.Qr_Code_URL,
    b.Harvest_Date,
    b.Grade,
    b.Created_By,
    -- Agriculture Product info
    ap.Name AS Product_Name,
    ap.Image_URL,
    -- Type info
    t.Name AS Product_Type,
    t.Variety,
    -- Farm info
    f.Name AS Farm_Name,
    f.Owner_Name,
    f.Contact_Info AS Farm_Contact,
    -- Province & Country
    pr.Name AS Province,
    c.Name AS Country
FROM BATCH b
INNER JOIN AGRICULTURE_PRODUCT ap ON b.AP_ID = ap.ID
INNER JOIN [TYPE] t ON ap.T_ID = t.ID
INNER JOIN FARM f ON b.Farm_ID = f.ID
INNER JOIN PROVINCE pr ON f.P_ID = pr.ID
INNER JOIN COUNTRY c ON pr.C_ID = c.ID
WHERE b.Qr_Code_URL = 'QR_BATCH_001';  -- Replace with actual QR code

PRINT '';
PRINT '---';
PRINT 'Interpretation:';
PRINT '  - CPU time: Lower is better';
PRINT '  - Elapsed time: User-perceived latency';
PRINT '  - Logical reads: Number of pages read (lower = better)';
PRINT '  - Scan count: 0 = Index Seek (good), >0 = Scan (bad)';
PRINT '';
GO

-- ============================================================================
-- TEST CASE 2: All Batches from a Farm
-- ============================================================================
PRINT '';
PRINT '============================================================================';
PRINT 'TEST CASE 2: Farm Batches Lookup';
PRINT 'Query: Find all batches from a specific farm';
PRINT 'Use case: Farm traceability, admin dashboard';
PRINT '============================================================================';
PRINT '';

DBCC DROPCLEANBUFFERS;
DBCC FREEPROCCACHE;
GO

SELECT
    b.ID,
    b.Qr_Code_URL,
    b.Harvest_Date,
    b.Grade,
    ap.Name AS Product_Name,
    f.Name AS Farm_Name
FROM BATCH b
INNER JOIN AGRICULTURE_PRODUCT ap ON b.AP_ID = ap.ID
INNER JOIN FARM f ON b.Farm_ID = f.ID
WHERE b.Farm_ID = 1;  -- Replace with actual Farm ID

GO

-- ============================================================================
-- TEST CASE 3: Products by Type
-- ============================================================================
PRINT '';
PRINT '============================================================================';
PRINT 'TEST CASE 3: Products by Type';
PRINT 'Query: Find all products of a specific type';
PRINT 'Use case: Product catalog, filtering';
PRINT '============================================================================';
PRINT '';

DBCC DROPCLEANBUFFERS;
DBCC FREEPROCCACHE;
GO

SELECT
    ap.ID,
    ap.Name,
    ap.Image_URL,
    t.Name AS Type_Name,
    t.Variety,
    COUNT(b.ID) AS Total_Batches
FROM AGRICULTURE_PRODUCT ap
INNER JOIN [TYPE] t ON ap.T_ID = t.ID
LEFT JOIN BATCH b ON b.AP_ID = ap.ID
WHERE ap.T_ID = 1  -- Replace with actual Type ID
GROUP BY ap.ID, ap.Name, ap.Image_URL, t.Name, t.Variety;

GO

-- ============================================================================
-- TEST CASE 4: Vendor Product Pricing
-- ============================================================================
PRINT '';
PRINT '============================================================================';
PRINT 'TEST CASE 4: Vendor Product Pricing';
PRINT 'Query: Get all products with prices from vendors';
PRINT 'Use case: Product listing page, price comparison';
PRINT '============================================================================';
PRINT '';

DBCC DROPCLEANBUFFERS;
DBCC FREEPROCCACHE;
GO

SELECT
    ap.Name AS Product_Name,
    v.Name AS Vendor_Name,
    vp.Unit,
    p.Value AS Price,
    p.Currency
FROM VENDOR_PRODUCT vp
INNER JOIN AGRICULTURE_PRODUCT ap ON vp.AP_ID = ap.ID
INNER JOIN VENDOR v ON vp.Vendor_TIN = v.TIN
INNER JOIN PRICE p ON vp.ID = p.V_ID
WHERE ap.ID = 1;  -- Replace with actual Product ID

GO

-- ============================================================================
-- TEST CASE 5: Processing History for Batch
-- ============================================================================
PRINT '';
PRINT '============================================================================';
PRINT 'TEST CASE 5: Processing History';
PRINT 'Query: Get processing details for a batch';
PRINT 'Use case: Product detail page, traceability';
PRINT '============================================================================';
PRINT '';

DBCC DROPCLEANBUFFERS;
DBCC FREEPROCCACHE;
GO

SELECT
    pr.ID AS Processing_ID,
    pr.Processing_Date,
    pr.Packaging_Date,
    pr.Processed_By,
    pr.Packaging_Type,
    pr.Weight_per_unit,
    pf.Name AS Facility_Name,
    pf.License_Number
FROM PROCESSING pr
INNER JOIN PROCESSING_FACILITY pf ON pr.Facility_ID = pf.ID
WHERE pr.Batch_ID = 1;  -- Replace with actual Batch ID

GO

-- ============================================================================
-- TEST CASE 6: Shipment Tracking (Composite Index Test)
-- ============================================================================
PRINT '';
PRINT '============================================================================';
PRINT 'TEST CASE 6: Shipment Tracking';
PRINT 'Query: Find shipments by status and distributor';
PRINT 'Use case: Admin dashboard, logistics tracking';
PRINT '============================================================================';
PRINT '';

DBCC DROPCLEANBUFFERS;
DBCC FREEPROCCACHE;
GO

SELECT
    s.ID,
    s.Status,
    s.Departured_Time,
    s.Arrival_Time,
    s.Destination,
    d.Type AS Distributor_Type,
    v.Name AS Distributor_Name
FROM SHIPMENT s
INNER JOIN DISTRIBUTOR d ON s.Distributor_TIN = d.Vendor_TIN
INNER JOIN VENDOR v ON d.Vendor_TIN = v.TIN
WHERE s.Status = 'In-Transit'
  AND s.Distributor_TIN = 'DIST001';  -- Replace with actual TIN

GO

-- ============================================================================
-- TEST CASE 7: Complete Traceability Query (COMPLEX)
-- ============================================================================
PRINT '';
PRINT '============================================================================';
PRINT 'TEST CASE 7: Complete Product Traceability';
PRINT 'Query: Full trace from QR code to all details';
PRINT 'Use case: Mobile app product info page (most realistic)';
PRINT '============================================================================';
PRINT '';

DBCC DROPCLEANBUFFERS;
DBCC FREEPROCCACHE;
GO

-- This simulates the actual API query when scanning QR code
SELECT
    -- Batch
    b.ID AS Batch_ID,
    b.Qr_Code_URL,
    b.Harvest_Date,
    b.Grade,
    b.Seed_Batch,
    b.Created_By,
    -- Product
    ap.Name AS Product_Name,
    ap.Image_URL AS Product_Image,
    -- Type
    t.Name AS Type_Name,
    t.Variety,
    cat.Name AS Category,
    -- Farm
    f.Name AS Farm_Name,
    f.Owner_Name,
    f.Contact_Info AS Farm_Contact,
    f.Longitude,
    f.Latitude,
    -- Province & Country
    pr.Name AS Province,
    co.Name AS Country,
    -- Farm Certifications (concatenated)
    STUFF((
        SELECT ', ' + fc.FarmCertifications
        FROM FARM_CERTIFICATIONS fc
        WHERE fc.F_ID = f.ID
        FOR XML PATH('')
    ), 1, 2, '') AS Certifications,
    -- Processing
    proc.Processing_Date,
    proc.Packaging_Date,
    proc.Processed_By,
    proc.Packaging_Type,
    proc.Weight_per_unit,
    -- Processing Facility
    pf.Name AS Facility_Name,
    pf.Address AS Facility_Address,
    pf.License_Number
FROM BATCH b
INNER JOIN AGRICULTURE_PRODUCT ap ON b.AP_ID = ap.ID
INNER JOIN [TYPE] t ON ap.T_ID = t.ID
INNER JOIN CATEGORY cat ON t.C_ID = cat.ID
INNER JOIN FARM f ON b.Farm_ID = f.ID
INNER JOIN PROVINCE pr ON f.P_ID = pr.ID
INNER JOIN COUNTRY co ON pr.C_ID = co.ID
LEFT JOIN PROCESSING proc ON proc.Batch_ID = b.ID
LEFT JOIN PROCESSING_FACILITY pf ON proc.Facility_ID = pf.ID
WHERE b.Qr_Code_URL = 'QR_BATCH_001';

GO

-- ============================================================================
-- INDEX USAGE ANALYSIS
-- ============================================================================
PRINT '';
PRINT '============================================================================';
PRINT 'INDEX USAGE STATISTICS';
PRINT 'Shows how many times each index has been used';
PRINT '============================================================================';
PRINT '';

SELECT
    DB_NAME() AS DatabaseName,
    OBJECT_SCHEMA_NAME(s.object_id) + '.' + OBJECT_NAME(s.object_id) AS TableName,
    i.name AS IndexName,
    i.type_desc AS IndexType,
    s.user_seeks AS UserSeeks,
    s.user_scans AS UserScans,
    s.user_lookups AS UserLookups,
    s.user_updates AS UserUpdates,
    s.last_user_seek AS LastSeek,
    s.last_user_scan AS LastScan,
    CASE
        WHEN s.user_seeks + s.user_scans + s.user_lookups = 0
        THEN 'UNUSED - Consider dropping'
        WHEN s.user_seeks > 100
        THEN 'HIGHLY USED - Keep'
        ELSE 'MODERATELY USED'
    END AS UsageStatus
FROM sys.dm_db_index_usage_stats s
INNER JOIN sys.indexes i
    ON s.object_id = i.object_id
    AND s.index_id = i.index_id
WHERE s.database_id = DB_ID()
  AND i.name LIKE 'idx_%'
ORDER BY (s.user_seeks + s.user_scans + s.user_lookups) DESC;

GO

-- ============================================================================
-- MISSING INDEX RECOMMENDATIONS
-- ============================================================================
PRINT '';
PRINT '============================================================================';
PRINT 'MISSING INDEX RECOMMENDATIONS';
PRINT 'SQL Server suggestions for additional indexes';
PRINT '============================================================================';
PRINT '';

SELECT TOP 10
    DB_NAME(mid.database_id) AS DatabaseName,
    OBJECT_NAME(mid.object_id) AS TableName,
    mid.equality_columns AS EqualityColumns,
    mid.inequality_columns AS InequalityColumns,
    mid.included_columns AS IncludedColumns,
    migs.avg_total_user_cost AS AvgQueryCost,
    migs.avg_user_impact AS AvgImpactPercent,
    migs.user_seeks AS UserSeeks,
    migs.user_scans AS UserScans,
    'CREATE NONCLUSTERED INDEX idx_' + OBJECT_NAME(mid.object_id) + '_suggested' +
    ' ON ' + OBJECT_SCHEMA_NAME(mid.object_id) + '.' + OBJECT_NAME(mid.object_id) +
    ' (' + ISNULL(mid.equality_columns, '') + ISNULL(mid.inequality_columns, '') + ')' +
    ISNULL(' INCLUDE (' + mid.included_columns + ')', '') AS CreateIndexStatement
FROM sys.dm_db_missing_index_details mid
INNER JOIN sys.dm_db_missing_index_groups mig
    ON mid.index_handle = mig.index_handle
INNER JOIN sys.dm_db_missing_index_group_stats migs
    ON mig.index_group_handle = migs.group_handle
WHERE mid.database_id = DB_ID()
ORDER BY migs.avg_user_impact DESC;

GO

-- ============================================================================
-- INDEX FRAGMENTATION ANALYSIS
-- ============================================================================
PRINT '';
PRINT '============================================================================';
PRINT 'INDEX FRAGMENTATION REPORT';
PRINT 'Identifies indexes that need maintenance';
PRINT '============================================================================';
PRINT '';

SELECT
    OBJECT_SCHEMA_NAME(ips.object_id) + '.' + OBJECT_NAME(ips.object_id) AS TableName,
    i.name AS IndexName,
    ips.index_type_desc AS IndexType,
    ips.avg_fragmentation_in_percent AS FragmentationPercent,
    ips.page_count AS PageCount,
    CASE
        WHEN ips.avg_fragmentation_in_percent > 30 AND ips.page_count > 100
        THEN 'REBUILD INDEX'
        WHEN ips.avg_fragmentation_in_percent > 10 AND ips.page_count > 100
        THEN 'REORGANIZE INDEX'
        ELSE 'OK'
    END AS Recommendation,
    CASE
        WHEN ips.avg_fragmentation_in_percent > 30 AND ips.page_count > 100
        THEN 'ALTER INDEX [' + i.name + '] ON [' + OBJECT_SCHEMA_NAME(ips.object_id) + '].[' + OBJECT_NAME(ips.object_id) + '] REBUILD;'
        WHEN ips.avg_fragmentation_in_percent > 10 AND ips.page_count > 100
        THEN 'ALTER INDEX [' + i.name + '] ON [' + OBJECT_SCHEMA_NAME(ips.object_id) + '].[' + OBJECT_NAME(ips.object_id) + '] REORGANIZE;'
        ELSE NULL
    END AS MaintenanceCommand
FROM sys.dm_db_index_physical_stats(DB_ID(), NULL, NULL, NULL, 'LIMITED') ips
INNER JOIN sys.indexes i
    ON ips.object_id = i.object_id
    AND ips.index_id = i.index_id
WHERE ips.page_count > 100
  AND i.name IS NOT NULL
ORDER BY ips.avg_fragmentation_in_percent DESC;

GO

-- ============================================================================
-- PERFORMANCE COMPARISON TEMPLATE
-- ============================================================================
PRINT '';
PRINT '============================================================================';
PRINT 'PERFORMANCE COMPARISON TEMPLATE';
PRINT 'Record your BEFORE and AFTER results here';
PRINT '============================================================================';
PRINT '';
PRINT 'TEST CASE 1: QR Code Lookup (CRITICAL)';
PRINT '  BEFORE INDEX:';
PRINT '    CPU time:        ____ ms';
PRINT '    Elapsed time:    ____ ms';
PRINT '    Logical reads:   ____ pages';
PRINT '    Scan type:       Table Scan';
PRINT '  AFTER INDEX:';
PRINT '    CPU time:        ____ ms';
PRINT '    Elapsed time:    ____ ms';
PRINT '    Logical reads:   ____ pages';
PRINT '    Scan type:       Index Seek';
PRINT '  IMPROVEMENT:       ____% faster';
PRINT '';
PRINT 'TEST CASE 2: Farm Batches Lookup';
PRINT '  BEFORE: ____ ms | AFTER: ____ ms | IMPROVEMENT: ____%';
PRINT '';
PRINT 'TEST CASE 3: Products by Type';
PRINT '  BEFORE: ____ ms | AFTER: ____ ms | IMPROVEMENT: ____%';
PRINT '';
PRINT 'TEST CASE 4: Vendor Pricing';
PRINT '  BEFORE: ____ ms | AFTER: ____ ms | IMPROVEMENT: ____%';
PRINT '';
PRINT 'TEST CASE 5: Processing History';
PRINT '  BEFORE: ____ ms | AFTER: ____ ms | IMPROVEMENT: ____%';
PRINT '';
PRINT 'TEST CASE 6: Shipment Tracking';
PRINT '  BEFORE: ____ ms | AFTER: ____ ms | IMPROVEMENT: ____%';
PRINT '';
PRINT 'TEST CASE 7: Complete Traceability (Complex)';
PRINT '  BEFORE: ____ ms | AFTER: ____ ms | IMPROVEMENT: ____%';
PRINT '';
PRINT '============================================================================';

-- Disable statistics
SET STATISTICS TIME OFF;
SET STATISTICS IO OFF;
GO

PRINT '';
PRINT '============================================================================';
PRINT 'PERFORMANCE TESTS COMPLETED';
PRINT '============================================================================';
PRINT '';
PRINT 'Next Steps:';
PRINT '  1. Review the output above';
PRINT '  2. Record BEFORE and AFTER metrics';
PRINT '  3. Calculate improvement percentages';
PRINT '  4. Share results with team leader';
PRINT '';
PRINT 'Expected Improvements:';
PRINT '  - QR Code Lookup: 90-95% faster';
PRINT '  - Farm Queries: 80-90% faster';
PRINT '  - Product Queries: 70-85% faster';
PRINT '  - Complex Joins: 85-90% faster';
PRINT '============================================================================';
GO
