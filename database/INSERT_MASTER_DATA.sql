USE Traceability;
GO

PRINT 'POPULATING DATABASE WITH DATA';

-- 1. MASTER DATA: LOCATIONS & CATEGORIES
PRINT '1. Inserting Countries, Provinces, Categories...';

-- Countries
INSERT INTO COUNTRY (Name) VALUES 
('Vietnam'), ('Thailand'), ('United States'), ('Japan'), ('Brazil');

-- Provinces (C_ID: 1=Vietnam, 2=Thailand, 3=USA, 4=Japan, 5=Brazil)
INSERT INTO PROVINCE (Name, C_ID) VALUES 
('Hanoi', 1), 
('Ho Chi Minh City', 1), 
('Da Lat', 1), 
('Dak Lak', 1), 
('Mekong Delta', 1), 
('California', 3), 
('Washington', 3), 
('Texas', 3),
('Bangkok', 2),
('Chiang Mai', 2),
('Tokyo', 4),
('Sao Paulo', 5),
('Hai Phong', 1),
('Da Nang', 1),
('Kien Giang', 1),
('An Giang', 1);

-- Categories (ID: 1=Grain, 2=Fruit, 3=Veg, 4=Coffee, 5=Spices)
INSERT INTO CATEGORY (Name) VALUES 
('Cereal & Grain'), 
('Fruit'), 
('Vegetable'), 
('Coffee & Tea'), 
('Spices');

-- Types (T_ID: 1-2=Grain, 3-4=Coffee, 5-6=Fruit, 7=Veg, 8=Grain, C_ID: 1=Grain, 2=Fruit, 3=Veg, 4=Coffee)
INSERT INTO [TYPE] (Variety, C_ID) VALUES 
('Jasmine Rice', 1), 
('ST25 Premium Rice', 1), 
('Robusta Coffee', 4), 
('Arabica Coffee', 4), 
('Cat Chu Mango', 2), 
('Red Dragon Fruit', 2), 
('Organic Lettuce', 3), 
('Black Pepper', 1);

-- Agriculture Products (T_ID: 1=Jasmine, 2=ST25, 3=Robusta, 4=Arabica, 5=Mango, 6=Dragon, 7=Lettuce, 8=Pepper)
INSERT INTO AGRICULTURE_PRODUCT (Name, Image_URL, T_ID) VALUES 
('Golden Jasmine Rice', 'https://img.com/rice1.jpg', 1),
('Royal ST25 Rice', 'https://img.com/st25.jpg', 2),
('Highland Robusta Beans', 'https://img.com/robusta.jpg', 3),
('Da Lat Arabica Beans', 'https://img.com/arabica.jpg', 4),
('Sweet Yellow Mango', 'https://img.com/mango.jpg', 5),
('Premium Dragon Fruit', 'https://img.com/dragon.jpg', 6),
('Fresh Green Lettuce', 'https://img.com/lettuce.jpg', 7),
('Phu Quoc Black Pepper', 'https://img.com/pepper.jpg', 8);

-- 2. ENTITIES: FARMS, FACILITIES, WAREHOUSES
PRINT '2. Inserting Farms, Facilities, Warehouses...';

