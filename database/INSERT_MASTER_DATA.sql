USE Traceability;
GO

PRINT '============================================================================';
PRINT 'POPULATING DATABASE WITH DATA';
PRINT '============================================================================';

-- ============================================================================
-- 1. MASTER DATA: LOCATIONS & CATEGORIES
-- ============================================================================
PRINT '1. Inserting Countries, Provinces, Categories...';

-- Countries
INSERT INTO COUNTRY (Name) VALUES 
('Vietnam'), ('Thailand'), ('United States'), ('Japan'), ('Brazil');

DECLARE @vnId INT = (SELECT ID FROM COUNTRY WHERE Name = 'Vietnam');
DECLARE @usId INT = (SELECT ID FROM COUNTRY WHERE Name = 'United States');

-- Provinces 
INSERT INTO PROVINCE (Name, C_ID) VALUES 
('Hanoi', @vnId), 
('Ho Chi Minh City', @vnId), 
('Da Lat', @vnId), 
('Dak Lak', @vnId), 
('Mekong Delta', @vnId), 
('California', @usId), 
('Washington', @usId), 
('Texas', @usId);

-- Categories 
INSERT INTO CATEGORY (Name) VALUES 
('Cereal & Grain'), 
('Fruit'), 
('Vegetable'), 
('Coffee & Tea'), 
('Spices');

DECLARE @grainId INT = (SELECT ID FROM CATEGORY WHERE Name = 'Cereal & Grain');
DECLARE @fruitId INT = (SELECT ID FROM CATEGORY WHERE Name = 'Fruit');
DECLARE @vegId INT = (SELECT ID FROM CATEGORY WHERE Name = 'Vegetable');
DECLARE @coffeeId INT = (SELECT ID FROM CATEGORY WHERE Name = 'Coffee & Tea');

-- Types 
INSERT INTO [TYPE] (Variety, C_ID) VALUES 
('Jasmine Rice', @grainId), 
('ST25 Premium Rice', @grainId), 
('Robusta Coffee', @coffeeId), 
('Arabica Coffee', @coffeeId), 
('Cat Chu Mango', @fruitId), 
('Red Dragon Fruit', @fruitId), 
('Organic Lettuce', @vegId), 
('Black Pepper', @grainId); 

-- Agriculture Products 
DECLARE @t1 INT = (SELECT ID FROM [TYPE] WHERE Variety = 'Jasmine Rice');
DECLARE @t2 INT = (SELECT ID FROM [TYPE] WHERE Variety = 'ST25 Premium Rice');
DECLARE @t3 INT = (SELECT ID FROM [TYPE] WHERE Variety = 'Robusta Coffee');
DECLARE @t4 INT = (SELECT ID FROM [TYPE] WHERE Variety = 'Cat Chu Mango');
DECLARE @t5 INT = (SELECT ID FROM [TYPE] WHERE Variety = 'Red Dragon Fruit');

INSERT INTO AGRICULTURE_PRODUCT (Name, Image_URL, T_ID) VALUES 
('Golden Jasmine Rice', 'https://img.com/rice1.jpg', @t1),
('Royal ST25 Rice', 'https://img.com/st25.jpg', @t2),
('Highland Robusta Beans', 'https://img.com/robusta.jpg', @t3),
('Da Lat Arabica Beans', 'https://img.com/arabica.jpg', (SELECT ID FROM [TYPE] WHERE Variety = 'Arabica Coffee')),
('Sweet Yellow Mango', 'https://img.com/mango.jpg', @t4),
('Premium Dragon Fruit', 'https://img.com/dragon.jpg', @t5),
('Fresh Green Lettuce', 'https://img.com/lettuce.jpg', (SELECT ID FROM [TYPE] WHERE Variety = 'Organic Lettuce')),
('Phu Quoc Black Pepper', 'https://img.com/pepper.jpg', (SELECT ID FROM [TYPE] WHERE Variety = 'Black Pepper'));

-- ============================================================================
-- 2. ENTITIES: FARMS, FACILITIES, WAREHOUSES
-- ============================================================================
PRINT '2. Inserting Farms, Facilities, Warehouses...';

