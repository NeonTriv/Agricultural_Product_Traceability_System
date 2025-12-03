-- ============================================================================
-- INSERT MASTER DATA (FIXED FOR LEADER SCHEMA)
-- Countries, Categories, Provinces, Types, Farms, Facilities, Vendors, Products
-- ============================================================================

USE Traceability;
GO

PRINT '============================================================================';
PRINT 'INSERTING MASTER DATA...';
PRINT '============================================================================';
PRINT '';

-- ============================================================================
-- 1. INSERT COUNTRIES
-- ============================================================================
PRINT '1. Inserting Countries...';
IF NOT EXISTS (SELECT * FROM COUNTRY WHERE Name = N'Vietnam') INSERT INTO COUNTRY (Name) VALUES (N'Vietnam');
IF NOT EXISTS (SELECT * FROM COUNTRY WHERE Name = N'Thailand') INSERT INTO COUNTRY (Name) VALUES (N'Thailand');
IF NOT EXISTS (SELECT * FROM COUNTRY WHERE Name = N'United States') INSERT INTO COUNTRY (Name) VALUES (N'United States');
IF NOT EXISTS (SELECT * FROM COUNTRY WHERE Name = N'Japan') INSERT INTO COUNTRY (Name) VALUES (N'Japan');
IF NOT EXISTS (SELECT * FROM COUNTRY WHERE Name = N'China') INSERT INTO COUNTRY (Name) VALUES (N'China');

-- ============================================================================
-- 2. INSERT CATEGORIES
-- ============================================================================
PRINT '2. Inserting Categories...';
IF NOT EXISTS (SELECT * FROM CATEGORY WHERE Name = N'Rice') INSERT INTO CATEGORY (Name) VALUES (N'Rice');
IF NOT EXISTS (SELECT * FROM CATEGORY WHERE Name = N'Vegetables') INSERT INTO CATEGORY (Name) VALUES (N'Vegetables');
IF NOT EXISTS (SELECT * FROM CATEGORY WHERE Name = N'Fruits') INSERT INTO CATEGORY (Name) VALUES (N'Fruits');
IF NOT EXISTS (SELECT * FROM CATEGORY WHERE Name = N'Coffee') INSERT INTO CATEGORY (Name) VALUES (N'Coffee');
IF NOT EXISTS (SELECT * FROM CATEGORY WHERE Name = N'Tea') INSERT INTO CATEGORY (Name) VALUES (N'Tea');

-- ============================================================================
-- 3. INSERT PROVINCES
-- ============================================================================
PRINT '3. Inserting Provinces...';
DECLARE @vietnamID INT;
SELECT @vietnamID = ID FROM COUNTRY WHERE Name = N'Vietnam';

IF NOT EXISTS (SELECT * FROM PROVINCE WHERE Name = N'Hà Nội')
BEGIN
    INSERT INTO PROVINCE (Name, C_ID) VALUES
    (N'Hà Nội', @vietnamID), (N'TP. Hồ Chí Minh', @vietnamID), (N'Đà Nẵng', @vietnamID),
    (N'An Giang', @vietnamID), (N'Đồng Tháp', @vietnamID), (N'Tiền Giang', @vietnamID),
    (N'Long An', @vietnamID), (N'Bến Tre', @vietnamID), (N'Cần Thơ', @vietnamID),
    (N'Vĩnh Long', @vietnamID), (N'Thái Bình', @vietnamID), (N'Nam Định', @vietnamID),
    (N'Nghệ An', @vietnamID), (N'Thanh Hóa', @vietnamID), (N'Lâm Đồng', @vietnamID);
END

-- ============================================================================
-- 4. INSERT TYPES & AGRICULTURE PRODUCTS
-- ============================================================================
PRINT '4. Inserting Types & Agriculture Products...';

DECLARE @riceCat INT, @veggieCat INT, @fruitCat INT, @coffeeCat INT;
SELECT @riceCat = ID FROM CATEGORY WHERE Name = N'Rice';
SELECT @veggieCat = ID FROM CATEGORY WHERE Name = N'Vegetables';
SELECT @fruitCat = ID FROM CATEGORY WHERE Name = N'Fruits';
SELECT @coffeeCat = ID FROM CATEGORY WHERE Name = N'Coffee';

-- Insert TYPE 
IF NOT EXISTS (SELECT * FROM [TYPE] WHERE Variety = N'Jasmine Rice Premium')
BEGIN
    INSERT INTO [TYPE] (Variety, C_ID) VALUES
    (N'Jasmine Rice Premium', @riceCat),
    (N'Sticky Rice Organic', @riceCat),
    (N'Brown Rice Healthy', @riceCat),
    (N'Tomato Cherry', @veggieCat),
    (N'Cucumber Long', @veggieCat),
    (N'Lettuce Green', @veggieCat),
    (N'Dragon Fruit White', @fruitCat),
    (N'Dragon Fruit Red', @fruitCat),
    (N'Mango Cat Hoa Loc', @fruitCat),
    (N'Coffee Beans Arabica', @coffeeCat),
    (N'Coffee Beans Robusta', @coffeeCat);
END

-- Insert AGRICULTURE_PRODUCT 
INSERT INTO AGRICULTURE_PRODUCT (Name, Image_URL, T_ID)
SELECT 
    t.Variety, -- Dùng Variety làm tên sản phẩm
    'https://via.placeholder.com/300x200?text=' + REPLACE(t.Variety, ' ', '+'),
    t.ID
