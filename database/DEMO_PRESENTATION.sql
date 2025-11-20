-- ============================================================================
-- DEMO SCRIPT FOR PRESENTATION
-- Chạy các queries này khi trình bày để show thông tin database
-- ============================================================================

USE Traceability;
GO

PRINT '============================================================================';
PRINT 'DATABASE OPTIMIZATION PRESENTATION - DEMO SCRIPT';
PRINT '============================================================================';
PRINT '';

-- ============================================================================
-- SECTION 1: DATABASE OVERVIEW
-- ============================================================================

PRINT '============================================================================';
PRINT '1. DATABASE OVERVIEW - Data Volume';
PRINT '============================================================================';
PRINT '';
GO

SELECT
    t.name AS TableName,
    p.rows AS RowCount,
    CAST((SUM(a.total_pages) * 8.0 / 1024.0) AS DECIMAL(10,2)) AS SizeMB
FROM sys.tables t
INNER JOIN sys.indexes i ON t.object_id = i.object_id
INNER JOIN sys.partitions p ON i.object_id = p.object_id AND i.index_id = p.index_id
INNER JOIN sys.allocation_units a ON p.partition_id = a.container_id
WHERE t.is_ms_shipped = 0
  AND i.index_id <= 1  -- Only clustered or heap
GROUP BY t.name, p.rows
ORDER BY p.rows DESC;

PRINT '';
PRINT '📊 Key Points:';
PRINT '  - BATCH table: ~10,000 rows (main test table)';
PRINT '  - SHIPMENT table: ~150+ rows (composite index test)';
PRINT '  - Multiple supporting tables with relationships';
PRINT '';

-- ============================================================================
-- SECTION 2: INDEXES IMPLEMENTED
-- ============================================================================

PRINT '============================================================================';
PRINT '2. INDEXES IMPLEMENTED';
PRINT '============================================================================';
PRINT '';

SELECT
    OBJECT_NAME(i.object_id) AS TableName,
    i.name AS IndexName,
    i.type_desc AS IndexType,
    i.is_unique AS IsUnique,
    STUFF((
        SELECT ', ' + c.name
        FROM sys.index_columns ic
        INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
        WHERE ic.object_id = i.object_id
          AND ic.index_id = i.index_id
          AND ic.is_included_column = 0
        ORDER BY ic.key_ordinal
        FOR XML PATH('')
    ), 1, 2, '') AS KeyColumns,
    STUFF((
        SELECT ', ' + c.name
        FROM sys.index_columns ic
        INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
        WHERE ic.object_id = i.object_id
          AND ic.index_id = i.index_id
          AND ic.is_included_column = 1
        FOR XML PATH('')
    ), 1, 2, '') AS IncludedColumns
FROM sys.indexes i
WHERE i.name LIKE 'idx_%'
  AND i.object_id IN (SELECT object_id FROM sys.tables WHERE is_ms_shipped = 0)
ORDER BY OBJECT_NAME(i.object_id), i.name;

PRINT '';
PRINT '🔑 Key Indexes for Demo:';
PRINT '  1. idx_batch_qr_code_url (UNIQUE) - Test Case 1';
PRINT '  2. idx_batch_harvest_date_test - Query Optimization';
PRINT '  3. idx_shipment_status_distributor (COMPOSITE) - Test Case 2';
PRINT '';

-- ============================================================================
-- SECTION 3: INDEX USAGE STATISTICS
-- ============================================================================

PRINT '============================================================================';
PRINT '3. INDEX USAGE STATISTICS (Test Case 3)';
PRINT '============================================================================';
PRINT '';

SELECT
    OBJECT_NAME(s.object_id) AS TableName,
    i.name AS IndexName,
    i.type_desc AS IndexType,
    s.user_seeks AS Seeks,
    s.user_scans AS Scans,
    s.user_lookups AS Lookups,
    (s.user_seeks + s.user_scans + s.user_lookups) AS TotalReads,
    s.last_user_seek AS LastSeek,
    CASE
        WHEN s.user_seeks + s.user_scans + s.user_lookups = 0 THEN 'UNUSED'
        WHEN s.user_seeks > 50 THEN 'HIGHLY USED'
        WHEN s.user_seeks > 10 THEN 'MODERATELY USED'
        ELSE 'LOW USAGE'
    END AS UsageStatus
