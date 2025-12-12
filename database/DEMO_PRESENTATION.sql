USE Traceability;
GO

PRINT '============================================================================';
PRINT 'INSERTING MASTER DATA (FIXED VERSION)...';
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
    t.Variety, 
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
-- 6. INSERT PROCESSING FACILITIES 
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
-- 7. INSERT VENDORS 
-- ============================================================================
PRINT '7. Inserting Vendors...';
DECLARE @danang INT;
SELECT @danang = ID FROM PROVINCE WHERE Name = N'Đà Nẵng';

IF NOT EXISTS (SELECT * FROM VENDOR WHERE TIN = '1234567890')
BEGIN
    INSERT INTO VENDOR (TIN, Name, Address_detail, Contact_Info, P_ID, Longitude, Latitude) VALUES
    ('1234567890', N'BigC Supermarket', N'268 Vo Van Kiet, Q1', '0281111111', @hcm, 106.6, 10.8),
    ('2345678901', N'VinMart', N'72 Tran Duy Hung, Cau Giay', '0242222222', @hanoi, 105.8, 21.0),
    ('3456789012', N'Co.opMart', N'478 Dien Bien Phu, Q. Thanh Khe', '0263333333', @danang, 108.2, 16.0),
    ('4567890123', N'Lotte Mart', N'469 Nguyen Huu Tho, Q7', '0284444444', @hcm, 106.7, 10.75),
    ('5678901234', N'AEON Mall', N'30 Bo Bao Tan Thang, Tan Phu', '0285555555', @hcm, 106.65, 10.82),
    ('6789012345', N'Metro Cash & Carry', N'Song Hanh, Thu Duc', '0286666666', @hcm, 106.75, 10.85);

    -- Insert Distributors
    INSERT INTO DISTRIBUTOR (Vendor_TIN, Type) VALUES
    ('1234567890', 'Direct'),
    ('2345678901', 'Direct'),
    ('4567890123', 'Indirect');

    -- Insert Retail
    INSERT INTO RETAIL (Vendor_TIN, Format) VALUES
    ('1234567890', N'Supermarket'),
    ('2345678901', N'Supermarket'),
    ('3456789012', N'Supermarket'),
    ('5678901234', N'Supermarket'),
    ('6789012345', N'Traditional Market');
END

-- ============================================================================
-- 8. INSERT CARRIER COMPANIES
-- ============================================================================
PRINT '8. Inserting Carrier Companies...';
IF NOT EXISTS (SELECT * FROM VENDOR WHERE TIN = 'CARRIER001')
BEGIN
    INSERT INTO VENDOR (TIN, Name, Address_detail, Contact_Info, P_ID, Longitude, Latitude) VALUES
    ('CARRIER001', N'Giao Hang Nhanh', N'405/15 Xo Viet Nghe Tinh, Binh Thanh', '0287777777', @hcm, 106.68, 10.81),
    ('CARRIER002', N'Viettel Post', N'285 CMT8, Q10', '0288888888', @hcm, 106.67, 10.78),
    ('CARRIER003', N'J&T Express', N'Tan Binh Industrial', '0289999999', @hcm, 106.64, 10.80);

    INSERT INTO CARRIERCOMPANY (V_TIN) VALUES
    ('CARRIER001'),
    ('CARRIER002'),
    ('CARRIER003');
END

-- ============================================================================
-- 9. INSERT WAREHOUSES
-- ============================================================================
PRINT '9. Inserting Warehouses...';
IF NOT EXISTS (SELECT * FROM WAREHOUSE WHERE Address_detail = N'KCN Tan Tao, Binh Tan')
BEGIN
    INSERT INTO WAREHOUSE (Capacity, Store_Condition, Address_detail, Longitude, Latitude, P_ID) VALUES
    (5000.00, N'Cold Storage -5°C to 5°C', N'KCN Tan Tao, Binh Tan', 106.58, 10.75, @hcm),
    (3000.00, N'Dry Storage, Climate Controlled', N'KCN VSIP, Binh Duong', 106.72, 10.92, @hcm),
    (8000.00, N'Cold Storage -20°C to 0°C', N'KCN Long Hau, Long An', 106.55, 10.68, @angiang),
    (2000.00, N'Normal Temperature', N'KCN Hoa Khanh, Da Nang', 108.15, 16.05, @danang);
END

