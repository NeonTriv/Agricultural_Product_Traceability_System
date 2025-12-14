USE Traceability;
GO

PRINT 'Setting Up Security Views & Roles..';
PRINT '';

-- ============================================================================
-- PHẦN 1: CHUẨN BỊ CÁC VIEW 
-- ============================================================================

-- View BATCH
IF OBJECT_ID('dbo.v_BATCH', 'V') IS NOT NULL DROP VIEW dbo.v_BATCH;
GO
CREATE VIEW v_BATCH AS
SELECT 
    b.Qr_Code_URL, 
    b.Harvest_Date, 
    b.Grade,
    f.Name AS Farm_Name, 
    ap.Name AS Product_Name
FROM dbo.BATCH b
LEFT JOIN dbo.FARM f ON b.Farm_ID = f.ID
LEFT JOIN dbo.AGRICULTURE_PRODUCT ap ON b.AP_ID = ap.ID;
GO
PRINT '   v_BATCH view created';

-- View FARM
IF OBJECT_ID('dbo.v_FARM', 'V') IS NOT NULL DROP VIEW dbo.v_FARM;
GO
CREATE VIEW v_FARM AS
SELECT 
    f.Name, 
    f.Address_detail, 
    p.Name AS Province_Name
FROM dbo.FARM f
LEFT JOIN dbo.PROVINCE p ON f.P_ID = p.ID;
GO
PRINT '   v_FARM view created';

-- View PRODUCT
IF OBJECT_ID('dbo.v_PRODUCT', 'V') IS NOT NULL DROP VIEW dbo.v_PRODUCT;
GO
CREATE VIEW v_PRODUCT AS
SELECT 
    ap.Name, 
    ap.Image_URL, 
    t.Variety, 
    c.Name AS Category
FROM dbo.AGRICULTURE_PRODUCT ap
JOIN dbo.[TYPE] t ON ap.T_ID = t.ID
JOIN dbo.CATEGORY c ON t.C_ID = c.ID;
GO
PRINT '   v_PRODUCT view created';

-- View VENDOR_PRICE
IF OBJECT_ID('dbo.v_VENDOR_PRICE', 'V') IS NOT NULL DROP VIEW dbo.v_VENDOR_PRICE;
GO
CREATE VIEW v_VENDOR_PRICE AS
SELECT 
    v.Name AS Vendor_Name,
    vp.Unit,
    vp.ValuePerUnit,
    p.Value AS Price,
    p.Currency
FROM dbo.VENDOR_PRODUCT vp
JOIN dbo.VENDOR v ON vp.Vendor_TIN = v.TIN
LEFT JOIN dbo.PRICE p ON vp.ID = p.V_ID;
GO
PRINT '   v_VENDOR_PRICE view created';

PRINT '';

-- ============================================================================
-- PHẦN 2: THIẾT LẬP ADMIN
-- ============================================================================

USE master;
GO

IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = 'AdminLogin')
BEGIN
    CREATE LOGIN [AdminLogin] WITH PASSWORD=N'AdminPass@123', CHECK_EXPIRATION=OFF, CHECK_POLICY=OFF;
    PRINT '   AdminLogin created';
END
ELSE
    PRINT '   AdminLogin already exists';

USE Traceability;
GO

IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'AdminUser')
BEGIN
    CREATE USER [AdminUser] FOR LOGIN [AdminLogin];
    ALTER ROLE [db_owner] ADD MEMBER [AdminUser];
    PRINT '   AdminUser created (db_owner role)';
END
ELSE
    PRINT '   AdminUser already exists';

-- ============================================================================
-- PHẦN 3: THIẾT LẬP CUSTOMER
-- ============================================================================

USE master;
GO

IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = 'CustomerLogin')
BEGIN
    CREATE LOGIN [CustomerLogin] WITH PASSWORD=N'CustomerPass@123', CHECK_EXPIRATION=OFF, CHECK_POLICY=OFF;
    PRINT '   CustomerLogin created';
END
ELSE
    PRINT '   CustomerLogin already exists';

USE Traceability;
GO

IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'CustomerUser')
BEGIN
    CREATE USER [CustomerUser] FOR LOGIN [CustomerLogin];
    PRINT '   CustomerUser created';
END
ELSE
    PRINT '   CustomerUser already exists';

-- Create Role
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'ROLE_CUSTOMER' AND type = 'R')
BEGIN
    CREATE ROLE [ROLE_CUSTOMER];
    ALTER ROLE [ROLE_CUSTOMER] ADD MEMBER [CustomerUser];
    PRINT '   ROLE_CUSTOMER created';
END
ELSE
BEGIN
    IF NOT EXISTS (SELECT 1 FROM sys.database_role_members WHERE role_principal_id IN (SELECT principal_id FROM sys.database_principals WHERE name = 'ROLE_CUSTOMER') AND member_principal_id IN (SELECT principal_id FROM sys.database_principals WHERE name = 'CustomerUser'))
    BEGIN
        ALTER ROLE [ROLE_CUSTOMER] ADD MEMBER [CustomerUser];
        PRINT '   CustomerUser added to ROLE_CUSTOMER';
    END
END

-- Grant permissions
DENY SELECT, INSERT, UPDATE, DELETE ON SCHEMA :: dbo TO [ROLE_CUSTOMER];
GRANT SELECT ON dbo.v_BATCH TO [ROLE_CUSTOMER];
GRANT SELECT ON dbo.v_FARM TO [ROLE_CUSTOMER];
GRANT SELECT ON dbo.v_PRODUCT TO [ROLE_CUSTOMER];
GRANT SELECT ON dbo.v_VENDOR_PRICE TO [ROLE_CUSTOMER];
PRINT '   View permissions granted to ROLE_CUSTOMER';

PRINT '';
PRINT ' Security Setup Complete                                     ';