FROM sys.dm_db_index_usage_stats s
INNER JOIN sys.indexes i ON s.object_id = i.object_id AND s.index_id = i.index_id
WHERE s.database_id = DB_ID()
  AND i.name LIKE 'idx_%'
ORDER BY TotalReads DESC, OBJECT_NAME(s.object_id), i.name;

PRINT '';
PRINT '📈 Insights:';
PRINT '  - All critical indexes show SEEKS (optimal)';
PRINT '  - Some indexes show SCANS (acceptable for small result sets)';
PRINT '  - Unused indexes identified for potential cleanup';
PRINT '';

-- ============================================================================
-- SECTION 4: QUERY OPTIMIZATION DEMO (Section 5.2)
-- ============================================================================

PRINT '============================================================================';
PRINT '4. QUERY OPTIMIZATION DEMO';
PRINT '============================================================================';
PRINT '';
PRINT 'Demonstrating SARGable vs Non-SARGable queries...';
PRINT '';

-- Show current date range in BATCH
SELECT
    MIN(Harvest_Date) AS EarliestHarvest,
    MAX(Harvest_Date) AS LatestHarvest,
    COUNT(*) AS TotalBatches
FROM BATCH;

PRINT '';
PRINT '🔍 Query 1 (NON-SARGABLE): Using MONTH() and YEAR() functions';
PRINT '   → Forces Clustered Index Scan (92% cost)';
PRINT '';

-- This query will be shown in execution plan during presentation
-- Don't run it here, just show the code
PRINT 'SELECT * FROM BATCH';
PRINT 'WHERE MONTH(Harvest_Date) = 10 AND YEAR(Harvest_Date) = 2025;';
PRINT '';
PRINT '❌ Problem: Function on indexed column prevents index usage';
PRINT '';

PRINT '✅ Query 2 (SARGABLE): Using date range comparison';
PRINT '   → Uses Index Seek (8% cost)';
PRINT '';
PRINT 'SELECT ID, Qr_Code_URL, Harvest_Date, Grade, Farm_ID, AP_ID';
PRINT 'FROM BATCH';
PRINT 'WHERE Harvest_Date >= ''2025-10-01'' AND Harvest_Date < ''2025-11-01'';';
PRINT '';
PRINT '✅ Result: 91.3% cost reduction (92% → 8%)';
PRINT '';

-- ============================================================================
-- SECTION 5: QR CODE LOOKUP DEMO (Test Case 1)
-- ============================================================================

PRINT '============================================================================';
PRINT '5. QR CODE LOOKUP DEMO (Test Case 1)';
PRINT '============================================================================';
PRINT '';

-- Show sample QR codes
PRINT 'Sample QR Codes in database:';
SELECT TOP 5
    ID,
    Qr_Code_URL,
    Harvest_Date,
    Grade
FROM BATCH
ORDER BY ID;

PRINT '';
PRINT 'Full QR Lookup Query (with JOINs):';
PRINT '';

-- Demo query (show execution plan during presentation)
SELECT
    b.ID,
    b.Qr_Code_URL,
    b.Harvest_Date,
    b.Grade,
    ap.Name AS Product_Name,
    f.Name AS Farm_Name,
    pr.Name AS Province
FROM BATCH b
INNER JOIN AGRICULTURE_PRODUCT ap ON b.AP_ID = ap.ID
INNER JOIN FARM f ON b.Farm_ID = f.ID
INNER JOIN PROVINCE pr ON f.P_ID = pr.ID
WHERE b.Qr_Code_URL = 'QR_BATCH_00001';