-- ============================================================================
-- 10. INSERT VENDOR_PRODUCT
-- ============================================================================
PRINT '10. Inserting Vendor Products...';
IF NOT EXISTS (SELECT * FROM VENDOR_PRODUCT WHERE Vendor_TIN = '1234567890')
BEGIN
    DECLARE @ap1 INT, @ap2 INT, @ap3 INT, @ap4 INT, @ap5 INT;
    -- Lấy ID động từ bảng AGRICULTURE_PRODUCT để tránh lỗi hardcode
    SELECT @ap1 = ID FROM AGRICULTURE_PRODUCT ORDER BY ID OFFSET 0 ROWS FETCH NEXT 1 ROWS ONLY;
    SELECT @ap2 = ID FROM AGRICULTURE_PRODUCT ORDER BY ID OFFSET 1 ROWS FETCH NEXT 1 ROWS ONLY;
    SELECT @ap3 = ID FROM AGRICULTURE_PRODUCT ORDER BY ID OFFSET 2 ROWS FETCH NEXT 1 ROWS ONLY;
    SELECT @ap4 = ID FROM AGRICULTURE_PRODUCT ORDER BY ID OFFSET 3 ROWS FETCH NEXT 1 ROWS ONLY;
    SELECT @ap5 = ID FROM AGRICULTURE_PRODUCT ORDER BY ID OFFSET 4 ROWS FETCH NEXT 1 ROWS ONLY;

    -- Lưu ý: AP_ID được thêm vào để khớp với khóa ngoại
    INSERT INTO VENDOR_PRODUCT (Unit, Vendor_TIN, AP_ID, ValuePerUnit) VALUES
    (N'kg', '1234567890', @ap1, 20000),
    (N'túi 5kg', '1234567890', @ap2, 120000),
    (N'kg', '2345678901', @ap1, 22000),
    (N'thùng 10kg', '2345678901', @ap3, 250000),
    (N'kg', '3456789012', @ap2, 24000),
    (N'bao 25kg', '3456789012', @ap4, 500000),
    (N'kg', '4567890123', @ap1, 21000),
    (N'túi 2kg', '4567890123', @ap5, 60000),
    (N'kg', '5678901234', @ap3, 26000),
    (N'thùng 20kg', '5678901234', @ap4, 480000),
    (N'tấn', '6789012345', @ap1, 15000000),
    (N'tấn', '6789012345', @ap2, 18000000);
END

-- ============================================================================
-- 11. INSERT PRICES (Vẫn giữ nếu hệ thống dùng bảng Price riêng)
-- ============================================================================
PRINT '11. Inserting Prices...';
IF NOT EXISTS (SELECT * FROM PRICE)
BEGIN
    INSERT INTO PRICE (V_ID, Value, Currency)
    SELECT ID, 
        CASE 
            WHEN Unit = N'kg' THEN 25000 + (ID * 100)
            WHEN Unit LIKE N'túi%' THEN 120000 + (ID * 500)
            WHEN Unit LIKE N'thùng%' THEN 250000 + (ID * 1000)
            WHEN Unit LIKE N'bao%' THEN 500000 + (ID * 1500)
            WHEN Unit = N'tấn' THEN 20000000 + (ID * 10000)
            ELSE 50000
        END,
        'VND'
    FROM VENDOR_PRODUCT;
END

-- ============================================================================
-- 12. INSERT SHIPMENTS & TRANSPORT LEGS
-- ============================================================================
PRINT '12. Inserting Shipments...';
IF NOT EXISTS (SELECT * FROM SHIPMENT)
BEGIN
    -- Thêm Start_Location vì Schema yêu cầu (hoặc allow NULL tùy schema)
    INSERT INTO SHIPMENT (Status, Destination, Start_Location, Distributor_TIN) VALUES
    ('Delivered', N'BigC Supermarket - HCMC', N'KCN Long Hau', '1234567890'),
    ('In-Transit', N'VinMart - Hanoi', N'KCN VSIP', '2345678901'),
    ('Pending', N'Lotte Mart - HCMC', N'KCN Tan Tao', '4567890123'),
    ('Delivered', N'BigC Supermarket - HCMC', N'Kho Da Nang', '1234567890'),
    ('In-Transit', N'VinMart - Hanoi', N'Kho An Giang', '2345678901');
END

