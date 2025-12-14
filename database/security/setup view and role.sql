USE Traceability;
GO

-- ============================================================================
-- CHUẨN BỊ CÁC VIEW 
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

-- View TRANSPORT
IF OBJECT_ID('dbo.v_TRANSPORT', 'V') IS NOT NULL DROP VIEW dbo.v_TRANSPORT;
GO
CREATE VIEW v_TRANSPORT AS
SELECT 
    s.Status, 
    s.Destination, 
    tl.Start_Location, 
    tl.To_Location, 
    tl.D_Time, 
    tl.A_Time, 
    tl.Temperature_Profile, 
    cc_vendor.Name AS Carrier_Company
FROM dbo.TRANSPORLEG tl
JOIN dbo.SHIPMENT s ON tl.Shipment_ID = s.ID
JOIN dbo.CARRIERCOMPANY cc ON tl.CarrierCompany_TIN = cc.V_TIN
JOIN dbo.VENDOR cc_vendor ON cc.V_TIN = cc_vendor.TIN;
GO

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

-- ============================================================================
-- PHẦN 2: THIẾT LẬP ADMIN
-- ============================================================================

-- Tạo Login
IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = 'AdminLogin')
    CREATE LOGIN [AdminLogin] WITH PASSWORD=N'AdminPass@123', CHECK_EXPIRATION=OFF, CHECK_POLICY=OFF;

-- Tạo User
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'AdminUser')
    CREATE USER [AdminUser] FOR LOGIN [AdminLogin];

-- CẤP QUYỀN: Add vào db_owner
-- Admin sẽ có toàn quyền SELECT, INSERT, UPDATE, DELETE trên MỌI BẢNG
ALTER ROLE [db_owner] ADD MEMBER [AdminUser];
GO

-- ============================================================================
-- PHẦN 3: THIẾT LẬP CUSTOMER
-- ============================================================================

-- Tạo Login
IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = 'CustomerLogin')
    CREATE LOGIN [CustomerLogin] WITH PASSWORD=N'CustomerPass@123', CHECK_EXPIRATION=OFF, CHECK_POLICY=OFF;

-- Tạo User
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'CustomerUser')
    CREATE USER [CustomerUser] FOR LOGIN [CustomerLogin];

-- Tạo Role riêng cho khách
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'ROLE_CUSTOMER' AND type = 'R')
    CREATE ROLE [ROLE_CUSTOMER];

ALTER ROLE [ROLE_CUSTOMER] ADD MEMBER [CustomerUser];

-- Lệnh này đảm bảo Customer KHÔNG BAO GIỜ thấy được bảng gốc
DENY SELECT, INSERT, UPDATE, DELETE ON SCHEMA :: dbo TO [ROLE_CUSTOMER];

-- Chỉ cấp quyền xem trên các View đã lọc
GRANT SELECT ON dbo.v_BATCH TO [ROLE_CUSTOMER];
GRANT SELECT ON dbo.v_FARM TO [ROLE_CUSTOMER];
GRANT SELECT ON dbo.v_TRANSPORT TO [ROLE_CUSTOMER];
GRANT SELECT ON dbo.v_PRODUCT TO [ROLE_CUSTOMER];
GO
