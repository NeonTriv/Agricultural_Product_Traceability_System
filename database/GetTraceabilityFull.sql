USE Traceability;
GO

CREATE OR ALTER PROCEDURE sp_GetTraceabilityFull
    @QrCodeURL VARCHAR(2048) 
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Tìm Batch ID từ mã QR
    DECLARE @BatchID INT;
    SELECT @BatchID = ID FROM BATCH WHERE Qr_Code_URL = @QrCodeURL;

    -- Nếu không tìm thấy thì báo lỗi
    IF @BatchID IS NULL
    BEGIN
        RAISERROR('Lỗi: Không tìm thấy thông tin cho mã QR này.', 16, 1);
        RETURN;
    END

    -- ==========================================================
    -- BẢNG 1: THÔNG TIN TỔNG QUAN (Sản phẩm, Lô hàng, Nông trại)
    -- ==========================================================
    SELECT 
        -- Thông tin Lô hàng
        B.Qr_Code_URL AS [Mã QR],
        B.Harvest_Date AS [Ngày Thu Hoạch],
        B.Grade AS [Xếp Hạng],
        B.Seed_Batch AS [Mã Giống],
        B.Created_By AS [Người Tạo],
        
        -- Thông tin Sản phẩm
        AP.Name AS [Tên Sản Phẩm],
        AP.Image_URL AS [Hình Ảnh],
        T.Variety AS [Giống Loại],
        C.Name AS [Danh Mục],
        
        -- Thông tin Nông trại
        F.Name AS [Tên Nông Trại],
        F.Owner_Name AS [Chủ Nông Trại],
        F.Contact_Info AS [SĐT Farm],
        P.Name + ', ' + CT.Name AS [Vùng Trồng]
        
    FROM BATCH B
    JOIN AGRICULTURE_PRODUCT AP ON B.AP_ID = AP.ID
    JOIN [TYPE] T ON AP.T_ID = T.ID
    JOIN CATEGORY C ON T.C_ID = C.ID
    JOIN FARM F ON B.Farm_ID = F.ID
    JOIN PROVINCE P ON F.P_ID = P.ID
    JOIN COUNTRY CT ON P.C_ID = CT.ID
    WHERE B.ID = @BatchID;

    -- ==========================================================
    -- BẢNG 2: CÁC CHỨNG CHỈ CỦA NÔNG TRẠI
    -- ==========================================================
    SELECT FC.FarmCertifications AS [Chứng Chỉ Đạt Được]
    FROM FARM_CERTIFICATIONS FC
    JOIN BATCH B ON FC.F_ID = B.Farm_ID
    WHERE B.ID = @BatchID;

    -- ==========================================================
    -- BẢNG 3: QUÁ TRÌNH CHẾ BIẾN & ĐÓNG GÓI
    -- ==========================================================
    SELECT
        PF.Name AS [Cơ Sở Chế Biến],
        PF.Address_detail AS [Địa Chỉ CS],
        PF.License_Number AS [Giấy Phép],
        PF.Contact_Info AS [Liên Hệ CS],
        PR.Processing_Date AS [Ngày Chế Biến],
        PR.Packaging_Date AS [Ngày Đóng Gói],
        PR.Packaging_Type AS [Quy Cách],
        PR.Weight_per_unit AS [Trọng Lượng/Gói],
        PR.Processed_By AS [Người Phụ Trách]
    FROM PROCESSING PR
    JOIN PROCESSING_FACILITY PF ON PR.Facility_ID = PF.ID
    WHERE PR.Batch_ID = @BatchID
    ORDER BY PR.Processing_Date;

    -- ==========================================================
    -- BẢNG 4: THÔNG TIN LƯU KHO
    -- ==========================================================
    SELECT
        W.Address_detail AS [Kho Lưu Trữ],
        W.Store_Condition AS [Điều Kiện Bảo Quản],
        SI.Quantity AS [Số Lượng Tồn],
        SI.Start_Date AS [Ngày Nhập Kho],
        SI.End_Date AS [Ngày Xuất Kho]
    FROM STORED_IN SI
    JOIN WAREHOUSE W ON SI.W_ID = W.ID
    WHERE SI.B_ID = @BatchID;

    -- ==========================================================
    -- BẢNG 5: VẬN CHUYỂN & PHÂN PHỐI
    -- ==========================================================
    SELECT 
        -- Vận chuyển
        S.Status AS [Trạng Thái],
        S.Destination AS [Điểm Đến],
        TL.Driver_Name AS [Tài Xế],
        TL.Temperature_Profile AS [Nhiệt Độ Xe],
        TL.Start_Location + ' -> ' + TL.To_Location AS [Lộ Trình],
        CC_Vendor.Name AS [Đơn Vị Vận Chuyển],

        -- Nhà Phân Phối
        V.Name AS [Nhà Phân Phối],
        V.Address_detail AS [Địa Chỉ NPP],
        V.Contact_Info AS [SĐT NPP],
        D.Type AS [Loại Hình PP],
        
        -- Bán Lẻ (Nếu có)
        R.Format AS [Mô Hình Bán Lẻ]
        
    FROM SHIP_BATCH SB
    JOIN SHIPMENT S ON SB.S_ID = S.ID
    LEFT JOIN TRANSPORLEG TL ON S.ID = TL.Shipment_ID
    -- Join Carrier Company (thông qua Vendor cha)
    LEFT JOIN CARRIERCOMPANY CC ON TL.CarrierCompany_TIN = CC.V_TIN
    LEFT JOIN VENDOR CC_Vendor ON CC.V_TIN = CC_Vendor.TIN

    -- Join Distributor & Vendor
    JOIN DISTRIBUTOR D ON S.Distributor_TIN = D.Vendor_TIN
    JOIN VENDOR V ON D.Vendor_TIN = V.TIN
    LEFT JOIN RETAIL R ON V.TIN = R.Vendor_TIN
    WHERE SB.B_ID = @BatchID;

    -- ==========================================================
    -- BẢNG 6: GIÁ BÁN TẠI CÁC NHÀ CUNG CẤP
    -- ==========================================================
    SELECT
        V.TIN AS [Mã Số Thuế],
        V.Name AS [Tên Nhà Cung Cấp],
        V.Address_detail AS [Địa Chỉ],
        V.Contact_Info AS [Liên Hệ],
        CASE
            WHEN D.Vendor_TIN IS NOT NULL THEN 'Distributor (' + D.Type + ')'
            WHEN R.Vendor_TIN IS NOT NULL THEN 'Retail (' + R.Format + ')'
            ELSE 'Vendor'
        END AS [Loại Hình],
        VP.Unit AS [Đơn Vị],
        VP.ValuePerUnit AS [Giá Gốc/Đơn Vị],
        P.Value AS [Giá Bán],
        P.Currency AS [Đơn Vị Tiền]
    FROM BATCH B
    JOIN VENDOR_PRODUCT VP ON B.AP_ID = VP.AP_ID
    JOIN VENDOR V ON VP.Vendor_TIN = V.TIN
    LEFT JOIN DISTRIBUTOR D ON V.TIN = D.Vendor_TIN
    LEFT JOIN RETAIL R ON V.TIN = R.Vendor_TIN
    LEFT JOIN PRICE P ON VP.ID = P.V_ID
    WHERE B.ID = @BatchID
    ORDER BY V.Name;

END;
GO