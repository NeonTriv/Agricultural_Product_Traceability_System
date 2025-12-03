-- ============================================================================
-- INSERT MASTER DATA - Countries, Provinces, Farms, Agriculture Products
-- ============================================================================
-- Run this after BTL_LEADER_SCHEMA.sql and before INSERT_TEST_DATA_SIMPLE.sql
-- ============================================================================

USE Traceability;
GO

PRINT 'Inserting Master Data...';
PRINT '';

USE Traceability;
GO

PRINT 'Inserting Master Data...';

-- ... (Phần check data cũ giữ nguyên) ...

-- 1. INSERT COUNTRIES (Giữ nguyên)
INSERT INTO COUNTRY (Name) VALUES (N'Vietnam'), (N'Thailand'), (N'United States'), (N'Japan'), (N'China');

-- 2. INSERT CATEGORIES (Giữ nguyên)
INSERT INTO CATEGORY (Name) VALUES (N'Rice'), (N'Vegetables'), (N'Fruits'), (N'Coffee'), (N'Tea');

-- 3. INSERT PROVINCES (Giữ nguyên)
DECLARE @vietnamID INT;
SELECT @vietnamID = ID FROM COUNTRY WHERE Name = N'Vietnam';
INSERT INTO PROVINCE (Name, C_ID) VALUES
(N'Hà Nội', @vietnamID), (N'TP. Hồ Chí Minh', @vietnamID), (N'Đà Nẵng', @vietnamID),
(N'An Giang', @vietnamID), (N'Đồng Tháp', @vietnamID), (N'Tiền Giang', @vietnamID),
(N'Long An', @vietnamID), (N'Bến Tre', @vietnamID), (N'Cần Thơ', @vietnamID),
(N'Vĩnh Long', @vietnamID), (N'Thái Bình', @vietnamID), (N'Nam Định', @vietnamID),
(N'Nghệ An', @vietnamID), (N'Thanh Hóa', @vietnamID), (N'Lâm Đồng', @vietnamID);

-- 4. INSERT AGRICULTURE PRODUCTS (SỬA LẠI: Bỏ cột Name trong bảng TYPE)
PRINT '4. Inserting Agriculture Products...';
DECLARE @riceCategory INT, @veggieCategory INT, @fruitCategory INT, @coffeeCategory INT;
SELECT @riceCategory = ID FROM CATEGORY WHERE Name = N'Rice';
SELECT @veggieCategory = ID FROM CATEGORY WHERE Name = N'Vegetables';
SELECT @fruitCategory = ID FROM CATEGORY WHERE Name = N'Fruits';
SELECT @coffeeCategory = ID FROM CATEGORY WHERE Name = N'Coffee';

-- Sửa: Bỏ cột Name, chỉ insert Variety
INSERT INTO [TYPE] (Variety, C_ID) VALUES
(N'Jasmine Rice Premium', @riceCategory), -- Gộp Name cũ vào Variety
(N'Sticky Rice Organic', @riceCategory),
(N'Brown Rice Healthy', @riceCategory),
(N'Tomato Cherry', @veggieCategory),
(N'Cucumber Long', @veggieCategory),
(N'Lettuce Green', @veggieCategory),
(N'Dragon Fruit White', @fruitCategory),
(N'Dragon Fruit Red', @fruitCategory),
(N'Mango Cat Hoa Loc', @fruitCategory),
(N'Coffee Beans Arabica', @coffeeCategory),
(N'Coffee Beans Robusta', @coffeeCategory);

-- Insert Agriculture Products (Logic lấy tên từ Variety)
INSERT INTO AGRICULTURE_PRODUCT (Name, Image_URL, T_ID)
SELECT
    Variety, -- Dùng Variety làm Name sản phẩm
    'https://via.placeholder.com/300x200?text=' + REPLACE(Variety, ' ', '+'),
    ID
FROM [TYPE];

