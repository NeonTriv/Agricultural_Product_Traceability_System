-- ============================================================================
-- BIG DATA INDEXES - Optimized.
-- ============================================================================


USE Traceability;
GO

SET QUOTED_IDENTIFIER ON;

PRINT '========================================';
PRINT 'CREATING BIG DATA INDEXES';
PRINT '========================================';
PRINT '';

-- ============================================================================
-- INDEX 1: Composite Index for Common Filters
-- ============================================================================
PRINT '1. Creating composite index for Created_By + Date filtering...';

IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_BATCH_CreatedBy_Date_ID')
    DROP INDEX IX_BATCH_CreatedBy_Date_ID ON BATCH;

CREATE NONCLUSTERED INDEX IX_BATCH_CreatedBy_Date_ID
ON BATCH(Created_By, Harvest_Date, ID);

PRINT '   ✓ Created: IX_BATCH_CreatedBy_Date_ID';
PRINT '   Purpose: Fast filtering by user and date range';
PRINT '   Query pattern: WHERE Created_By = ? AND Harvest_Date >= ?';
PRINT '';

-- ============================================================================
-- INDEX 2: Covering Index for Dashboard Queries
-- ============================================================================
PRINT '2. Creating covering index for dashboard...';

IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_BATCH_Dashboard')
    DROP INDEX IX_BATCH_Dashboard ON BATCH;

CREATE NONCLUSTERED INDEX IX_BATCH_Dashboard
ON BATCH(Harvest_Date DESC, Grade)
INCLUDE (ID, Qr_Code_URL, Created_By, AP_ID);

PRINT '   ✓ Created: IX_BATCH_Dashboard';
PRINT '   Purpose: Dashboard queries without key lookup';
PRINT '   Query pattern: Recent batches with all display fields';
PRINT '';

-- ============================================================================
-- INDEX 3: Filtered Index for Active Grades
-- ============================================================================
PRINT '3. Creating filtered index for active grades...';

IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_BATCH_ActiveGrades')
    DROP INDEX IX_BATCH_ActiveGrades ON BATCH;

CREATE NONCLUSTERED INDEX IX_BATCH_ActiveGrades
ON BATCH(Grade, Harvest_Date DESC)
INCLUDE (ID, Qr_Code_URL, Created_By)
WHERE Grade IN ('A', 'B', 'C'); -- Only index good grades

PRINT '   ✓ Created: IX_BATCH_ActiveGrades';
PRINT '   Purpose: Smaller index for quality batches';
PRINT '   Coverage: ~60% of records (grades A, B, C only)';
PRINT '';

-- ============================================================================
-- INDEX 4: Index for QR Code Lookups
-- ============================================================================
PRINT '4. Creating index for QR code lookups...';

IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_BATCH_QrCode')
    DROP INDEX IX_BATCH_QrCode ON BATCH;

CREATE NONCLUSTERED INDEX IX_BATCH_QrCode
ON BATCH(Qr_Code_URL)
INCLUDE (ID, Harvest_Date, Grade, Created_By);

PRINT '   ✓ Created: IX_BATCH_QrCode';
PRINT '   Purpose: Fast QR code scanning lookup';
PRINT '   Query pattern: WHERE Qr_Code_URL = ?';
PRINT '';

-- ============================================================================
-- INDEX 5: Index for Product-Based Queries
-- ============================================================================
PRINT '5. Creating index for product filtering...';

IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_BATCH_Product')
    DROP INDEX IX_BATCH_Product ON BATCH;

CREATE NONCLUSTERED INDEX IX_BATCH_Product
ON BATCH(AP_ID, Harvest_Date DESC)
INCLUDE (ID, Qr_Code_URL, Grade);

PRINT '   ✓ Created: IX_BATCH_Product';
PRINT '   Purpose: View all batches for specific product';
PRINT '   Query pattern: WHERE AP_ID = ?';
PRINT '';

-- ============================================================================
-- INDEX 6: Composite Index for Pagination Queries
-- ============================================================================
PRINT '6. Creating index optimized for cursor pagination...';

IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_BATCH_Pagination')
    DROP INDEX IX_BATCH_Pagination ON BATCH;

CREATE NONCLUSTERED INDEX IX_BATCH_Pagination
ON BATCH(ID, Created_By, Harvest_Date)
INCLUDE (Qr_Code_URL, Grade);

PRINT '   ✓ Created: IX_BATCH_Pagination';
PRINT '   Purpose: Optimized for WHERE ID > @lastId queries';
PRINT '   Query pattern: Cursor-based pagination with filters';
PRINT '';

-- ============================================================================
-- INDEX STATISTICS
-- ============================================================================
PRINT '';
PRINT '========================================';
PRINT 'INDEX STATISTICS';
PRINT '========================================';
PRINT '';

SELECT
    i.name AS Index_Name,
    i.type_desc AS Index_Type,
    ps.row_count AS Row_Count,
    CAST(ps.reserved_page_count * 8.0 / 1024 AS DECIMAL(10,2)) AS Size_MB
FROM sys.indexes i
INNER JOIN sys.dm_db_partition_stats ps
    ON i.object_id = ps.object_id
    AND i.index_id = ps.index_id
WHERE i.object_id = OBJECT_ID('BATCH')
ORDER BY ps.reserved_page_count DESC;

PRINT '';