-- Farms (P_ID: 3=Da Lat, 2=HCM, 5=Mekong Delta, 4=Dak Lak, 15=Kien Giang, 16=An Giang, 14=Da Nang)
INSERT INTO FARM (Name, Owner_Name, Contact_Info, Address_detail, Longitude, Latitude, P_ID) VALUES 
('Sunrise Farm', 'John Doe', 'contact@sunrise.com', 'Valley Rd, Da Lat', 108.45, 11.94, 3),
('Mekong Green Fields', 'Nguyen Van A', '0901234567', 'River Side, Can Tho', 105.78, 10.03, 5),
('Highland Coffee Estate', 'Tran Thi B', '0909888777', 'Hilltop 5, Buon Ma Thuot', 108.03, 12.66, 4),
('Organic Veggie Garden', 'Le Van C', '0912345678', 'Green Zone, Da Lat', 108.44, 11.95, 3),
('Golden Rice Paddies', 'Pham Van D', '0905555555', 'Delta Zone, Long An', 106.40, 10.50, 5),
('Dragon Fruit Kingdom', 'Vo Thi E', '0906666666', 'Sunny Side, Binh Thuan', 108.10, 10.93, 2),
('Pepper Paradise', 'Mr. Hung', '0913777888', 'Phu Quoc Island', 104.00, 10.20, 15),
('Rice Excellence Farm', 'Ms. Mai', '0914888999', 'Cho Moi, An Giang', 105.50, 10.45, 16),
('Coastal Aqua Farm', 'Mr. Binh', '0915999000', 'Hoa Hai, Da Nang', 108.25, 16.05, 14);

-- Farm Certifications (F_ID: 1=Sunrise, 2=Mekong Green, 3=Highland Coffee, 4=Organic Veggie, 5=Golden Rice)
INSERT INTO FARM_CERTIFICATIONS (F_ID, FarmCertifications) VALUES 
(1, 'VietGAP'), (1, 'GlobalGAP'),
(2, 'Organic USDA'), (2, 'VietGAP'),
(3, 'Rainforest Alliance'),
(4, 'JAS Organic'),
(5, 'HACCP');

-- Processing Facilities (P_ID: 5=Mekong Delta, 4=Dak Lak, 3=Da Lat, 2=HCM)
INSERT INTO PROCESSING_FACILITY (Name, Address_detail, Contact_Info, License_Number, Longitude, Latitude, P_ID) VALUES 
('Mekong Processing Hub', 'Industrial Zone A, Can Tho', '02923888999', 'LIC-001', 105.75, 10.01, 5),
('Highland Roastery', 'Coffee St, Dak Lak', '02623555666', 'LIC-002', 108.00, 12.60, 4),
('Fresh Pack Center', 'Cool Zone, Da Lat', '02633777888', 'LIC-003', 108.46, 11.96, 3),
('Saigon Export Factory', 'Tan Thuan EPZ, D7', '02839990000', 'LIC-004', 106.70, 10.75, 2);

-- Warehouses (P_ID: 2=HCM, 5=Mekong Delta, 4=Dak Lak, 13=Hai Phong)
INSERT INTO WAREHOUSE (Capacity, Store_Condition, Address_detail, Longitude, Latitude, P_ID) VALUES 
(5000.00, 'Dry Storage', 'Warehouse A, Thu Duc', 106.75, 10.85, 2),
(2000.00, 'Cold Storage -5C', 'Cold Chain B, Long An', 106.50, 10.60, 5),
(1500.00, 'Cool Ventilation', 'Coffee Depot, Buon Ma Thuot', 108.02, 12.65, 4),
(3000.00, 'Controlled Atmosphere', 'Fruit Hub, Tien Giang', 106.35, 10.35, 5),
(10000.00, 'General Storage', 'Port Logistics, Hai Phong', 106.68, 20.85, 13);

-- 3. VENDORS & ROLES
PRINT '3. Inserting Vendors...';