DECLARE @dalatId INT = (SELECT ID FROM PROVINCE WHERE Name = 'Da Lat');
DECLARE @hcmId INT = (SELECT ID FROM PROVINCE WHERE Name = 'Ho Chi Minh City');
DECLARE @mekongId INT = (SELECT ID FROM PROVINCE WHERE Name = 'Mekong Delta');

-- Farms 
INSERT INTO FARM (Name, Owner_Name, Contact_Info, Address_detail, Longitude, Latitude, P_ID) VALUES 
('Sunrise Farm', 'John Doe', 'contact@sunrise.com', 'Valley Rd, Da Lat', 108.45, 11.94, @dalatId),
('Mekong Green Fields', 'Nguyen Van A', '0901234567', 'River Side, Can Tho', 105.78, 10.03, @mekongId),
('Highland Coffee Estate', 'Tran Thi B', '0909888777', 'Hilltop 5, Buon Ma Thuot', 108.03, 12.66, (SELECT ID FROM PROVINCE WHERE Name = 'Dak Lak')),
('Organic Veggie Garden', 'Le Van C', '0912345678', 'Green Zone, Da Lat', 108.44, 11.95, @dalatId),
('Golden Rice Paddies', 'Pham Van D', '0905555555', 'Delta Zone, Long An', 106.40, 10.50, @mekongId),
('Dragon Fruit Kingdom', 'Vo Thi E', '0906666666', 'Sunny Side, Binh Thuan', 108.10, 10.93, @hcmId); 

-- Farm Certifications 
DECLARE @f1 INT = (SELECT ID FROM FARM WHERE Name = 'Sunrise Farm');
DECLARE @f2 INT = (SELECT ID FROM FARM WHERE Name = 'Mekong Green Fields');
INSERT INTO FARM_CERTIFICATIONS (F_ID, FarmCertifications) VALUES 
(@f1, 'VietGAP'), (@f1, 'GlobalGAP'),
(@f2, 'Organic USDA'), (@f2, 'VietGAP'),
((SELECT ID FROM FARM WHERE Name = 'Highland Coffee Estate'), 'Rainforest Alliance'),
((SELECT ID FROM FARM WHERE Name = 'Organic Veggie Garden'), 'JAS Organic'),
((SELECT ID FROM FARM WHERE Name = 'Golden Rice Paddies'), 'HACCP');

-- Processing Facilities 
INSERT INTO PROCESSING_FACILITY (Name, Address_detail, Contact_Info, License_Number, Longitude, Latitude, P_ID) VALUES 
('Mekong Processing Hub', 'Industrial Zone A, Can Tho', '02923888999', 'LIC-001', 105.75, 10.01, @mekongId),
('Highland Roastery', 'Coffee St, Dak Lak', '02623555666', 'LIC-002', 108.00, 12.60, (SELECT ID FROM PROVINCE WHERE Name = 'Dak Lak')),
('Fresh Pack Center', 'Cool Zone, Da Lat', '02633777888', 'LIC-003', 108.46, 11.96, @dalatId),
('Saigon Export Factory', 'Tan Thuan EPZ, D7', '02839990000', 'LIC-004', 106.70, 10.75, @hcmId);

-- Warehouses (5 rows)
INSERT INTO WAREHOUSE (Capacity, Store_Condition, Address_detail, Longitude, Latitude, P_ID) VALUES 
(5000.00, 'Dry Storage', 'Warehouse A, Thu Duc', 106.75, 10.85, @hcmId),
(2000.00, 'Cold Storage -5C', 'Cold Chain B, Long An', 106.50, 10.60, @mekongId),
(1500.00, 'Cool Ventilation', 'Coffee Depot, Buon Ma Thuot', 108.02, 12.65, (SELECT ID FROM PROVINCE WHERE Name = 'Dak Lak')),
(3000.00, 'Controlled Atmosphere', 'Fruit Hub, Tien Giang', 106.35, 10.35, @mekongId),
(10000.00, 'General Storage', 'Port Logistics, Hai Phong', 106.68, 20.85, (SELECT ID FROM PROVINCE WHERE Name = 'Hanoi'));

