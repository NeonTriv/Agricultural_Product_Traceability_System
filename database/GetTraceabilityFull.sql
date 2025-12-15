USE Traceability;
GO

CREATE OR ALTER PROCEDURE sp_GetTraceabilityFull_JSON
    @QrCodeURL VARCHAR(2048) 
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Look up BatchID 
    DECLARE @BatchID INT;
    SELECT @BatchID = ID FROM BATCH WHERE Qr_Code_URL = @QrCodeURL;

    -- 2. Validate: If not found, return JSON Error
    IF @BatchID IS NULL
    BEGIN
        SELECT 
            404 AS [Status], 
            'QR Code not found or invalid.' AS [Message] 
        FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
        RETURN;
    END

    -- 3. Return Full Traceability Data
    SELECT 
        -- A. OVERVIEW (Product, Batch, Farm info)
        (SELECT 
            B.Qr_Code_URL AS [QrCodeUrl],
            B.Harvest_Date AS [HarvestDate],
            B.Grade AS [Grade],
            B.Seed_Batch AS [SeedBatch],
            B.Created_By AS [CreatedBy],
            
            -- Product Info
            AP.Name AS [ProductName],
            AP.Image_URL AS [ImageUrl],
            T.Variety AS [Variety],
            C.Name AS [Category],
            
            -- Farm Info
            F.Name AS [FarmName],
            F.Owner_Name AS [FarmOwner],
            F.Contact_Info AS [FarmContact],
            P.Name + ', ' + CT.Name AS [Region]
            
         FROM BATCH B
         JOIN AGRICULTURE_PRODUCT AP ON B.AP_ID = AP.ID
         JOIN [TYPE] T ON AP.T_ID = T.ID
         JOIN CATEGORY C ON T.C_ID = C.ID
         JOIN FARM F ON B.Farm_ID = F.ID
         JOIN PROVINCE P ON F.P_ID = P.ID
         JOIN COUNTRY CT ON P.C_ID = CT.ID
         WHERE B.ID = @BatchID
         FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
        ) AS [Overview],

        -- B. CERTIFICATIONS
        (SELECT FC.FarmCertifications AS [CertificationName]
         FROM FARM_CERTIFICATIONS FC
         JOIN BATCH B ON FC.F_ID = B.Farm_ID
         WHERE B.ID = @BatchID
         FOR JSON PATH
        ) AS [Certifications],

        -- C. PROCESSING LOGS
        (SELECT 
            PF.Name AS [FacilityName],
            PF.Address_detail AS [FacilityAddress],
            PF.License_Number AS [LicenseNumber],
            PR.Processing_Date AS [ProcessingDate],
            PR.Packaging_Date AS [PackagingDate],
            PR.Packaging_Type AS [PackagingType],
            PR.Weight_per_unit AS [WeightPerUnit],
            PR.Processed_By AS [ProcessedBy]
         FROM PROCESSING PR
         JOIN PROCESSING_FACILITY PF ON PR.Facility_ID = PF.ID
         WHERE PR.Batch_ID = @BatchID
         ORDER BY PR.Processing_Date
         FOR JSON PATH
        ) AS [ProcessingLogs],

        -- D. STORAGE LOGS
        (SELECT 
            W.Address_detail AS [WarehouseAddress],
            W.Store_Condition AS [StorageCondition],
            SI.Quantity AS [QuantityStored],
            SI.Start_Date AS [CheckInDate],
            SI.End_Date AS [CheckOutDate]
         FROM STORED_IN SI
         JOIN WAREHOUSE W ON SI.W_ID = W.ID
         WHERE SI.B_ID = @BatchID
         FOR JSON PATH
        ) AS [StorageLogs],

        -- E. DISTRIBUTION & TRANSPORT
        (SELECT 
            S.Status AS [ShipmentStatus],
            S.Destination AS [Destination],
            
            -- Transport Leg Info
            TL.Driver_Name AS [DriverName],
            TL.Temperature_Profile AS [TemperatureProfile],
            TL.Start_Location + ' -> ' + TL.To_Location AS [Route],
            CC_Vendor.Name AS [CarrierCompany],

            -- Distributor Info
            V.Name AS [DistributorName],
            V.Contact_Info AS [DistributorContact],
            D.Type AS [DistributorType],
            
            -- Retail Info (if applicable)
            R.Format AS [RetailFormat]
            
         FROM SHIP_BATCH SB
         JOIN SHIPMENT S ON SB.S_ID = S.ID
         LEFT JOIN TRANSPORLEG TL ON S.ID = TL.Shipment_ID
         LEFT JOIN CARRIERCOMPANY CC ON TL.CarrierCompany_TIN = CC.V_TIN
         LEFT JOIN VENDOR CC_Vendor ON CC.V_TIN = CC_Vendor.TIN
         JOIN DISTRIBUTOR D ON S.Distributor_TIN = D.Vendor_TIN
         JOIN VENDOR V ON D.Vendor_TIN = V.TIN
         LEFT JOIN RETAIL R ON V.TIN = R.Vendor_TIN
         WHERE SB.B_ID = @BatchID
         FOR JSON PATH
        ) AS [DistributionLogs]

    FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
END;
GO