-- Vendors (P_ID: 2=HCM, 5=Mekong Delta, 8=Texas)
INSERT INTO VENDOR (TIN, Name, Address_detail, Contact_Info, Longitude, Latitude, P_ID) VALUES 
('VEN-001', 'BigC Supermarket', '268 To Hien Thanh, D10', '0283863299', 106.66, 10.78, 2),
('VEN-002', 'WinMart Plus', '72 Le Thanh Ton, D1', '0283520123', 106.70, 10.77, 2),
('VEN-003', 'Aeon Mall', '30 Bo Bao Tan Thang, Tan Phu', '02862887777', 106.60, 10.80, 2),
('VEN-004', 'Whole Foods Market', '500 Lamar Blvd, Austin', '+1 512-555-0100', -97.75, 30.27, 8),
('DIST-001', 'Global Food Distribution', 'Song Than IZ, Binh Duong', '02743777888', 106.75, 10.95, 2),
('DIST-002', 'Mekong Wholesaler', 'Cai Rang, Can Tho', '02923666777', 105.70, 10.00, 5),
('LOG-001', 'Fast Express', 'Tan Binh, HCMC', '19001234', 106.65, 10.80, 2),
('LOG-002', 'Cold Chain Logistics', 'VSIP, Binh Duong', '19005678', 106.72, 10.92, 2);

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

-- 4. VENDOR PRODUCTS & PRICING
PRINT '4. Inserting Vendor Products & Prices...';

-- Vendor Products
INSERT INTO VENDOR_PRODUCT (Vendor_TIN, Unit, ValuePerUnit) VALUES 
('VEN-001', 'kg', 1),
('VEN-001', '5kg bag', 5),
('VEN-003', '500g pack', 500),
('VEN-002', 'kg', 1), 
('DIST-001', 'ton', 1000), 
('DIST-002', 'ton', 1000); 

-- Prices (VP_ID: 1=VEN-001 kg, 2=VEN-001 5kg, 3=VEN-003 500g, 4=VEN-002 kg, 5=DIST-001 ton, 6=DIST-002 ton)
INSERT INTO PRICE (V_ID, Value, Currency) VALUES
(1, 50000, 'VND'),    -- VEN-001 kg rice
(2, 240000, 'VND'),   -- VEN-001 5kg bag
(3, 25000, 'VND'),    -- VEN-003 500g
(4, 75000, 'VND'),    -- VEN-002 kg coffee
(5, 18000000, 'VND'), -- DIST-001 ton wholesale
(6, 65000000, 'VND'); -- DIST-002 ton wholesale

-- 5. DISCOUNTS & MAPPING
PRINT '5. Inserting Discounts...';

-- Discounts (ID: 1=Summer Sale, 2=New Customer, 3=Bulk Order, 4=Flash Deal)
INSERT INTO DISCOUNT (Name, Percentage, Min_Value, Max_Discount_Amount, Priority, Is_Stackable, Start_Date, Expired_Date) VALUES 
('Summer Sale 2025', 10.00, 50.00, 10.00, 1, 1, GETDATE(), DATEADD(MONTH, 3, GETDATE())),
('New Customer Promo', 15.00, 0.00, 5.00, 2, 0, GETDATE(), DATEADD(YEAR, 1, GETDATE())),
('Bulk Order Discount', 5.00, 1000.00, 100.00, 1, 1, GETDATE(), DATEADD(YEAR, 1, GETDATE())),
('Flash Deal Weekend', 20.00, 20.00, 10.00, 3, 0, GETDATE(), DATEADD(DAY, 7, GETDATE()));

-- Mapping Products to Discounts (V_ID: 1, 2, 4=kg products get discount 1; 5, 6=ton products get discount 3)
INSERT INTO PRODUCT_HAS_DISCOUNT (V_ID, Discount_ID) VALUES 
(1, 1), (2, 1), (4, 1),
(5, 3), (6, 3);

-- 6. BATCHES & OPERATIONS
PRINT '6. Inserting Batches...';