-- ============================================================================
-- 3. VENDORS & ROLES
-- ============================================================================
PRINT '3. Inserting Vendors...';

-- Vendors 
INSERT INTO VENDOR (TIN, Name, Address_detail, Contact_Info, Longitude, Latitude, P_ID) VALUES 
('VEN-001', 'BigC Supermarket', '268 To Hien Thanh, D10', '0283863299', 106.66, 10.78, @hcmId),
('VEN-002', 'WinMart Plus', '72 Le Thanh Ton, D1', '0283520123', 106.70, 10.77, @hcmId),
('VEN-003', 'Aeon Mall', '30 Bo Bao Tan Thang, Tan Phu', '02862887777', 106.60, 10.80, @hcmId),
('VEN-004', 'Whole Foods Market', '500 Lamar Blvd, Austin', '+1 512-555-0100', -97.75, 30.27, (SELECT ID FROM PROVINCE WHERE Name = 'Texas')),
('DIST-001', 'Global Food Distribution', 'Song Than IZ, Binh Duong', '02743777888', 106.75, 10.95, @hcmId),
('DIST-002', 'Mekong Wholesaler', 'Cai Rang, Can Tho', '02923666777', 105.70, 10.00, @mekongId),
('LOG-001', 'Fast Express', 'Tan Binh, HCMC', '19001234', 106.65, 10.80, @hcmId),
('LOG-002', 'Cold Chain Logistics', 'VSIP, Binh Duong', '19005678', 106.72, 10.92, @hcmId);

-- Assign Roles
INSERT INTO RETAIL (Vendor_TIN, Format) VALUES 
('VEN-001', 'Supermarket'), 
('VEN-002', 'Convenience Store'), 
('VEN-003', 'Supermarket'), 
('VEN-004', 'Specialty Shop'),
('LOG-001', 'Supermarket'),
('LOG-002', 'Convenience Store');

INSERT INTO DISTRIBUTOR (Vendor_TIN, Type) VALUES 
('DIST-001', 'Direct'), 
('DIST-002', 'Indirect'),
('LOG-001', 'Indirect'),
('LOG-002', 'Direct');

INSERT INTO CARRIERCOMPANY (V_TIN) VALUES 
('LOG-001'), 
('LOG-002');

-- ============================================================================
-- 4. VENDOR PRODUCTS & PRICING
-- ============================================================================
PRINT '4. Inserting Vendor Products & Prices...';

DECLARE @ap1 INT = (SELECT ID FROM AGRICULTURE_PRODUCT WHERE Name = 'Golden Jasmine Rice');
DECLARE @ap2 INT = (SELECT ID FROM AGRICULTURE_PRODUCT WHERE Name = 'Highland Robusta Beans');
DECLARE @ap3 INT = (SELECT ID FROM AGRICULTURE_PRODUCT WHERE Name = 'Sweet Yellow Mango');

-- Vendor Products
INSERT INTO VENDOR_PRODUCT (Vendor_TIN, Unit, ValuePerUnit) VALUES 
('VEN-001', 'kg', 1),
('VEN-001', '5kg bag', 5),
('VEN-003', '500g pack', 500),
('VEN-002', 'kg', 1), 
('DIST-001', 'ton', 1000), 
('DIST-002', 'ton', 1000); 

-- Prices - 
INSERT INTO PRICE (V_ID, Value, Currency) VALUES
(1, 50000, 'VND'),    
(2, 240000, 'VND'),   
(3, 25000, 'VND'),   
(4, 75000, 'VND'),    
(5, 18000000, 'VND'), 
(6, 65000000, 'VND');

-- ============================================================================
-- 5. DISCOUNTS & MAPPING
-- ============================================================================
PRINT '5. Inserting Discounts...';