PRINT '';
PRINT '📊 Performance:';
PRINT '  BEFORE index: Index Scan (80% cost on BATCH)';
PRINT '  AFTER index:  Index Seek (25% cost, balanced across tables)';
PRINT '  Improvement:  68.75% cost reduction';
PRINT '';

-- ============================================================================
-- SECTION 6: COMPOSITE INDEX DEMO (Test Case 2)
-- ============================================================================

PRINT '============================================================================';
PRINT '6. COMPOSITE INDEX DEMO (Test Case 2)';
PRINT '============================================================================';
PRINT '';

-- Show shipment status distribution
PRINT 'Shipment Status Distribution:';
SELECT
    Status,
    Distributor_TIN,
    COUNT(*) AS ShipmentCount
FROM SHIPMENT
GROUP BY Status, Distributor_TIN
ORDER BY Status, Distributor_TIN;

PRINT '';
PRINT 'Composite Index Query:';
PRINT '';

-- Demo query
SELECT
    s.ID,
    s.Status,
    s.Departured_Time,
    s.Destination,
    s.Distributor_TIN
FROM SHIPMENT s
WHERE s.Status = 'In-Transit'
  AND s.Distributor_TIN = 'DIST001';

PRINT '';
PRINT '📊 Performance:';
PRINT '  BEFORE: Clustered Index Scan (full table scan)';
PRINT '  AFTER:  Index Seek on (Status, Distributor_TIN)';
PRINT '  Bonus:  Cardinality estimation improved (675% → 150%)';
PRINT '';

-- ============================================================================
-- SECTION 7: EXECUTION PLAN COMPARISON
-- ============================================================================

PRINT '============================================================================';
PRINT '7. HOW TO VIEW EXECUTION PLANS (For Demo)';
PRINT '============================================================================';
PRINT '';
PRINT 'Steps to show execution plans during presentation:';
PRINT '';
PRINT '1. Enable Execution Plan:';
PRINT '   - Press Ctrl+M (or click "Include Actual Execution Plan" icon)';
PRINT '';
PRINT '2. Run queries:';
PRINT '   - Query Optimization: Run both queries in one batch';
PRINT '   - QR Lookup: Show Index Scan vs Index Seek';
PRINT '   - Composite Index: Show Clustered Scan vs Index Seek';
PRINT '';
PRINT '3. Point out in execution plan:';
PRINT '   - Operation type: Scan vs Seek';
PRINT '   - Cost percentage (relative cost)';
PRINT '   - Estimated vs Actual rows';
PRINT '';

-- ============================================================================
-- SECTION 8: PERFORMANCE METRICS SUMMARY
-- ============================================================================

PRINT '============================================================================';
PRINT '8. PERFORMANCE METRICS SUMMARY';
PRINT '============================================================================';
PRINT '';

-- Create temp table for summary
CREATE TABLE #PerformanceSummary (
    TestCase VARCHAR(50),
    Metric VARCHAR(30),
    BeforeValue VARCHAR(50),
    AfterValue VARCHAR(50),
    Improvement VARCHAR(50)
);

INSERT INTO #PerformanceSummary VALUES
('Query Optimization', 'Query Cost', '92%', '8%', '91.3% reduction'),
('Query Optimization', 'Operation', 'Clustered Scan', 'Index Seek', 'Scan → Seek'),
('QR Code Lookup', 'BATCH Cost', '80%', '25%', '68.75% reduction'),
('QR Code Lookup', 'Execution Time', '11ms', '<1ms', '~91% faster'),
('QR Code Lookup', 'Operation', 'Index Scan', 'Index Seek', 'Scan → Seek'),
('Composite Index', 'Operation', 'Clustered Scan', 'Index Seek', 'Scan → Seek'),
('Composite Index', 'Cardinality Est.', '675% error', '150% error', '4.5× more accurate');

SELECT * FROM #PerformanceSummary
ORDER BY
    CASE TestCase
        WHEN 'Query Optimization' THEN 1
        WHEN 'QR Code Lookup' THEN 2
        WHEN 'Composite Index' THEN 3
    END,
    Metric;

DROP TABLE #PerformanceSummary;

