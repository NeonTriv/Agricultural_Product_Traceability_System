USE Traceability;
GO

-- ============================================================================
-- AUDIT TRIGGERS FOR DATA INTEGRITY & SECURITY
-- ============================================================================
-- Purpose: Track all changes to critical tables for compliance & debugging
-- Author: Development Team
-- Date: December 26, 2025
-- ============================================================================

PRINT 'Creating Audit Tables & Triggers...';
PRINT '';

-- ============================================================================
-- PART 1: CREATE AUDIT LOG TABLE
-- ============================================================================

IF OBJECT_ID('dbo.AUDIT_LOG', 'U') IS NOT NULL DROP TABLE dbo.AUDIT_LOG;
GO

CREATE TABLE dbo.AUDIT_LOG (
    ID BIGINT IDENTITY(1,1) PRIMARY KEY,
    TableName NVARCHAR(128) NOT NULL,
    RecordID INT NOT NULL,
    Operation VARCHAR(10) NOT NULL CHECK (Operation IN ('INSERT', 'UPDATE', 'DELETE')),
    FieldName NVARCHAR(128),
    OldValue NVARCHAR(MAX),
    NewValue NVARCHAR(MAX),
    ChangedBy NVARCHAR(128) NOT NULL DEFAULT SUSER_SNAME(),
    ChangedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    ClientIP VARCHAR(50),
    ApplicationName NVARCHAR(128)
);

-- Index for fast queries
CREATE NONCLUSTERED INDEX idx_audit_log_table_record 
ON AUDIT_LOG (TableName, RecordID, ChangedAt DESC);

CREATE NONCLUSTERED INDEX idx_audit_log_changed_by 
ON AUDIT_LOG (ChangedBy, ChangedAt DESC);

PRINT '✓ Audit Log table created';
PRINT '';

-- ============================================================================
-- PART 2: BATCH AUDIT TRIGGER (CRITICAL - QR Code traceability)
-- ============================================================================

IF OBJECT_ID('dbo.trg_BATCH_Audit', 'TR') IS NOT NULL 
    DROP TRIGGER dbo.trg_BATCH_Audit;
GO

CREATE TRIGGER trg_BATCH_Audit
ON dbo.BATCH
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Operation VARCHAR(10);
    DECLARE @User NVARCHAR(128) = SUSER_SNAME();
    DECLARE @AppName NVARCHAR(128) = APP_NAME();
    
    -- Determine operation type
    IF EXISTS (SELECT 1 FROM inserted) AND EXISTS (SELECT 1 FROM deleted)
        SET @Operation = 'UPDATE';
    ELSE IF EXISTS (SELECT 1 FROM inserted)
        SET @Operation = 'INSERT';
    ELSE
        SET @Operation = 'DELETE';
    
    -- Log INSERT operations
    IF @Operation = 'INSERT'
    BEGIN
        INSERT INTO AUDIT_LOG (TableName, RecordID, Operation, FieldName, NewValue, ChangedBy, ApplicationName)
        SELECT 
            'BATCH',
            i.ID,
            'INSERT',
            'FullRecord',
            CONCAT('QR:', i.Qr_Code_URL, ' | Farm:', i.Farm_ID, ' | Product:', i.AP_ID, ' | Grade:', i.Grade),
            @User,
            @AppName
        FROM inserted i;
    END
    
    -- Log UPDATE operations (track important fields)
    IF @Operation = 'UPDATE'
    BEGIN
        -- Track QR Code changes (SHOULD NEVER HAPPEN - but track it!)
        INSERT INTO AUDIT_LOG (TableName, RecordID, Operation, FieldName, OldValue, NewValue, ChangedBy, ApplicationName)
        SELECT 
            'BATCH',
            i.ID,
            'UPDATE',
            'Qr_Code_URL',
            d.Qr_Code_URL,
            i.Qr_Code_URL,
            @User,
            @AppName
        FROM inserted i
        INNER JOIN deleted d ON i.ID = d.ID
        WHERE i.Qr_Code_URL <> d.Qr_Code_URL;
        
        -- Track Grade changes
        INSERT INTO AUDIT_LOG (TableName, RecordID, Operation, FieldName, OldValue, NewValue, ChangedBy, ApplicationName)
        SELECT 
            'BATCH',
            i.ID,
            'UPDATE',
            'Grade',
            d.Grade,
            i.Grade,
            @User,
            @AppName
        FROM inserted i
        INNER JOIN deleted d ON i.ID = d.ID
        WHERE ISNULL(i.Grade, '') <> ISNULL(d.Grade, '');
        
        -- Track Vendor Product changes
        INSERT INTO AUDIT_LOG (TableName, RecordID, Operation, FieldName, OldValue, NewValue, ChangedBy, ApplicationName)
        SELECT 
            'BATCH',
            i.ID,
            'UPDATE',
            'V_ID',
            CAST(d.V_ID AS NVARCHAR),
            CAST(i.V_ID AS NVARCHAR),
            @User,
            @AppName
        FROM inserted i
        INNER JOIN deleted d ON i.ID = d.ID
        WHERE ISNULL(i.V_ID, 0) <> ISNULL(d.V_ID, 0);
    END
    
    -- Log DELETE operations
    IF @Operation = 'DELETE'
    BEGIN
        INSERT INTO AUDIT_LOG (TableName, RecordID, Operation, FieldName, OldValue, ChangedBy, ApplicationName)
        SELECT 
            'BATCH',
            d.ID,
            'DELETE',
            'FullRecord',
            CONCAT('QR:', d.Qr_Code_URL, ' | Farm:', d.Farm_ID, ' | Product:', d.AP_ID),
            @User,
            @AppName
        FROM deleted d;
    END