PRINT '13. Inserting Transport Legs...';
IF NOT EXISTS (SELECT * FROM TRANSPORLEG)
BEGIN
    DECLARE @ship1 INT, @ship2 INT;
    SELECT @ship1 = ID FROM SHIPMENT ORDER BY ID OFFSET 0 ROWS FETCH NEXT 1 ROWS ONLY;
    SELECT @ship2 = ID FROM SHIPMENT ORDER BY ID OFFSET 1 ROWS FETCH NEXT 1 ROWS ONLY;

    INSERT INTO TRANSPORLEG (Shipment_ID, Driver_Name, Temperature_Profile, Start_Location, To_Location, D_Time, A_Time, CarrierCompany_TIN) VALUES
    (@ship1, N'Nguyen Van Tai', N'{"min": 2, "max": 8, "unit": "C"}', N'KCN Long Hau, Long An', N'BigC Q1, HCMC', DATEADD(DAY, -5, GETDATE()), DATEADD(DAY, -4, GETDATE()), 'CARRIER001'),
    (@ship1, N'Tran Van Xe', N'{"min": 0, "max": 5, "unit": "C"}', N'BigC Q1, HCMC', N'BigC Q7, HCMC', DATEADD(DAY, -4, GETDATE()), DATEADD(DAY, -3, GETDATE()), 'CARRIER002'),
    (@ship2, N'Le Van Giao', N'{"min": 2, "max": 8, "unit": "C"}', N'KCN VSIP, Binh Duong', N'VinMart Cau Giay, Hanoi', DATEADD(DAY, -2, GETDATE()), NULL, 'CARRIER003');
END

-- ============================================================================
-- 13. INSERT DISCOUNTS (Đã sửa theo Schema Mới)
-- ============================================================================
PRINT '13. Inserting Discounts (Updated Schema)...';
IF NOT EXISTS (SELECT * FROM DISCOUNT)
BEGIN
    -- Không còn cột V_TIN, thêm Priority và Name
    INSERT INTO DISCOUNT (Name, Percentage, Min_Value, Max_Discount_Amount, Priority, Is_Stackable, Start_Date, Expired_Date) VALUES
    (N'Sale Mùa Hè', 10.00, 100000, 50000, 1, 1, GETDATE(), DATEADD(MONTH, 1, GETDATE())),
    (N'Siêu Sale 9/9', 15.00, 200000, 100000, 2, 0, GETDATE(), DATEADD(MONTH, 2, GETDATE())),
    (N'Khách hàng mới', 5.00, 50000, 25000, 0, 1, GETDATE(), DATEADD(WEEK, 2, GETDATE())),
    (N'Flash Sale Tết', 20.00, 500000, 200000, 3, 0, GETDATE(), DATEADD(MONTH, 1, GETDATE()));
END

-- ============================================================================
-- 14. INSERT PRODUCT_HAS_DISCOUNT (Bảng Mapping M:N mới)
-- ============================================================================
PRINT '14. Mapping Products to Discounts...';
IF NOT EXISTS (SELECT * FROM PRODUCT_HAS_DISCOUNT)
BEGIN
    DECLARE @d1 INT, @d2 INT, @d3 INT;
    -- Lấy ID của các discount vừa tạo
    SELECT @d1 = ID FROM DISCOUNT WHERE Name = N'Sale Mùa Hè';
    SELECT @d2 = ID FROM DISCOUNT WHERE Name = N'Siêu Sale 9/9';
    SELECT @d3 = ID FROM DISCOUNT WHERE Name = N'Khách hàng mới';

    -- Logic gán mẫu:
    -- 1. Gán 'Sale Mùa Hè' cho tất cả sản phẩm của BigC (TIN: 1234567890)
    INSERT INTO PRODUCT_HAS_DISCOUNT (V_ID, Discount_ID)
    SELECT ID, @d1 FROM VENDOR_PRODUCT WHERE Vendor_TIN = '1234567890';

    -- 2. Gán 'Siêu Sale 9/9' cho tất cả sản phẩm của VinMart (TIN: 2345678901)
    INSERT INTO PRODUCT_HAS_DISCOUNT (V_ID, Discount_ID)
    SELECT ID, @d2 FROM VENDOR_PRODUCT WHERE Vendor_TIN = '2345678901';
    
    -- 3. Gán 'Khách hàng mới' cho một vài sản phẩm cụ thể (Ví dụ 2 sản phẩm đầu tiên tìm thấy)
    INSERT INTO PRODUCT_HAS_DISCOUNT (V_ID, Discount_ID)
    SELECT TOP 2 ID, @d3 FROM VENDOR_PRODUCT ORDER BY ID DESC;
END

PRINT '============================================================================';
PRINT 'MASTER DATA INSERTION COMPLETED SUCCESSFULLY!';
PRINT '============================================================================';
GO