-- 5. INSERT FARMS (SỬA LẠI: Thêm Address_detail)
PRINT '5. Inserting Farms...';
DECLARE @hanoi INT, @hcm INT, @angiang INT, @dongtap INT, @lamdong INT;
SELECT @hanoi = ID FROM PROVINCE WHERE Name = N'Hà Nội';
SELECT @hcm = ID FROM PROVINCE WHERE Name = N'TP. Hồ Chí Minh';
SELECT @angiang = ID FROM PROVINCE WHERE Name = N'An Giang';
SELECT @dongtap = ID FROM PROVINCE WHERE Name = N'Đồng Tháp';
SELECT @lamdong = ID FROM PROVINCE WHERE Name = N'Lâm Đồng';

-- Sửa: Thêm cột Address_detail
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

-- ... (Phần Insert Farm Certifications giữ nguyên) ...

-- 6. INSERT PROCESSING FACILITIES (SỬA LẠI: Đổi Address thành Address_detail)
PRINT '6. Inserting Processing Facilities...';
-- Sửa: Address -> Address_detail
INSERT INTO PROCESSING_FACILITY (Name, Address_detail, Contact_Info, License_Number) VALUES
(N'Central Processing Plant', N'123 Industrial Zone, An Giang', '0281234567', 'PF-AG-001'),
(N'Modern Packaging Facility', N'456 Export Processing Zone, Dong Thap', '0277654321', 'PF-DT-002'),
(N'Quality Control Center', N'789 Tech Park, HCMC', '0283456789', 'PF-HCM-003');

-- 7. INSERT VENDORS (SỬA LẠI: Đổi Address thành Address_detail)
PRINT '7. Inserting Vendors...';
-- Sửa: Address -> Address_detail
INSERT INTO VENDOR (TIN, Name, Address_detail, Contact_Info) VALUES
('1234567890', N'BigC Supermarket', N'HCMC', '0281111111'),
('2345678901', N'VinMart', N'Hanoi', '0242222222'),
('3456789012', N'Co.opMart', N'Da Nang', '0263333333');

PRINT 'MASTER DATA INSERTION COMPLETED!';
GO
(N'Jasmine Rice', N'Premium', @riceCategory),
(N'Sticky Rice', N'Organic', @riceCategory),
(N'Brown Rice', N'Healthy', @riceCategory),
(N'Tomato', N'Cherry', @veggieCategory),
(N'Cucumber', N'Long', @veggieCategory),
(N'Lettuce', N'Green', @veggieCategory),
(N'Dragon Fruit', N'White', @fruitCategory),
(N'Dragon Fruit', N'Red', @fruitCategory),
(N'Mango', N'Cat Hoa Loc', @fruitCategory),
(N'Coffee Beans', N'Arabica', @coffeeCategory),
(N'Coffee Beans', N'Robusta', @coffeeCategory);

-- Insert Agriculture Products
INSERT INTO AGRICULTURE_PRODUCT (Name, Image_URL, T_ID)
SELECT
    Name + ' - ' + Variety,
    'https://via.placeholder.com/300x200?text=' + REPLACE(Name, ' ', '+'),
    ID
FROM [TYPE];

SELECT @productCount = COUNT(*) FROM AGRICULTURE_PRODUCT;
PRINT 'Total Agriculture Products: ' + CAST(@productCount AS VARCHAR(10));
PRINT '';

-- ============================================================================
-- 5. INSERT FARMS
-- ============================================================================
PRINT '5. Inserting Farms...';

-- Get province IDs
DECLARE @hanoi INT, @hcm INT, @angiang INT, @dongtap INT, @lamdong INT;
SELECT @hanoi = ID FROM PROVINCE WHERE Name = N'Hà Nội';
SELECT @hcm = ID FROM PROVINCE WHERE Name = N'TP. Hồ Chí Minh';
SELECT @angiang = ID FROM PROVINCE WHERE Name = N'An Giang';
SELECT @dongtap = ID FROM PROVINCE WHERE Name = N'Đồng Tháp';
SELECT @lamdong = ID FROM PROVINCE WHERE Name = N'Lâm Đồng';

-- Insert sample farms
INSERT INTO FARM (Name, Owner_Name, Contact_Info, Longitude, Latitude, P_ID) VALUES
-- Mekong Delta farms (rice)
(N'Green Valley Farm', N'Nguyen Van A', '0901234567', 105.783333, 10.033333, @angiang),
(N'Golden Rice Farm', N'Tran Thi B', '0902345678', 105.683333, 10.433333, @dongtap),
(N'Organic Rice Paradise', N'Le Van C', '0903456789', 105.883333, 10.233333, @angiang),
(N'Mekong Delta Farm Co.', N'Pham Thi D', '0904567890', 105.583333, 10.533333, @dongtap),