-- Discounts 
INSERT INTO DISCOUNT (Name, Percentage, Min_Value, Max_Discount_Amount, Priority, Is_Stackable, Start_Date, Expired_Date) VALUES 
('Summer Sale 2025', 10.00, 50.00, 10.00, 1, 1, GETDATE(), DATEADD(MONTH, 3, GETDATE())),
('New Customer Promo', 15.00, 0.00, 5.00, 2, 0, GETDATE(), DATEADD(YEAR, 1, GETDATE())),
('Bulk Order Discount', 5.00, 1000.00, 100.00, 1, 1, GETDATE(), DATEADD(YEAR, 1, GETDATE())),
('Flash Deal Weekend', 20.00, 20.00, 10.00, 3, 0, GETDATE(), DATEADD(DAY, 7, GETDATE()));

-- Mapping Products to Discounts 
DECLARE @d1 INT = (SELECT ID FROM DISCOUNT WHERE Name = 'Summer Sale 2025');
DECLARE @d2 INT = (SELECT ID FROM DISCOUNT WHERE Name = 'Bulk Order Discount');

INSERT INTO PRODUCT_HAS_DISCOUNT (V_ID, Discount_ID) 
SELECT TOP 3 ID, @d1 FROM VENDOR_PRODUCT WHERE Unit = 'kg';

INSERT INTO PRODUCT_HAS_DISCOUNT (V_ID, Discount_ID) 
SELECT ID, @d2 FROM VENDOR_PRODUCT WHERE Unit = 'ton';

-- ============================================================================
-- 6. BATCHES & OPERATIONS
-- ============================================================================
PRINT '6. Inserting Batches...';

-- Batches (5 rows)
DECLARE @farmId1 INT = (SELECT ID FROM FARM WHERE Name = 'Mekong Green Fields');
DECLARE @farmId2 INT = (SELECT ID FROM FARM WHERE Name = 'Highland Coffee Estate');

INSERT INTO BATCH (Harvest_Date, Created_By, Grade, Seed_Batch, Qr_Code_URL, Farm_ID, AP_ID, V_ID) VALUES 
('2024-11-01 07:00:00 +07:00', 'Farmer John', 'A', 'SEED-RICE-001', 'QR-001', @farmId1, @ap1, 1),
('2024-11-05 08:00:00 +07:00', 'Farmer John', 'B', 'SEED-RICE-002', 'QR-002', @farmId1, @ap1, 2),
('2024-10-20 09:00:00 +07:00', 'Ms. Tran', 'Premium', 'SEED-COF-001', 'QR-003', @farmId2, @ap2, 3),
('2024-10-25 07:30:00 +07:00', 'Ms. Tran', 'Standard', 'SEED-COF-002', 'QR-004', @farmId2, @ap2, 4),
('2024-12-01 06:00:00 +07:00', 'Mr. Le', 'A', 'SEED-MANGO-001', 'QR-005', (SELECT ID FROM FARM WHERE Name = 'Organic Veggie Garden'), @ap3, 5); 

-- Processing 
DECLARE @b1 INT = (SELECT ID FROM BATCH WHERE Qr_Code_URL = 'QR-001');
DECLARE @b3 INT = (SELECT ID FROM BATCH WHERE Qr_Code_URL = 'QR-003');
DECLARE @fac1 INT = (SELECT ID FROM PROCESSING_FACILITY WHERE Name = 'Mekong Processing Hub');

INSERT INTO PROCESSING (Packaging_Date, Weight_per_unit, Processed_By, Packaging_Type, Processing_Date, Facility_ID, Batch_ID) VALUES 
('2024-11-03 14:00:00 +07:00', 50.00, 'Worker X', 'Jute Bag', '2024-11-02 08:00:00 +07:00', @fac1, @b1),
('2024-10-22 10:00:00 +07:00', 1.00, 'Worker Y', 'Vacuum Pack', '2024-10-21 09:00:00 +07:00', (SELECT ID FROM PROCESSING_FACILITY WHERE Name = 'Highland Roastery'), @b3),
('2024-11-04 15:00:00 +07:00', 25.00, 'Worker Z', 'Plastic Sack', '2024-11-03 09:00:00 +07:00', @fac1, (SELECT ID FROM BATCH WHERE Qr_Code_URL = 'QR-002'));