PRINT '';
PRINT '✅ All performance goals achieved!';
PRINT '';

-- ============================================================================
-- SECTION 9: INDEX FRAGMENTATION (Bonus - if asked)
-- ============================================================================

PRINT '============================================================================';
PRINT '9. INDEX FRAGMENTATION (Bonus Info)';
PRINT '============================================================================';
PRINT '';

SELECT
    OBJECT_NAME(ips.object_id) AS TableName,
    i.name AS IndexName,
    ips.index_type_desc,
    ips.avg_fragmentation_in_percent AS FragmentationPercent,
    ips.page_count AS Pages,
    CASE
        WHEN ips.avg_fragmentation_in_percent < 10 THEN 'Good'
        WHEN ips.avg_fragmentation_in_percent < 30 THEN 'Reorganize Recommended'
        ELSE 'Rebuild Recommended'
    END AS Recommendation
FROM sys.dm_db_index_physical_stats(DB_ID(), NULL, NULL, NULL, 'LIMITED') ips
INNER JOIN sys.indexes i ON ips.object_id = i.object_id AND ips.index_id = i.index_id
WHERE i.name LIKE 'idx_%'
  AND ips.page_count > 8  -- Only indexes with more than 8 pages
ORDER BY ips.avg_fragmentation_in_percent DESC;

PRINT '';
PRINT 'Note: Fragmentation < 10% is healthy for most indexes';
PRINT '';

-- ============================================================================
-- SECTION 10: QUICK REFERENCE - Key Queries for Q&A
-- ============================================================================

PRINT '============================================================================';
PRINT '10. QUICK REFERENCE - Queries for Q&A Session';
PRINT '============================================================================';
PRINT '';
PRINT 'If asked "Show me the index on QR_Code_URL":';
PRINT '---';
PRINT 'sp_helpindex ''BATCH'';';
PRINT '';
PRINT 'If asked "How many QR codes in database":';
PRINT '---';
PRINT 'SELECT COUNT(DISTINCT Qr_Code_URL) FROM BATCH;';
PRINT '';
PRINT 'If asked "Show actual query performance":';
PRINT '---';
PRINT 'SET STATISTICS TIME ON;';
PRINT 'SET STATISTICS IO ON;';
PRINT '-- Run your query here';
PRINT 'SET STATISTICS TIME OFF;';
PRINT 'SET STATISTICS IO OFF;';
PRINT '';
PRINT 'If asked "What happens if we drop the index":';
PRINT '---';
PRINT '-- DO NOT actually drop during presentation!';
PRINT '-- Just show the DROP command and explain:';
PRINT 'DROP INDEX idx_batch_qr_code_url ON BATCH;';
PRINT '-- Result: Query falls back to Index Scan (slower)';
PRINT '';

-- ============================================================================
-- FINAL SUMMARY
-- ============================================================================

PRINT '============================================================================';
PRINT 'PRESENTATION SCRIPT COMPLETE';
PRINT '============================================================================';
PRINT '';
PRINT '📋 Checklist:';
PRINT '  ✓ Database has ~10,000 BATCH records';
PRINT '  ✓ All test indexes created';
PRINT '  ✓ Index usage statistics available';
PRINT '  ✓ Sample queries ready';
PRINT '';
PRINT '🎯 Key Messages:';
PRINT '  1. Query Optimization: Write SARGable queries (91.3% improvement)';
PRINT '  2. QR Code Index: Critical for real-time scanning (68.75% improvement)';
PRINT '  3. Composite Index: Multi-column filtering + better cardinality';
PRINT '  4. Index Monitoring: Regular review to find unused indexes';
PRINT '';
PRINT '💡 Demo Tips:';
PRINT '  - Show execution plans (Ctrl+M)';
PRINT '  - Point out Scan vs Seek operations';
PRINT '  - Highlight cost percentages';
PRINT '  - Mention cardinality estimation improvements';
PRINT '';
PRINT 'Good luck with your presentation! 🚀';
PRINT '============================================================================';
GO