END;
GO

PRINT '✓ BATCH audit trigger created';

-- ============================================================================
-- PART 3: PRICE AUDIT TRIGGER (CRITICAL - Pricing changes)
-- ============================================================================

IF OBJECT_ID('dbo.trg_PRICE_Audit', 'TR') IS NOT NULL 
    DROP TRIGGER dbo.trg_PRICE_Audit;
GO

CREATE TRIGGER trg_PRICE_Audit
ON dbo.PRICE
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Operation VARCHAR(10);
    DECLARE @User NVARCHAR(128) = SUSER_SNAME();
    
    IF EXISTS (SELECT 1 FROM inserted) AND EXISTS (SELECT 1 FROM deleted)
        SET @Operation = 'UPDATE';
    ELSE IF EXISTS (SELECT 1 FROM inserted)
        SET @Operation = 'INSERT';
    ELSE
        SET @Operation = 'DELETE';
    
    -- Log price changes (INSERT/UPDATE)
    IF @Operation IN ('INSERT', 'UPDATE')
    BEGIN
        INSERT INTO AUDIT_LOG (TableName, RecordID, Operation, FieldName, OldValue, NewValue, ChangedBy)
        SELECT 
            'PRICE',
            i.V_ID,
            @Operation,
            'Value',
            CAST(d.Value AS NVARCHAR),
            CAST(i.Value AS NVARCHAR),
            @User
        FROM inserted i
        LEFT JOIN deleted d ON i.V_ID = d.V_ID
        WHERE @Operation = 'INSERT' OR (d.Value IS NOT NULL AND i.Value <> d.Value);
    END
    
    -- Log deletions
    IF @Operation = 'DELETE'
    BEGIN
        INSERT INTO AUDIT_LOG (TableName, RecordID, Operation, FieldName, OldValue, ChangedBy)
        SELECT 
            'PRICE',
            d.V_ID,
            'DELETE',
            'Value',
            CAST(d.Value AS NVARCHAR) + ' ' + d.Currency,
            @User
        FROM deleted d;
    END
END;
GO

PRINT '✓ PRICE audit trigger created';

-- ============================================================================
-- PART 4: DISCOUNT AUDIT TRIGGER
-- ============================================================================

IF OBJECT_ID('dbo.trg_DISCOUNT_Audit', 'TR') IS NOT NULL 
    DROP TRIGGER dbo.trg_DISCOUNT_Audit;
GO

CREATE TRIGGER trg_DISCOUNT_Audit
ON dbo.DISCOUNT
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Operation VARCHAR(10);
    DECLARE @User NVARCHAR(128) = SUSER_SNAME();
    
    IF EXISTS (SELECT 1 FROM inserted) AND EXISTS (SELECT 1 FROM deleted)
        SET @Operation = 'UPDATE';
    ELSE IF EXISTS (SELECT 1 FROM inserted)
        SET @Operation = 'INSERT';
    ELSE
        SET @Operation = 'DELETE';
    
    IF @Operation = 'INSERT'
    BEGIN
        INSERT INTO AUDIT_LOG (TableName, RecordID, Operation, FieldName, NewValue, ChangedBy)
        SELECT 
            'DISCOUNT',
            i.ID,
            'INSERT',
            'Details',
            CONCAT('Name:', i.Name, ' | Percentage:', i.Percentage, '% | Priority:', i.Priority),
            @User
        FROM inserted i;
    END
    
    IF @Operation = 'UPDATE'
    BEGIN
        INSERT INTO AUDIT_LOG (TableName, RecordID, Operation, FieldName, OldValue, NewValue, ChangedBy)
        SELECT 
            'DISCOUNT',
            i.ID,
            'UPDATE',
            'Percentage',
            CAST(d.Percentage AS NVARCHAR),
            CAST(i.Percentage AS NVARCHAR),
            @User
        FROM inserted i
        INNER JOIN deleted d ON i.ID = d.ID
        WHERE i.Percentage <> d.Percentage;
    END
    
    IF @Operation = 'DELETE'
    BEGIN
        INSERT INTO AUDIT_LOG (TableName, RecordID, Operation, FieldName, OldValue, ChangedBy)
        SELECT 
            'DISCOUNT',
            d.ID,
            'DELETE',
            'Details',
            CONCAT('Name:', d.Name, ' | Percentage:', d.Percentage, '%'),
            @User
        FROM deleted d;
    END