-- Process Steps 
DECLARE @proc1 INT = (SELECT TOP 1 ID FROM PROCESSING WHERE Batch_ID = @b1);
INSERT INTO PROCESS_STEP (P_ID, Step) VALUES 
(@proc1, 'Drying'), (@proc1, 'Milling'), (@proc1, 'Sorting'), (@proc1, 'Packaging');

DECLARE @proc2 INT = (SELECT TOP 1 ID FROM PROCESSING WHERE Batch_ID = @b3);
INSERT INTO PROCESS_STEP (P_ID, Step) VALUES 
(@proc2, 'Roasting'), (@proc2, 'Grinding');

-- Stored In 
DECLARE @wh1 INT = (SELECT ID FROM WAREHOUSE WHERE Address_detail LIKE '%Thu Duc%');
INSERT INTO STORED_IN (B_ID, W_ID, Quantity, Start_Date) VALUES 
(@b1, @wh1, 500.00, '2024-11-05 09:00:00 +07:00'),
(@b3, (SELECT ID FROM WAREHOUSE WHERE Address_detail LIKE '%Coffee%'), 200.00, '2024-10-23 08:00:00 +07:00'),
((SELECT ID FROM BATCH WHERE Qr_Code_URL = 'QR-002'), @wh1, 300.00, '2024-11-06 10:00:00 +07:00'),
((SELECT ID FROM BATCH WHERE Qr_Code_URL = 'QR-005'), (SELECT ID FROM WAREHOUSE WHERE Address_detail LIKE '%Fruit%'), 1000.00, '2024-12-02 07:00:00 +07:00');

-- ============================================================================
-- 7. LOGISTICS: SHIPMENTS & LEGS
-- ============================================================================
PRINT '7. Inserting Shipments...';

INSERT INTO SHIPMENT (Status, Destination, Start_Location, Distributor_TIN) VALUES 
('Delivered', 'BigC Supermarket', 'Mekong Processing Hub', 'DIST-001'),
('In-Transit', 'Aeon Mall', 'Highland Roastery', 'DIST-002'),
('Pending', 'Whole Foods Market', 'Tan Son Nhat Airport', 'DIST-001');

DECLARE @s1 INT = (SELECT TOP 1 ID FROM SHIPMENT WHERE Destination = 'BigC Supermarket');
DECLARE @s2 INT = (SELECT TOP 1 ID FROM SHIPMENT WHERE Destination = 'Aeon Mall');

-- Link Batches to Shipment 
INSERT INTO SHIP_BATCH (S_ID, B_ID) VALUES 
(@s1, @b1), 
(@s2, @b3),
(@s1, (SELECT ID FROM BATCH WHERE Qr_Code_URL = 'QR-002'));

-- Transport Legs 
INSERT INTO TRANSPORLEG (Shipment_ID, Driver_Name, Reg_No, Temperature_Profile, Start_Location, To_Location, D_Time, A_Time, CarrierCompany_TIN) VALUES 
(@s1, 'Driver Tom', '59C-123.45', 'Ambient', 'Mekong Processing Hub', 'Thu Duc Warehouse', DATEADD(DAY, -5, GETDATE()), DATEADD(DAY, -4, GETDATE()), 'LOG-001'),
(@s1, 'Driver Jerry', '29H-567.89', 'Ambient', 'Thu Duc Warehouse', 'BigC Supermarket', DATEADD(DAY, -2, GETDATE()), DATEADD(DAY, -1, GETDATE()), 'LOG-001'),
(@s2, 'Driver Mike', '49C-999.00', 'Cool (18C)', 'Highland Roastery', 'Aeon Mall', DATEADD(DAY, -1, GETDATE()), GETDATE(), 'LOG-002'),
((SELECT TOP 1 ID FROM SHIPMENT WHERE Status = 'Pending'), 'Driver Dave', '51D-333.44', 'Frozen', 'Farm', 'Airport', NULL, NULL, 'LOG-002');

-- ============================================================================
-- 8. ADDITIONAL DATA FOR TESTING
-- ============================================================================
PRINT '8. Inserting Additional Test Data...';

