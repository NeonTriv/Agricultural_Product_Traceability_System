USE Traceability;
GO

SET NOCOUNT ON;
PRINT 'Creating Performance Indexes...     ';
PRINT '';

-- 1. QR Code Lookup 
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('BATCH') AND name = 'idx_batch_qr_code_url')
BEGIN
    PRINT '  Creating idx_batch_qr_code_url...';
    CREATE UNIQUE NONCLUSTERED INDEX idx_batch_qr_code_url
    ON BATCH (Qr_Code_URL)
    INCLUDE (ID, Harvest_Date, Grade, Farm_ID, AP_ID, Created_By);
    PRINT ' Done';
END
ELSE
    PRINT ' idx_batch_qr_code_url already exists';

-- 2. Farm Traceability
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('BATCH') AND name = 'idx_batch_farm')
BEGIN
    PRINT '   Creating idx_batch_farm...';
    CREATE NONCLUSTERED INDEX idx_batch_farm
    ON BATCH (Farm_ID)
    INCLUDE (ID, Harvest_Date, Grade, Qr_Code_URL, AP_ID);
    PRINT '   Done';
END
ELSE
    PRINT '  idx_batch_farm already exists';

-- 3. Batch by Product
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('BATCH') AND name = 'idx_batch_agriculture_product')
BEGIN
    PRINT '  Creating idx_batch_agriculture_product...';
    CREATE NONCLUSTERED INDEX idx_batch_agriculture_product
    ON BATCH (AP_ID)
    INCLUDE (ID, Harvest_Date, Grade, Farm_ID, Qr_Code_URL);
    PRINT '    Done';
END
ELSE
    PRINT '  idx_batch_agriculture_product already exists';

-- 4. Product Type Filtering
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('AGRICULTURE_PRODUCT') AND name = 'idx_agriculture_product_type')
BEGIN
    PRINT '   Creating idx_agriculture_product_type...';
    CREATE NONCLUSTERED INDEX idx_agriculture_product_type
    ON AGRICULTURE_PRODUCT (T_ID)
    INCLUDE (ID, Name, Image_URL);
    PRINT '   Done';
END
ELSE
    PRINT '   idx_agriculture_product_type already exists';

-- 5. Processing History
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('PROCESSING') AND name = 'idx_processing_batch')
BEGIN
    PRINT '   Creating idx_processing_batch...';
    CREATE NONCLUSTERED INDEX idx_processing_batch
    ON PROCESSING (Batch_ID)
    INCLUDE (ID, Processing_Date, Packaging_Date, Processed_By, Packaging_Type, Facility_ID);
    PRINT '     Done';
END
ELSE
    PRINT '   idx_processing_batch already exists';

-- 6. Vendor Product Queries
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('VENDOR_PRODUCT') AND name = 'idx_vendor_product_vendor')
BEGIN
    PRINT '   Creating idx_vendor_product_vendor...';
    CREATE NONCLUSTERED INDEX idx_vendor_product_vendor
    ON VENDOR_PRODUCT (Vendor_TIN)
    INCLUDE (ID, Unit);
    PRINT '     Done';
END
ELSE
    PRINT '   idx_vendor_product_vendor already exists';

-- 7. Shipment Tracking
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('SHIPMENT') AND name = 'idx_shipment_status_distributor')
BEGIN
    PRINT '   Creating idx_shipment_status_distributor...';
    CREATE NONCLUSTERED INDEX idx_shipment_status_distributor
    ON SHIPMENT ([Status], Distributor_TIN)
    INCLUDE (ID, Destination);
    PRINT '     Done';
END
ELSE
    PRINT '   idx_shipment_status_distributor already exists';

-- 8. Geographic Queries
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('FARM') AND name = 'idx_farm_province')
BEGIN
    PRINT '   Creating idx_farm_province...';
    CREATE NONCLUSTERED INDEX idx_farm_province
    ON FARM (P_ID)
    INCLUDE (ID, Name, Owner_Name, Contact_Info);
    PRINT '     Done';
END
ELSE
    PRINT '   idx_farm_province already exists';

-- 9. Stored In (Warehouse) Queries
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('STORED_IN') AND name = 'idx_stored_in_batch')
BEGIN
    PRINT '   Creating idx_stored_in_batch...';
    CREATE NONCLUSTERED INDEX idx_stored_in_batch
    ON STORED_IN (B_ID)
    INCLUDE (W_ID, Quantity, Start_Date);
    PRINT '     Done';
END
ELSE
    PRINT '   idx_stored_in_batch already exists';

-- 10. Price Lookups
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('PRICE') AND name = 'idx_price_vendor_product')
BEGIN
    PRINT '   Creating idx_price_vendor_product...';
    CREATE NONCLUSTERED INDEX idx_price_vendor_product
    ON PRICE (V_ID)
    INCLUDE (Value, Currency);
    PRINT '     Done';
END
ELSE
    PRINT '   idx_price_vendor_product already exists';

PRINT '';
PRINT 'All Indexes Created Successfully    ';