-- Batches (FARM_ID: 2=Mekong Green, 3=Highland Coffee, 4=Organic Veggie, 7=Pepper Paradise, 8=Rice Excellence)
-- (AP_ID: 1=Jasmine Rice, 2=ST25 Rice, 3=Robusta, 5=Mango, 7=Lettuce, 8=Pepper, V_ID: 1-6)
INSERT INTO BATCH (Harvest_Date, Created_By, Grade, Seed_Batch, Qr_Code_URL, Farm_ID, AP_ID, V_ID) VALUES 
('2024-11-01 07:00:00 +07:00', 'Farmer John', 'A', 'SEED-RICE-001', 'QR-001', 2, 1, 1),
('2024-11-05 08:00:00 +07:00', 'Farmer John', 'B', 'SEED-RICE-002', 'QR-002', 2, 1, 2),
('2024-10-20 09:00:00 +07:00', 'Ms. Tran', 'A', 'SEED-COF-001', 'QR-003', 3, 3, 3),
('2024-10-25 07:30:00 +07:00', 'Ms. Tran', 'Standard', 'SEED-COF-002', 'QR-004', 3, 3, 4),
('2024-12-01 06:00:00 +07:00', 'Mr. Le', 'A', 'SEED-MANGO-001', 'QR-005', 4, 5, 5),
('2024-11-15 06:30:00 +07:00', 'Mr. Hung', 'A', 'SEED-PEPPER-001', 'QR-006', 7, 8, 6),
('2024-11-20 07:00:00 +07:00', 'Ms. Mai', 'A+', 'SEED-ST25-003', 'QR-007', 8, 2, 2),
('2024-12-05 08:00:00 +07:00', 'Farmer John', 'A', 'SEED-RICE-003', 'QR-008', 2, 1, 1),
('2024-12-10 07:30:00 +07:00', 'Ms. Tran', 'A', 'SEED-COF-003', 'QR-009', 3, 3, 3),
('2024-11-25 06:00:00 +07:00', 'Mr. Le', 'A', 'SEED-LETTUCE-001', 'QR-010', 4, 7, 5); 

-- Processing (FACILITY_ID: 1=Mekong Processing Hub, 2=Highland Roastery, 4=Saigon Export)
-- (BATCH_ID: 1-10)
INSERT INTO PROCESSING (Packaging_Date, Weight_per_unit, Processed_By, Packaging_Type, Processing_Date, Facility_ID, Batch_ID) VALUES 
('2024-11-03 14:00:00 +07:00', 50.00, 'Worker X', 'Jute Bag', '2024-11-02 08:00:00 +07:00', 1, 1),
('2024-10-22 10:00:00 +07:00', 1.00, 'Worker Y', 'Vacuum Pack', '2024-10-21 09:00:00 +07:00', 2, 3),
('2024-11-04 15:00:00 +07:00', 25.00, 'Worker Z', 'Plastic Sack', '2024-11-03 09:00:00 +07:00', 1, 2),
('2024-11-17 14:00:00 +07:00', 0.50, 'Worker A', 'Glass Jar', '2024-11-16 09:00:00 +07:00', 4, 6),
('2024-11-22 15:00:00 +07:00', 25.00, 'Worker B', 'Premium Sack', '2024-11-21 08:00:00 +07:00', 1, 7),
('2024-12-07 16:00:00 +07:00', 50.00, 'Worker C', 'Jute Bag', '2024-12-06 09:00:00 +07:00', 1, 8);

-- Process Steps (P_ID: 1=Processing 1, 2=Processing 2)
INSERT INTO PROCESS_STEP (P_ID, Step) VALUES 
(1, 'Drying'), (1, 'Milling'), (1, 'Sorting'), (1, 'Packaging'),
(2, 'Roasting'), (2, 'Grinding');

-- Stored In (B_ID: 1-10, W_ID: 1=Thu Duc, 3=Coffee, 4=Fruit, 5=Port Logistics)
INSERT INTO STORED_IN (B_ID, W_ID, Quantity, Start_Date) VALUES 
(1, 1, 500.00, '2024-11-05 09:00:00 +07:00'),
(3, 3, 200.00, '2024-10-23 08:00:00 +07:00'),
(2, 1, 300.00, '2024-11-06 10:00:00 +07:00'),
(5, 4, 1000.00, '2024-12-02 07:00:00 +07:00'),
(6, 5, 150.00, '2024-11-18 10:00:00 +07:00'),
(7, 1, 800.00, '2024-11-23 09:00:00 +07:00'),
(8, 1, 600.00, '2024-12-08 08:00:00 +07:00'),
(9, 3, 250.00, '2024-12-11 07:00:00 +07:00');