-- More Countries & Provinces
DECLARE @thId INT = (SELECT ID FROM COUNTRY WHERE Name = 'Thailand');
DECLARE @jpId INT = (SELECT ID FROM COUNTRY WHERE Name = 'Japan');
DECLARE @brId INT = (SELECT ID FROM COUNTRY WHERE Name = 'Brazil');

INSERT INTO PROVINCE (Name, C_ID) VALUES 
('Bangkok', @thId),
('Chiang Mai', @thId),
('Tokyo', @jpId),
('Sao Paulo', @brId),
('Hai Phong', @vnId),
('Da Nang', @vnId),
('Kien Giang', @vnId),
('An Giang', @vnId);

-- More Farms
DECLARE @kgId INT = (SELECT ID FROM PROVINCE WHERE Name = 'Kien Giang');
DECLARE @agId INT = (SELECT ID FROM PROVINCE WHERE Name = 'An Giang');
DECLARE @dnId INT = (SELECT ID FROM PROVINCE WHERE Name = 'Da Nang');

INSERT INTO FARM (Name, Owner_Name, Contact_Info, Address_detail, Longitude, Latitude, P_ID) VALUES 
('Pepper Paradise', 'Mr. Hung', '0913777888', 'Phu Quoc Island', 104.00, 10.20, @kgId),
('Rice Excellence Farm', 'Ms. Mai', '0914888999', 'Cho Moi, An Giang', 105.50, 10.45, @agId),
('Coastal Aqua Farm', 'Mr. Binh', '0915999000', 'Hoa Hai, Da Nang', 108.25, 16.05, @dnId);

-- More Batches
DECLARE @f7 INT = (SELECT ID FROM FARM WHERE Name = 'Pepper Paradise');
DECLARE @f8 INT = (SELECT ID FROM FARM WHERE Name = 'Rice Excellence Farm');
DECLARE @ap_pepper INT = (SELECT ID FROM AGRICULTURE_PRODUCT WHERE Name = 'Phu Quoc Black Pepper');
DECLARE @ap_rice INT = (SELECT ID FROM AGRICULTURE_PRODUCT WHERE Name = 'Royal ST25 Rice');

INSERT INTO BATCH (Harvest_Date, Created_By, Grade, Seed_Batch, Qr_Code_URL, Farm_ID, AP_ID, V_ID) VALUES 
('2024-11-15 06:30:00 +07:00', 'Mr. Hung', 'Premium', 'SEED-PEPPER-001', 'QR-006', @f7, @ap_pepper, 6),
('2024-11-20 07:00:00 +07:00', 'Ms. Mai', 'A+', 'SEED-ST25-003', 'QR-007', @f8, @ap_rice, 2),
('2024-12-05 08:00:00 +07:00', 'Farmer John', 'A', 'SEED-RICE-003', 'QR-008', @farmId1, @ap1, 1),
('2024-12-10 07:30:00 +07:00', 'Ms. Tran', 'Premium', 'SEED-COF-003', 'QR-009', @farmId2, @ap2, 3),
('2024-11-25 06:00:00 +07:00', 'Mr. Le', 'A', 'SEED-LETTUCE-001', 'QR-010', (SELECT ID FROM FARM WHERE Name = 'Organic Veggie Garden'), (SELECT ID FROM AGRICULTURE_PRODUCT WHERE Name = 'Fresh Green Lettuce'), 5);

-- More Processing
DECLARE @b6 INT = (SELECT ID FROM BATCH WHERE Qr_Code_URL = 'QR-006');
DECLARE @b7 INT = (SELECT ID FROM BATCH WHERE Qr_Code_URL = 'QR-007');
DECLARE @fac3 INT = (SELECT ID FROM PROCESSING_FACILITY WHERE Name = 'Fresh Pack Center');

