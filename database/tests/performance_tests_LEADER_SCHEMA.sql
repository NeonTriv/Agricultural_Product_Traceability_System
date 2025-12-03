-- ============================================================================
-- PERFORMANCE TESTING SCRIPT - LEADER SCHEMA VERSION
-- QR-Code Agricultural Product Traceability System
-- ============================================================================

USE Traceability;
GO

-- Enable execution time and I/O statistics
SET STATISTICS TIME ON;
SET STATISTICS IO ON;
GO

PRINT '';
PRINT '============================================================================';
PRINT 'PERFORMANCE TESTING - LEADER SCHEMA (FIXED)';
PRINT 'Agricultural Product Traceability System';
PRINT '============================================================================';
PRINT '';

-- ============================================================================
-- TEST CASE 1: QR Code Lookup (MOST CRITICAL) ⭐⭐⭐
-- ============================================================================
PRINT '============================================================================';
PRINT 'TEST CASE 1: QR Code Lookup Performance';
PRINT 'Query: Find batch by QR code (PRIMARY use case)';
PRINT '============================================================================';
PRINT '';

DBCC DROPCLEANBUFFERS;
DBCC FREEPROCCACHE;
GO

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
    -- Type & Category info
    cat.Name AS Category_Name, -- SỬA: Lấy tên Category thay vì t.Name
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
INNER JOIN CATEGORY cat ON t.C_ID = cat.ID -- THÊM: Join Category
INNER JOIN FARM f ON b.Farm_ID = f.ID
INNER JOIN PROVINCE pr ON f.P_ID = pr.ID
INNER JOIN COUNTRY c ON pr.C_ID = c.ID
WHERE b.Qr_Code_URL = 'BATCH_TEST_0000001'; -- Đổi thành mã QR thực tế trong data test

GO

-- ============================================================================
-- TEST CASE 2: Farm Batches Lookup
-- ============================================================================
PRINT '';
PRINT '============================================================================';
PRINT 'TEST CASE 2: Farm Batches Lookup';
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
WHERE b.Farm_ID = (SELECT TOP 1 ID FROM FARM); -- Lấy dynamic ID đầu tiên

GO

-- ============================================================================
-- TEST CASE 3: Products by Type
-- ============================================================================
PRINT '';
PRINT '============================================================================';
PRINT 'TEST CASE 3: Products by Type';
PRINT '============================================================================';
PRINT '';

DBCC DROPCLEANBUFFERS;
DBCC FREEPROCCACHE;
GO

SELECT
    ap.ID,
    ap.Name,
    ap.Image_URL,
    cat.Name AS Category_Name, -- SỬA: Lấy từ Category
    t.Variety,
    COUNT(b.ID) AS Total_Batches
FROM AGRICULTURE_PRODUCT ap
INNER JOIN [TYPE] t ON ap.T_ID = t.ID
INNER JOIN CATEGORY cat ON t.C_ID = cat.ID -- THÊM: Join Category
LEFT JOIN BATCH b ON b.AP_ID = ap.ID
WHERE cat.Name = 'Rice' -- Filter theo tên Category
GROUP BY ap.ID, ap.Name, ap.Image_URL, cat.Name, t.Variety;

GO

-- ============================================================================
-- TEST CASE 4: Vendor Product Pricing
-- ============================================================================
PRINT '';
PRINT '============================================================================';
PRINT 'TEST CASE 4: Vendor Product Pricing';
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
WHERE ap.ID = (SELECT TOP 1 ID FROM AGRICULTURE_PRODUCT);

GO

-- ============================================================================
-- TEST CASE 5: Processing History for Batch
-- ============================================================================
PRINT '';
PRINT '============================================================================';
PRINT 'TEST CASE 5: Processing History';
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
WHERE pr.Batch_ID = (SELECT TOP 1 Batch_ID FROM PROCESSING);

GO

-- ============================================================================
-- TEST CASE 6: Shipment Tracking
-- ============================================================================
PRINT '';
PRINT '============================================================================';
PRINT 'TEST CASE 6: Shipment Tracking';
PRINT '============================================================================';
PRINT '';

DBCC DROPCLEANBUFFERS;
DBCC FREEPROCCACHE;
GO

SELECT
    s.ID,
    s.Status,
    -- Đã xóa Departured_Time/Arrival_Time vì không còn trong SHIPMENT
    s.Destination,
    d.Type AS Distributor_Type,
    v.Name AS Distributor_Name
FROM SHIPMENT s
INNER JOIN DISTRIBUTOR d ON s.Distributor_TIN = d.Vendor_TIN
INNER JOIN VENDOR v ON d.Vendor_TIN = v.TIN
WHERE s.Status = 'In-Transit';

GO

-- ============================================================================
-- TEST CASE 7: Complete Traceability Query (COMPLEX)
-- ============================================================================
PRINT '';
PRINT '============================================================================';
PRINT 'TEST CASE 7: Complete Product Traceability';
PRINT '============================================================================';
PRINT '';

DBCC DROPCLEANBUFFERS;
DBCC FREEPROCCACHE;
GO

-- Simulates API query
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
    -- Type & Category
    cat.Name AS Category, -- SỬA: Lấy từ Category, bỏ t.Name
    t.Variety,
    -- Farm
    f.Name AS Farm_Name,
    f.Owner_Name,
    f.Contact_Info AS Farm_Contact,
    f.Longitude,
    f.Latitude,
    -- Province & Country
    pr.Name AS Province,
    co.Name AS Country,
    -- Farm Certifications
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
    pf.Address_detail AS Facility_Address, -- SỬA: Address -> Address_detail
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
WHERE b.Qr_Code_URL = 'BATCH_TEST_0000001'; -- Update mã test thực tế

GO

SET STATISTICS TIME OFF;
SET STATISTICS IO OFF;
GO
PRINT 'TESTS COMPLETED SUCCESSFULLY';