-- 7. LOGISTICS: SHIPMENTS & LEGS
PRINT '7. Inserting Shipments...';

-- Shipments (DISTRIBUTOR_TIN: DIST-001, DIST-002)
INSERT INTO SHIPMENT (Status, Destination, Start_Location, Distributor_TIN) VALUES 
('Delivered', 'BigC Supermarket', 'Mekong Processing Hub', 'DIST-001'),
('In-Transit', 'Aeon Mall', 'Highland Roastery', 'DIST-002'),
('Pending', 'Whole Foods Market', 'Tan Son Nhat Airport', 'DIST-001'),
('In-Transit', 'WinMart Plus', 'Fresh Pack Center', 'DIST-001'),
('Delivered', 'Aeon Mall', 'Saigon Export Factory', 'DIST-002'),
('In-Transit', 'BigC Supermarket', 'Thu Duc Warehouse', 'DIST-001'),
('Pending', 'WinMart Plus', 'Coffee Depot', 'DIST-002');

-- Link Batches to Shipments (S_ID: 1-7, B_ID: 1-10)
INSERT INTO SHIP_BATCH (S_ID, B_ID) VALUES 
(1, 1), (2, 3), (1, 2),
(4, 8), (5, 6), (7, 9);

-- Transport Legs (SHIPMENT_ID: 1-7, CARRIER_COMPANY_TIN: LOG-001, LOG-002)
INSERT INTO TRANSPORLEG (Shipment_ID, Driver_Name, Reg_No, Temperature_Profile, Start_Location, To_Location, D_Time, A_Time, CarrierCompany_TIN) VALUES 
(1, 'Driver Tom', '59C-123.45', 'Ambient', 'Mekong Processing Hub', 'Thu Duc Warehouse', DATEADD(DAY, -5, GETDATE()), DATEADD(DAY, -4, GETDATE()), 'LOG-001'),
(1, 'Driver Jerry', '29H-567.89', 'Ambient', 'Thu Duc Warehouse', 'BigC Supermarket', DATEADD(DAY, -2, GETDATE()), DATEADD(DAY, -1, GETDATE()), 'LOG-001'),
(2, 'Driver Mike', '49C-999.00', 'Cool (18C)', 'Highland Roastery', 'Aeon Mall', DATEADD(DAY, -1, GETDATE()), GETDATE(), 'LOG-002'),
(3, 'Driver Dave', '51D-333.44', 'Frozen', 'Farm', 'Airport', NULL, NULL, 'LOG-002'),
(4, 'Driver Alex', '51A-111.22', 'Ambient', 'Fresh Pack Center', 'Thu Duc Warehouse', DATEADD(DAY, -2, GETDATE()), DATEADD(DAY, -1, GETDATE()), 'LOG-001'),
(4, 'Driver Bob', '29B-222.33', 'Ambient', 'Thu Duc Warehouse', 'WinMart Plus', DATEADD(HOUR, -12, GETDATE()), GETDATE(), 'LOG-001'),
(5, 'Driver Charlie', '79C-444.55', 'Cool (15C)', 'Saigon Export Factory', 'Aeon Mall', DATEADD(DAY, -3, GETDATE()), DATEADD(DAY, -2, GETDATE()), 'LOG-002'),
(6, 'Driver Dan', '50D-555.66', 'Ambient', 'Thu Duc Warehouse', 'BigC Supermarket', DATEADD(HOUR, -6, GETDATE()), NULL, 'LOG-001');


PRINT '============================================================================';
PRINT 'ALL DATA INSERTED SUCCESSFULLY!';
PRINT '============================================================================';
GO