FROM [TYPE] t
WHERE NOT EXISTS (SELECT 1 FROM AGRICULTURE_PRODUCT ap WHERE ap.T_ID = t.ID);

-- ============================================================================
-- 5. INSERT FARMS 
-- ============================================================================
PRINT '5. Inserting Farms...';
DECLARE @hanoi INT, @hcm INT, @angiang INT, @dongtap INT, @lamdong INT;
SELECT @hanoi = ID FROM PROVINCE WHERE Name = N'Hà Nội';
SELECT @hcm = ID FROM PROVINCE WHERE Name = N'TP. Hồ Chí Minh';
SELECT @angiang = ID FROM PROVINCE WHERE Name = N'An Giang';
SELECT @dongtap = ID FROM PROVINCE WHERE Name = N'Đồng Tháp';
SELECT @lamdong = ID FROM PROVINCE WHERE Name = N'Lâm Đồng';

IF NOT EXISTS (SELECT * FROM FARM WHERE Name = N'Green Valley Farm')
BEGIN
    INSERT INTO FARM (Name, Owner_Name, Contact_Info, Address_detail, Longitude, Latitude, P_ID) VALUES
    (N'Green Valley Farm', N'Nguyen Van A', '0901234567', N'Ap 1, Xa A', 105.783333, 10.033333, @angiang),
    (N'Golden Rice Farm', N'Tran Thi B', '0902345678', N'Ap 2, Xa B', 105.683333, 10.433333, @dongtap),
    (N'Organic Rice Paradise', N'Le Van C', '0903456789', N'Ap 3, Xa C', 105.883333, 10.233333, @angiang),
    (N'Mekong Delta Farm Co.', N'Pham Thi D', '0904567890', N'Ap 4, Xa D', 105.583333, 10.533333, @dongtap),
    (N'Highland Organic Farm', N'Hoang Van E', '0905678901', N'Duong X, Da Lat', 108.433333, 11.933333, @lamdong),
    (N'Fresh Veggie Farm', N'Nguyen Thi F', '0906789012', N'Duong Y, Duc Trong', 108.533333, 11.833333, @lamdong),
    (N'Red River Delta Farm', N'Vu Van G', '0907890123', N'Xom 1, Soc Son', 105.850000, 21.020000, @hanoi),
    (N'Saigon Green Farm', N'Bui Thi H', '0908901234', N'Cu Chi', 106.700000, 10.800000, @hcm),
    (N'Tropical Fruit Farm', N'Do Van I', '0909012345', N'Hoc Mon', 106.600000, 10.900000, @hcm),
    (N'Superior Rice Farm', N'Mai Van J', '0900123456', N'Thap Muoi', 105.683333, 10.333333, @dongtap);
END

-- Insert Farm Certifications
DECLARE @farm1 INT = (SELECT TOP 1 ID FROM FARM WHERE Name = N'Green Valley Farm');
DECLARE @farm2 INT = (SELECT TOP 1 ID FROM FARM WHERE Name = N'Golden Rice Farm');

IF NOT EXISTS (SELECT * FROM FARM_CERTIFICATIONS WHERE F_ID = @farm1)
BEGIN
    INSERT INTO FARM_CERTIFICATIONS (F_ID, FarmCertifications) VALUES
    (@farm1, N'Organic Certification'),
    (@farm1, N'GlobalGAP'),
    (@farm2, N'VietGAP');
END

-- ============================================================================
-- 6. INSERT PROCESSING FACILITIES (Dùng Address_detail)
-- ============================================================================
PRINT '6. Inserting Processing Facilities...';
IF NOT EXISTS (SELECT * FROM PROCESSING_FACILITY WHERE License_Number = 'PF-AG-001')
BEGIN
    INSERT INTO PROCESSING_FACILITY (Name, Address_detail, Contact_Info, License_Number, P_ID) VALUES
    (N'Central Processing Plant', N'123 Industrial Zone, An Giang', '0281234567', 'PF-AG-001', @angiang),
    (N'Modern Packaging Facility', N'456 Export Processing Zone, Dong Thap', '0277654321', 'PF-DT-002', @dongtap),
    (N'Quality Control Center', N'789 Tech Park, HCMC', '0283456789', 'PF-HCM-003', @hcm);
END

-- ============================================================================
-- 7. INSERT VENDORS (Dùng Address_detail)
-- ============================================================================
PRINT '7. Inserting Vendors...';
IF NOT EXISTS (SELECT * FROM VENDOR WHERE TIN = '1234567890')
BEGIN
    INSERT INTO VENDOR (TIN, Name, Address_detail, Contact_Info, P_ID, Longitude, Latitude) VALUES
    ('1234567890', N'BigC Supermarket', N'HCMC', '0281111111', @hcm, 106.6, 10.8),
    ('2345678901', N'VinMart', N'Hanoi', '0242222222', @hanoi, 105.8, 21.0),
    ('3456789012', N'Co.opMart', N'Da Nang', '0263333333', @vietnamID, 108.2, 16.0);
END

PRINT '============================================================================';
PRINT 'MASTER DATA INSERTION COMPLETED SUCCESSFULLY!';
PRINT '============================================================================';
GO