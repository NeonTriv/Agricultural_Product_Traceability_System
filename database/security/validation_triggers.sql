USE Traceability;
GO

-- ============================================================================
-- DATA VALIDATION TRIGGERS
-- ============================================================================
-- Purpose: Additional business rule validation at database level
-- These complement application-layer validation for defense in depth
-- ============================================================================

PRINT 'Creating Data Validation Triggers...';
PRINT '';

-- ============================================================================
-- 1. BATCH QR CODE UNIQUENESS & FORMAT VALIDATION
-- ============================================================================

IF OBJECT_ID('dbo.trg_BATCH_Validate', 'TR') IS NOT NULL 
    DROP TRIGGER dbo.trg_BATCH_Validate;
GO

CREATE TRIGGER trg_BATCH_Validate
ON dbo.BATCH
INSTEAD OF INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Validate QR Code format (must start with 'QR-')
    IF EXISTS (
        SELECT 1 FROM inserted 
        WHERE Qr_Code_URL NOT LIKE 'QR-%' AND Qr_Code_URL NOT LIKE 'http%'
    )
    BEGIN
        RAISERROR('Invalid QR Code format. Must start with ''QR-'' or ''http''', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
    
    -- Validate Harvest Date 
    IF EXISTS (
        SELECT 1 FROM inserted 
        WHERE Harvest_Date > SYSDATETIMEOFFSET()
    )
    BEGIN
        RAISERROR('Harvest Date cannot be in the future', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
    
    -- Validate Grade
    IF EXISTS (
        SELECT 1 FROM inserted 
        WHERE Grade IS NOT NULL AND Grade NOT IN ('A', 'B', 'C', 'Premium')
    )
    BEGIN
        RAISERROR('Grade must be A, B, C, Premium', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
    
    -- Perform the actual INSERT/UPDATE
    IF EXISTS (SELECT 1 FROM deleted)
    BEGIN
        -- UPDATE operation
        UPDATE b
        SET 
            Harvest_Date = i.Harvest_Date,
            Created_By = i.Created_By,
            Grade = i.Grade,
            Seed_Batch = i.Seed_Batch,
            Qr_Code_URL = i.Qr_Code_URL,
            Farm_ID = i.Farm_ID,
            AP_ID = i.AP_ID,
            V_ID = i.V_ID
        FROM BATCH b
        INNER JOIN inserted i ON b.ID = i.ID;
    END
    ELSE
    BEGIN
        -- INSERT operation
        INSERT INTO BATCH (Harvest_Date, Created_By, Grade, Seed_Batch, Qr_Code_URL, Farm_ID, AP_ID, V_ID)
        SELECT Harvest_Date, Created_By, Grade, Seed_Batch, Qr_Code_URL, Farm_ID, AP_ID, V_ID
        FROM inserted;
    END
END;
GO

PRINT 'BATCH validation trigger created';

-- ============================================================================
-- 2. PROCESSING DATE VALIDATION
-- ============================================================================

IF OBJECT_ID('dbo.trg_PROCESSING_Validate', 'TR') IS NOT NULL 
    DROP TRIGGER dbo.trg_PROCESSING_Validate;
GO

CREATE TRIGGER trg_PROCESSING_Validate
ON dbo.PROCESSING
INSTEAD OF INSERT, UPDATE
AS
BEGIN    
    IF EXISTS (
        SELECT 1 
        FROM inserted i
        INNER JOIN BATCH b ON i.Batch_ID = b.ID
        WHERE i.Processing_Date < b.Harvest_Date
    )
    BEGIN
        RAISERROR('Processing Date cannot be before Harvest Date', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
    
    -- Validate: Packaging Date must be after Processing Date 
    IF EXISTS (
        SELECT 1 FROM inserted 
        WHERE Processing_Date IS NOT NULL AND Packaging_Date <= Processing_Date
    )
    BEGIN
        RAISERROR('Packaging Date must be after Processing Date', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
    
    -- Perform the actual INSERT/UPDATE
    IF EXISTS (SELECT 1 FROM deleted)
    BEGIN
        UPDATE p
        SET 
            Packaging_Date = i.Packaging_Date,
            Weight_per_unit = i.Weight_per_unit,
            Processed_By = i.Processed_By,
            Packaging_Type = i.Packaging_Type,
            Processing_Date = i.Processing_Date,
            Facility_ID = i.Facility_ID,
            Batch_ID = i.Batch_ID
        FROM PROCESSING p
        INNER JOIN inserted i ON p.ID = i.ID;
    END
    ELSE
    BEGIN
        INSERT INTO PROCESSING (Packaging_Date, Weight_per_unit, Processed_By, Packaging_Type, Processing_Date, Facility_ID, Batch_ID)
        SELECT Packaging_Date, Weight_per_unit, Processed_By, Packaging_Type, Processing_Date, Facility_ID, Batch_ID
        FROM inserted;
    END
END;
GO

PRINT 'PROCESSING validation trigger created';

-- ============================================================================
-- 3. PRICE CHANGE VALIDATION
-- ============================================================================

IF OBJECT_ID('dbo.trg_PRICE_Validate', 'TR') IS NOT NULL 
    DROP TRIGGER dbo.trg_PRICE_Validate;
GO

CREATE TRIGGER trg_PRICE_Validate
ON dbo.PRICE
INSTEAD OF INSERT, UPDATE
AS
BEGIN
    
    -- Validate: Currency must be valid
    IF EXISTS (
        SELECT 1 FROM inserted 
        WHERE Currency NOT IN ('VND', 'USD', 'EUR', 'JPY')
    )
    BEGIN
        RAISERROR('❌ Invalid currency. Allowed: VND, USD, EUR, JPY', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
    
    -- Perform the actual INSERT/UPDATE
    IF EXISTS (SELECT 1 FROM deleted)
    BEGIN
        UPDATE p
        SET Value = i.Value, Currency = i.Currency
        FROM PRICE p
        INNER JOIN inserted i ON p.V_ID = i.V_ID;
    END
    ELSE
    BEGIN
        INSERT INTO PRICE (V_ID, Value, Currency)
        SELECT V_ID, Value, Currency
        FROM inserted;
    END
END;
GO

PRINT 'PRICE validation trigger created';

-- ============================================================================
-- 4. DISCOUNT VALIDATION
-- ============================================================================

IF OBJECT_ID('dbo.trg_DISCOUNT_Validate', 'TR') IS NOT NULL 
    DROP TRIGGER dbo.trg_DISCOUNT_Validate;
GO

CREATE TRIGGER trg_DISCOUNT_Validate
ON dbo.DISCOUNT
INSTEAD OF INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    IF EXISTS (
        SELECT 1 FROM inserted i
        LEFT JOIN deleted d ON i.ID = d.ID
        WHERE d.ID IS NULL 
        AND i.Start_Date < CAST(GETDATE() AS DATE)
    )
    BEGIN
        RAISERROR('Cannot create discount with start date in the past', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
    
    -- Validate: Expired date must be at least 1 day after start date
    IF EXISTS (
        SELECT 1 FROM inserted 
        WHERE DATEDIFF(DAY, Start_Date, Expired_Date) < 1
    )
    BEGIN
        RAISERROR('Discount must be valid for at least 1 day', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
    
    -- Validate: Priority must be between 0-10
    IF EXISTS (
        SELECT 1 FROM inserted 
        WHERE Priority NOT BETWEEN 0 AND 10
    )
    BEGIN
        RAISERROR('Priority must be between 0 and 10', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
    
    -- Perform the actual INSERT/UPDATE
    IF EXISTS (SELECT 1 FROM deleted)
    BEGIN
        UPDATE d
        SET 
            Name = i.Name,
            Percentage = i.Percentage,
            Min_Value = i.Min_Value,
            Max_Discount_Amount = i.Max_Discount_Amount,
            Priority = i.Priority,
            Is_Stackable = i.Is_Stackable,
            Start_Date = i.Start_Date,
            Expired_Date = i.Expired_Date
        FROM DISCOUNT d
        INNER JOIN inserted i ON d.ID = i.ID;
    END
    ELSE
    BEGIN
        INSERT INTO DISCOUNT (Name, Percentage, Min_Value, Max_Discount_Amount, Priority, Is_Stackable, Start_Date, Expired_Date)
        SELECT Name, Percentage, Min_Value, Max_Discount_Amount, Priority, Is_Stackable, Start_Date, Expired_Date
        FROM inserted;
    END
END;
GO

PRINT 'DISCOUNT validation trigger created';

-- ============================================================================
-- 5. WAREHOUSE CAPACITY VALIDATION
-- ============================================================================

IF OBJECT_ID('dbo.trg_STORED_IN_Validate', 'TR') IS NOT NULL 
    DROP TRIGGER dbo.trg_STORED_IN_Validate;
GO

CREATE TRIGGER trg_STORED_IN_Validate
ON dbo.STORED_IN
INSTEAD OF INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @OverCapacity TABLE (W_ID INT, CurrentTotal DECIMAL(10,2), Capacity DECIMAL(10,2));
    
    INSERT INTO @OverCapacity
    SELECT 
        w.ID,
        ISNULL(SUM(si.Quantity), 0) + ISNULL(i.Quantity, 0) AS CurrentTotal,
        w.Capacity
    FROM WAREHOUSE w
    LEFT JOIN STORED_IN si ON w.ID = si.W_ID AND si.B_ID NOT IN (SELECT B_ID FROM inserted)
    LEFT JOIN inserted i ON w.ID = i.W_ID
    WHERE w.Capacity IS NOT NULL
    GROUP BY w.ID, w.Capacity, i.Quantity
    HAVING ISNULL(SUM(si.Quantity), 0) + ISNULL(i.Quantity, 0) > w.Capacity;
    
    IF EXISTS (SELECT 1 FROM @OverCapacity)
    BEGIN
        DECLARE @ErrorMsg NVARCHAR(500);
        SELECT TOP 1 @ErrorMsg = CONCAT('Warehouse ', W_ID, ' capacity exceeded: ', CurrentTotal, ' / ', Capacity)
        FROM @OverCapacity;
        
        RAISERROR(@ErrorMsg, 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
    
    -- Perform the actual INSERT/UPDATE
    IF EXISTS (SELECT 1 FROM deleted)
    BEGIN
        UPDATE si
        SET Quantity = i.Quantity, Start_Date = i.Start_Date, End_Date = i.End_Date
        FROM STORED_IN si
        INNER JOIN inserted i ON si.B_ID = i.B_ID AND si.W_ID = i.W_ID;
    END
    ELSE
    BEGIN
        INSERT INTO STORED_IN (B_ID, W_ID, Quantity, Start_Date, End_Date)
        SELECT B_ID, W_ID, Quantity, Start_Date, End_Date
        FROM inserted;
    END
END;
GO

PRINT 'STORED_IN validation trigger created';

PRINT '';
PRINT '============================================================================';
PRINT 'DATA VALIDATION TRIGGERS DEPLOYED!';
PRINT '============================================================================';

-- ============================================================================
-- 6. SHIPMENT - TRANSPORLEG INTEGRITY VALIDATION
-- ============================================================================

IF OBJECT_ID('dbo.trg_SHIPMENT_Validate', 'TR') IS NOT NULL 
    DROP TRIGGER dbo.trg_SHIPMENT_Validate;
GO

CREATE TRIGGER trg_SHIPMENT_Validate
ON dbo.SHIPMENT
INSTEAD OF INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM inserted i
        WHERE i.Status <> 'Pending'
          AND NOT EXISTS (
              SELECT 1
              FROM TRANSPORLEG tl
              WHERE tl.Shipment_ID = i.ID
          )
    )
    BEGIN
        RAISERROR('Shipment cannot be created or updated to non-Pending without at least one transport leg', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM deleted)
    BEGIN
        UPDATE s
        SET 
            Status = i.Status,
            Destination = i.Destination,
            Start_Location = i.Start_Location,
            Distributor_TIN = i.Distributor_TIN
        FROM SHIPMENT s
        INNER JOIN inserted i ON s.ID = i.ID;
    END
    ELSE
    BEGIN
        INSERT INTO SHIPMENT (Status, Destination, Start_Location, Distributor_TIN)
        SELECT Status, Destination, Start_Location, Distributor_TIN
        FROM inserted;
    END
END;
GO

PRINT 'SHIPMENT validation trigger created';

IF OBJECT_ID('dbo.trg_TRANSPORLEG_NoOrphan', 'TR') IS NOT NULL 
    DROP TRIGGER dbo.trg_TRANSPORLEG_NoOrphan;
GO

CREATE TRIGGER trg_TRANSPORLEG_NoOrphan
ON dbo.TRANSPORLEG
AFTER DELETE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM deleted d
        CROSS APPLY (
            SELECT COUNT(*) AS Remaining
            FROM TRANSPORLEG tl
            WHERE tl.Shipment_ID = d.Shipment_ID
        ) x
        INNER JOIN SHIPMENT s ON s.ID = d.Shipment_ID
        WHERE x.Remaining = 0 AND s.Status <> 'Cancelled'
    )
    BEGIN
        RAISERROR('Cannot remove the last transport leg for a non-cancelled shipment', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
END;
GO

PRINT 'TRANSPORLEG orphan-prevention trigger created';
