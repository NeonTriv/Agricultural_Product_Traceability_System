USE Traceability;
GO

PRINT '>>> CHECK 1: FULL TRACEABILITY PATH (Tránh Chasm Trap)';

SELECT 
    -- 1. Thông tin Nông trại & Lô hàng (Gốc)
    F.Name AS Farm_Name,
    B.Qr_Code_URL AS Batch_Code,
    B.Harvest_Date,
    
    -- 2. Thông tin Chế biến (Có thể NULL nếu chưa chế biến)
    PF.Name AS Processing_Facility,
    P.Packaging_Date,
    
    -- 3. Thông tin Vận chuyển (Có thể NULL nếu chưa xuất kho)
    S.Status AS Shipment_Status,
    S.Departured_Time,
    
    -- 4. Thông tin Nhà phân phối (Có thể NULL)
    V.Name AS Distributor_Name
    
FROM BATCH B
-- Luôn bắt đầu từ BATCH (Lô hàng)
JOIN FARM F ON B.Farm_ID = F.ID
-- Dùng LEFT JOIN để không bị mất dòng nếu chưa có dữ liệu các bước sau
LEFT JOIN PROCESSING P ON B.ID = P.Batch_ID
LEFT JOIN PROCESSING_FACILITY PF ON P.Facility_ID = PF.ID
LEFT JOIN SHIP_BATCH SB ON B.ID = SB.B_ID
LEFT JOIN SHIPMENT S ON SB.S_ID = S.ID
LEFT JOIN DISTRIBUTOR D ON S.Distributor_TIN = D.Vendor_TIN
LEFT JOIN VENDOR V ON D.Vendor_TIN = V.TIN
ORDER BY B.ID DESC;
GO