END;
GO

PRINT '✓ DISCOUNT audit trigger created';

-- ============================================================================
-- PART 5: VENDOR AUDIT TRIGGER (Track vendor changes)
-- ============================================================================

IF OBJECT_ID('dbo.trg_VENDOR_Audit', 'TR') IS NOT NULL 
    DROP TRIGGER dbo.trg_VENDOR_Audit;
GO

CREATE TRIGGER trg_VENDOR_Audit
ON dbo.VENDOR
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Operation VARCHAR(10);
    DECLARE @User NVARCHAR(128) = SUSER_SNAME();
    
    IF EXISTS (SELECT 1 FROM inserted) AND EXISTS (SELECT 1 FROM deleted)
        SET @Operation = 'UPDATE';
    ELSE IF EXISTS (SELECT 1 FROM inserted)
        SET @Operation = 'INSERT';
    ELSE
        SET @Operation = 'DELETE';
    
    IF @Operation IN ('INSERT', 'UPDATE', 'DELETE')
    BEGIN
        INSERT INTO AUDIT_LOG (TableName, RecordID, Operation, FieldName, OldValue, NewValue, ChangedBy)
        SELECT 
            'VENDOR',
            CAST(CHECKSUM(ISNULL(i.TIN, d.TIN)) AS INT),
            @Operation,
            'TIN',
            d.TIN,
            i.TIN,
            @User
        FROM inserted i
        FULL OUTER JOIN deleted d ON i.TIN = d.TIN;
    END
END;
GO

PRINT '✓ VENDOR audit trigger created';

-- ============================================================================
-- PART 6: HELPER VIEWS FOR AUDIT QUERIES
-- ============================================================================

IF OBJECT_ID('dbo.v_AUDIT_RECENT', 'V') IS NOT NULL 
    DROP VIEW dbo.v_AUDIT_RECENT;
GO

CREATE VIEW v_AUDIT_RECENT AS
SELECT TOP 1000
    ID,
    TableName,
    RecordID,
    Operation,
    FieldName,
    OldValue,
    NewValue,
    ChangedBy,
    ChangedAt,
    ApplicationName
FROM AUDIT_LOG
ORDER BY ChangedAt DESC;
GO

PRINT '✓ Audit views created';
PRINT '';

-- ============================================================================
-- PART 7: AUDIT QUERY EXAMPLES
-- ============================================================================

PRINT '============================================================================';
PRINT 'AUDIT SYSTEM DEPLOYED SUCCESSFULLY!';
PRINT '============================================================================';
PRINT '';
PRINT 'Useful Audit Queries:';
PRINT '';
PRINT '-- View recent changes:';
PRINT 'SELECT * FROM v_AUDIT_RECENT;';
PRINT '';
PRINT '-- Track specific batch:';
PRINT 'SELECT * FROM AUDIT_LOG WHERE TableName = ''BATCH'' AND RecordID = 1 ORDER BY ChangedAt;';
PRINT '';
PRINT '-- Find who changed prices:';
PRINT 'SELECT * FROM AUDIT_LOG WHERE TableName = ''PRICE'' AND Operation = ''UPDATE'';';
PRINT '';
PRINT '-- Track QR code changes (SHOULD BE EMPTY!):';
PRINT 'SELECT * FROM AUDIT_LOG WHERE FieldName = ''Qr_Code_URL'';';
PRINT '';
PRINT '-- Audit by user:';
PRINT 'SELECT TableName, Operation, COUNT(*) AS Changes';
PRINT 'FROM AUDIT_LOG';
PRINT 'WHERE ChangedBy = SUSER_SNAME()';
PRINT 'GROUP BY TableName, Operation;';
PRINT '';
PRINT '============================================================================';
GO