INSERT INTO PROCESSING (Packaging_Date, Weight_per_unit, Processed_By, Packaging_Type, Processing_Date, Facility_ID, Batch_ID) VALUES 
('2024-11-17 14:00:00 +07:00', 0.50, 'Worker A', 'Glass Jar', '2024-11-16 09:00:00 +07:00', (SELECT ID FROM PROCESSING_FACILITY WHERE Name = 'Saigon Export Factory'), @b6),
('2024-11-22 15:00:00 +07:00', 25.00, 'Worker B', 'Premium Sack', '2024-11-21 08:00:00 +07:00', @fac1, @b7),
('2024-12-07 16:00:00 +07:00', 50.00, 'Worker C', 'Jute Bag', '2024-12-06 09:00:00 +07:00', @fac1, (SELECT ID FROM BATCH WHERE Qr_Code_URL = 'QR-008'));

-- More Stored In
INSERT INTO STORED_IN (B_ID, W_ID, Quantity, Start_Date) VALUES 
(@b6, (SELECT ID FROM WAREHOUSE WHERE Address_detail LIKE '%Port%'), 150.00, '2024-11-18 10:00:00 +07:00'),
(@b7, @wh1, 800.00, '2024-11-23 09:00:00 +07:00'),
((SELECT ID FROM BATCH WHERE Qr_Code_URL = 'QR-008'), @wh1, 600.00, '2024-12-08 08:00:00 +07:00'),
((SELECT ID FROM BATCH WHERE Qr_Code_URL = 'QR-009'), (SELECT ID FROM WAREHOUSE WHERE Address_detail LIKE '%Coffee%'), 250.00, '2024-12-11 07:00:00 +07:00');

-- More Shipments
INSERT INTO SHIPMENT (Status, Destination, Start_Location, Distributor_TIN) VALUES 
('In-Transit', 'WinMart Plus', 'Fresh Pack Center', 'DIST-001'),
('Delivered', 'Aeon Mall', 'Saigon Export Factory', 'DIST-002'),
('In-Transit', 'BigC Supermarket', 'Thu Duc Warehouse', 'DIST-001'),
('Pending', 'WinMart Plus', 'Coffee Depot', 'DIST-002');

-- Link More Batches to Shipments
DECLARE @s3 INT = (SELECT TOP 1 ID FROM SHIPMENT WHERE Destination = 'WinMart Plus' AND Status = 'In-Transit');
DECLARE @s4 INT = (SELECT TOP 1 ID FROM SHIPMENT WHERE Destination = 'Aeon Mall' AND Status = 'Delivered');

INSERT INTO SHIP_BATCH (S_ID, B_ID) VALUES 
(@s3, (SELECT ID FROM BATCH WHERE Qr_Code_URL = 'QR-008')),
(@s4, @b6),
((SELECT TOP 1 ID FROM SHIPMENT WHERE Status = 'Pending' AND Destination = 'WinMart Plus'), (SELECT ID FROM BATCH WHERE Qr_Code_URL = 'QR-009'));

-- More Transport Legs
INSERT INTO TRANSPORLEG (Shipment_ID, Driver_Name, Reg_No, Temperature_Profile, Start_Location, To_Location, D_Time, A_Time, CarrierCompany_TIN) VALUES 
(@s3, 'Driver Alex', '51A-111.22', 'Ambient', 'Fresh Pack Center', 'Thu Duc Warehouse', DATEADD(DAY, -2, GETDATE()), DATEADD(DAY, -1, GETDATE()), 'LOG-001'),
(@s3, 'Driver Bob', '29B-222.33', 'Ambient', 'Thu Duc Warehouse', 'WinMart Plus', DATEADD(HOUR, -12, GETDATE()), GETDATE(), 'LOG-001'),
(@s4, 'Driver Charlie', '79C-444.55', 'Cool (15C)', 'Saigon Export Factory', 'Aeon Mall', DATEADD(DAY, -3, GETDATE()), DATEADD(DAY, -2, GETDATE()), 'LOG-002'),
((SELECT TOP 1 ID FROM SHIPMENT WHERE Status = 'In-Transit' AND Destination = 'BigC Supermarket'), 'Driver Dan', '50D-555.66', 'Ambient', 'Thu Duc Warehouse', 'BigC Supermarket', DATEADD(HOUR, -6, GETDATE()), NULL, 'LOG-001');

PRINT '============================================================================';
PRINT 'ALL DATA INSERTED SUCCESSFULLY!';
PRINT '============================================================================';
GO
