-- ============================================================================
-- FIX WAREHOUSE ENCODING ISSUES
-- Fixes the degree symbol encoding in Store_Condition column
-- ============================================================================

USE Traceability;
GO

PRINT 'Fixing warehouse encoding issues...';

-- Update warehouse 1
UPDATE WAREHOUSE
SET Store_Condition = N'Cold Storage -5°C to 5°C'
WHERE Address_detail = N'KCN Tan Tao, Binh Tan';

-- Update warehouse 3
UPDATE WAREHOUSE
SET Store_Condition = N'Cold Storage -20°C to 0°C'
WHERE Address_detail = N'KCN Long Hau, Long An';

PRINT 'Warehouse encoding fixed successfully!';

-- Verify the changes
SELECT ID, Store_Condition, Address_detail
FROM WAREHOUSE
WHERE Store_Condition LIKE N'%Cold Storage%'
ORDER BY ID;
GO