-- Highland farms (vegetables & fruits)
(N'Highland Organic Farm', N'Hoang Van E', '0905678901', 108.433333, 11.933333, @lamdong),
(N'Fresh Veggie Farm', N'Nguyen Thi F', '0906789012', 108.533333, 11.833333, @lamdong),

-- Northern farms
(N'Red River Delta Farm', N'Vu Van G', '0907890123', 105.850000, 21.020000, @hanoi),

-- Southern farms
(N'Saigon Green Farm', N'Bui Thi H', '0908901234', 106.700000, 10.800000, @hcm),
(N'Tropical Fruit Farm', N'Do Van I', '0909012345', 106.600000, 10.900000, @hcm),

-- Additional rice farms
(N'Superior Rice Farm', N'Mai Van J', '0900123456', 105.683333, 10.333333, @dongtap);

-- Add farm certifications
DECLARE @farm1 INT, @farm2 INT, @farm3 INT;
SELECT @farm1 = MIN(ID) FROM FARM;
SELECT @farm2 = @farm1 + 1;
SELECT @farm3 = @farm1 + 2;

INSERT INTO FARM_CERTIFICATIONS (F_ID, FarmCertifications) VALUES
(@farm1, N'Organic Certification'),
(@farm1, N'GlobalGAP'),
(@farm2, N'VietGAP'),
(@farm3, N'Organic Certification');

SELECT @farmCount = COUNT(*) FROM FARM;
PRINT 'Total Farms: ' + CAST(@farmCount AS VARCHAR(10));
PRINT '';

-- ============================================================================
-- 6. INSERT PROCESSING FACILITIES
-- ============================================================================
PRINT '6. Inserting Processing Facilities...';

INSERT INTO PROCESSING_FACILITY (Name, Address, Contact_Info, License_Number) VALUES
(N'Central Processing Plant', N'123 Industrial Zone, An Giang', '0281234567', 'PF-AG-001'),
(N'Modern Packaging Facility', N'456 Export Processing Zone, Dong Thap', '0277654321', 'PF-DT-002'),
(N'Quality Control Center', N'789 Tech Park, HCMC', '0283456789', 'PF-HCM-003');

PRINT 'Processing Facilities inserted.';
PRINT '';

-- ============================================================================
-- 7. INSERT VENDORS (Distributors/Retailers)
-- ============================================================================
PRINT '7. Inserting Vendors...';

INSERT INTO VENDOR (TIN, Name, Address, Contact_Info) VALUES
('1234567890', N'BigC Supermarket', N'HCMC', '0281111111'),
('2345678901', N'VinMart', N'Hanoi', '0242222222'),
('3456789012', N'Co.opMart', N'Da Nang', '0263333333');

PRINT 'Vendors inserted.';
PRINT '';

-- ============================================================================
-- SUMMARY
-- ============================================================================
PRINT '========================================';
PRINT 'MASTER DATA INSERTION COMPLETED!';
PRINT '========================================';

SELECT @countryCount = COUNT(*) FROM COUNTRY;
SELECT @provinceCount = COUNT(*) FROM PROVINCE;
SELECT @farmCount = COUNT(*) FROM FARM;
SELECT @productCount = COUNT(*) FROM AGRICULTURE_PRODUCT;
SELECT @categoryCount = COUNT(*) FROM CATEGORY;

PRINT 'Summary:';
PRINT '- Countries: ' + CAST(@countryCount AS VARCHAR(10));
PRINT '- Categories: ' + CAST(@categoryCount AS VARCHAR(10));
PRINT '- Provinces: ' + CAST(@provinceCount AS VARCHAR(10));
PRINT '- Farms: ' + CAST(@farmCount AS VARCHAR(10));
PRINT '- Agriculture Products: ' + CAST(@productCount AS VARCHAR(10));
PRINT '';
PRINT 'You can now run INSERT_TEST_DATA_SIMPLE.sql to insert test batches.';
PRINT '';
