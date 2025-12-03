USE Traceability;
GO

PRINT '>>> CHECK 2: AGGREGATION CORRECTNESS (Tránh Fan Trap)';

-- Giả sử ta muốn thống kê: Mỗi Farm có bao nhiêu Lô hàng (Batch) và bao nhiêu Chứng chỉ (Cert)?

-- A. QUERY DÍNH BẪY (Sẽ ra số liệu sai nếu Farm có nhiều Cert và nhiều Batch)
SELECT 
    F.Name AS Farm_Name,
    COUNT(B.ID) AS Wrong_Batch_Count,       -- Số lượng bị nhân lên sai
    COUNT(FC.F_ID) AS Wrong_Cert_Count      -- Số lượng bị nhân lên sai
FROM FARM F
JOIN BATCH B ON F.ID = B.Farm_ID
JOIN FARM_CERTIFICATIONS FC ON F.ID = FC.F_ID
GROUP BY F.Name;

-- B. QUERY CHUẨN (Sử dụng DISTINCT để loại bỏ dữ liệu trùng lặp do Fan Trap)
SELECT 
    F.Name AS Farm_Name,
    COUNT(DISTINCT B.ID) AS Correct_Batch_Count,  -- Đếm chính xác số lô hàng
    COUNT(DISTINCT FC.FarmCertifications) AS Correct_Cert_Count -- Đếm chính xác số chứng chỉ
FROM FARM F
LEFT JOIN BATCH B ON F.ID = B.Farm_ID
LEFT JOIN FARM_CERTIFICATIONS FC ON F.ID = FC.F_ID
GROUP BY F.Name;
GO