-- ============================================================================
-- UPDATE STATISTICS
-- ============================================================================
PRINT '========================================';
PRINT 'UPDATING STATISTICS';
PRINT '========================================';
PRINT '';

UPDATE STATISTICS BATCH WITH FULLSCAN;

PRINT '✓ Statistics updated for BATCH table';
PRINT '';

-- ============================================================================
-- TESTING INDEXES
-- ============================================================================
PRINT '';
PRINT '========================================';
PRINT 'INDEX USAGE EXAMPLES';
PRINT '========================================';
PRINT '';

-- Test 1: Cursor pagination with filter
PRINT 'Test 1: Cursor pagination (uses IX_BATCH_CreatedBy_Date_ID)';
PRINT 'Query:';
PRINT '  SELECT TOP 50 * FROM BATCH';
PRINT '  WHERE Created_By = ''System''';
PRINT '    AND Harvest_Date >= DATEADD(DAY, -7, GETDATE())';
PRINT '    AND ID > 0';
PRINT '  ORDER BY ID';
PRINT '';

-- Test 2: Dashboard query
PRINT 'Test 2: Dashboard (uses IX_BATCH_Dashboard)';
PRINT 'Query:';
PRINT '  SELECT ID, Qr_Code_URL, Grade, Created_By';
PRINT '  FROM BATCH';
PRINT '  WHERE Harvest_Date >= DATEADD(DAY, -30, GETDATE())';
PRINT '  ORDER BY Harvest_Date DESC';
PRINT '';

-- Test 3: QR code scan
PRINT 'Test 3: QR Scan (uses IX_BATCH_QrCode)';
PRINT 'Query:';
PRINT '  SELECT * FROM BATCH';
PRINT '  WHERE Qr_Code_URL = ''BATCH_0123456''';
PRINT '';

-- Test 4: Product batches
PRINT 'Test 4: Product Batches (uses IX_BATCH_Product)';
PRINT 'Query:';
PRINT '  SELECT ID, Qr_Code_URL, Grade';
PRINT '  FROM BATCH';
PRINT '  WHERE AP_ID = 1';
PRINT '  ORDER BY Harvest_Date DESC';
PRINT '';

-- ============================================================================
-- MONITORING INDEX USAGE
-- ============================================================================
PRINT '';
PRINT '========================================';
PRINT 'MONITORING QUERIES';
PRINT '========================================';
PRINT '';
PRINT 'To monitor index usage, run:';
PRINT '';
PRINT '-- See which indexes are being used';
PRINT 'SELECT';
PRINT '    i.name,';
PRINT '    s.user_seeks,';
PRINT '    s.user_scans,';
PRINT '    s.user_lookups,';
PRINT '    s.user_updates';
PRINT 'FROM sys.dm_db_index_usage_stats s';
PRINT 'INNER JOIN sys.indexes i ON s.object_id = i.object_id';
PRINT '    AND s.index_id = i.index_id';
PRINT 'WHERE s.database_id = DB_ID()';
PRINT '  AND i.object_id = OBJECT_ID(''BATCH'')';
PRINT 'ORDER BY s.user_seeks DESC;';
PRINT '';
PRINT '-- See missing indexes (suggested by SQL Server)';
PRINT 'SELECT';
PRINT '    mid.statement AS Table_Name,';
PRINT '    migs.avg_user_impact AS Avg_Impact,';
PRINT '    mid.equality_columns,';
PRINT '    mid.inequality_columns,';
PRINT '    mid.included_columns';
PRINT 'FROM sys.dm_db_missing_index_details mid';
PRINT 'INNER JOIN sys.dm_db_missing_index_groups mig';
PRINT '    ON mid.index_handle = mig.index_handle';
PRINT 'INNER JOIN sys.dm_db_missing_index_group_stats migs';
PRINT '    ON mig.index_group_handle = migs.group_handle';
PRINT 'WHERE mid.database_id = DB_ID()';
PRINT '  AND mid.statement LIKE ''%BATCH%''';
PRINT 'ORDER BY migs.avg_user_impact DESC;';
PRINT '';

-- ============================================================================
-- MAINTENANCE RECOMMENDATIONS
-- ============================================================================
PRINT '';
PRINT '========================================';
PRINT 'MAINTENANCE RECOMMENDATIONS';
PRINT '========================================';
PRINT '';
PRINT '1. Rebuild indexes monthly (for 1M+ records):';
PRINT '   ALTER INDEX ALL ON BATCH REBUILD WITH (ONLINE = ON);';
PRINT '';
PRINT '2. Update statistics weekly:';
PRINT '   UPDATE STATISTICS BATCH WITH FULLSCAN;';
PRINT '';
PRINT '3. Monitor fragmentation:';
PRINT '   SELECT * FROM sys.dm_db_index_physical_stats(';
PRINT '       DB_ID(), OBJECT_ID(''BATCH''), NULL, NULL, ''DETAILED'');';
PRINT '';
PRINT '4. Remove unused indexes:';
PRINT '   - Check sys.dm_db_index_usage_stats';
PRINT '   - Drop indexes with 0 seeks/scans after 1 month';
PRINT '';

PRINT '';
PRINT '========================================';
PRINT 'INDEX CREATION COMPLETED!';
PRINT '========================================';
PRINT '';
PRINT 'Next steps:';
PRINT '1. Run test_performance_comparison.sql';
PRINT '2. Compare query times with/without indexes';
PRINT '3. Check execution plans';
PRINT '';
GO
