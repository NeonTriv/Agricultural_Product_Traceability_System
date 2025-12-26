import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Batch } from './entities/batch.entity';

@Injectable()
export class TraceabilityService {
  constructor(
    @InjectRepository(Batch)
    private readonly batchRepo: Repository<Batch>,
    private readonly dataSource: DataSource,
  ) {}

  async getFullTraceability(qrCodeUrl: string) {
    // reduces N+1 queries
    try {
      const result = await this.dataSource.query(
        'EXEC sp_GetTraceabilityFull_JSON @QrCodeURL = @0',
        [qrCodeUrl]
      );

      if (result?.[0]?.Status === 404) {
        throw new NotFoundException(result[0].Message);
      }

      const data = result?.[0];
      if (!data) {
        throw new NotFoundException(`Batch with QR code "${qrCodeUrl}" not found`);
      }

      // Parse nested JSON fields
      const overview = data.Overview ? JSON.parse(data.Overview) : null;
      const certifications = data.Certifications ? JSON.parse(data.Certifications) : [];
      const processingLogs = data.ProcessingLogs ? JSON.parse(data.ProcessingLogs) : [];
      const storageLogs = data.StorageLogs ? JSON.parse(data.StorageLogs) : [];
      const distributionLogs = data.DistributionLogs ? JSON.parse(data.DistributionLogs) : [];

      return {
        overview: overview ? {
          qrCode: overview.QrCodeUrl,
          harvestDate: overview.HarvestDate,
          grade: overview.Grade,
          seedBatch: overview.SeedBatch,
          createdBy: overview.CreatedBy,
          productName: overview.ProductName,
          productImage: overview.ImageUrl,
          variety: overview.Variety,
          category: overview.Category,
          farmName: overview.FarmName,
          farmOwner: overview.FarmOwner,
          farmContact: overview.FarmContact,
          farmLocation: overview.Region,
        } : null,

        certifications: certifications.map((cert: any) => ({
          certification: cert.CertificationName,
        })),

        processing: processingLogs.map((proc: any) => ({
          facilityName: proc.FacilityName,
          facilityAddress: proc.FacilityAddress,
          facilityLicense: proc.LicenseNumber,
          processingDate: proc.ProcessingDate,
          packagingDate: proc.PackagingDate,
          packagingType: proc.PackagingType,
          weightPerUnit: proc.WeightPerUnit,
          processedBy: proc.ProcessedBy,
        })),

        storage: storageLogs.map((storage: any) => ({
          warehouseAddress: storage.WarehouseAddress,
          storeCondition: storage.StorageCondition,
          quantity: storage.QuantityStored,
          checkInDate: storage.CheckInDate,
          checkOutDate: storage.CheckOutDate,
        })),

        shipping: distributionLogs.map((dist: any) => ({
          status: dist.ShipmentStatus,
          destination: dist.Destination,
          driverName: dist.DriverName,
          temperature: dist.TemperatureProfile,
          route: dist.Route,
          carrierCompany: dist.CarrierCompany,
          distributorName: dist.DistributorName,
          distributorContact: dist.DistributorContact,
          distributorType: dist.DistributorType,
          retailFormat: dist.RetailFormat,
        })),

        pricing: [], // TODO: Add pricing query if needed
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      // Fallback to old method if SP fails
      console.error('Stored procedure failed, using fallback method:', error);
      return this.getFullTraceabilityFallback(qrCodeUrl);
    }
  }

  // 🔄 FALLBACK: Keep old TypeORM method as backup
  private async getFullTraceabilityFallback(qrCodeUrl: string) {
    const batch = await this.batchRepo.findOne({
      where: { qrCodeUrl },
      relations: [
        'agricultureProduct',
        'agricultureProduct.type',
        'agricultureProduct.type.category',
        'farm',
        'farm.province',
        'farm.province.country',
        'farm.certifications',
        'processings',
        'processings.facility',
        'storedIn',
        'storedIn.warehouse',
        'storedIn.warehouse.province',
        'shipBatches',
        'shipBatches.shipment',
        'shipBatches.shipment.transportLegs',
        'shipBatches.shipment.transportLegs.carrierCompany',
        'shipBatches.shipment.transportLegs.carrierCompany.vendor',
        'shipBatches.shipment.distributor',
        'shipBatches.shipment.distributor.vendor',
        'shipBatches.shipment.distributor.vendor.retails',
      ],
    });

    if (!batch) {
      throw new NotFoundException(`Batch with QR code "${qrCodeUrl}" not found`);
    }

    const overview = {
      qrCode: batch.qrCodeUrl,
      harvestDate: batch.harvestDate,
      grade: batch.grade,
      seedBatch: batch.seedBatch,
      createdBy: batch.createdBy,
      productName: batch.agricultureProduct?.name,
      productImage: batch.agricultureProduct?.imageUrl,
      variety: batch.agricultureProduct?.type?.variety,
      category: batch.agricultureProduct?.type?.category?.name,
      farmName: batch.farm?.name,
      farmOwner: batch.farm?.ownerName,
      farmContact: batch.farm?.contactInfo,
      farmLocation: batch.farm?.province
        ? `${batch.farm.province.name}, ${batch.farm.province.country?.name}`
        : null,
    };

    const certifications = batch.farm?.certifications?.map((cert) => ({
      certification: cert.farmCertifications,
    })) || [];

    const processing = batch.processings?.map((proc) => ({
      facilityName: proc.facility?.name,
      facilityAddress: proc.facility?.address,
      facilityLicense: proc.facility?.licenseNumber,
      facilityContact: proc.facility?.contactInfo,
      processingDate: proc.processingDate,
      packagingDate: proc.packagingDate,
      packagingType: proc.packagingType,
      weightPerUnit: proc.weightPerUnit,
      processedBy: proc.processedBy,
    })) || [];

    const storage = batch.storedIn?.map((stored) => ({
      warehouseId: stored.warehouseId,
      storeCondition: stored.warehouse?.storeCondition,
      quantity: stored.quantity,
    })) || [];

    const shipping = batch.shipBatches?.map((shipBatch) => {
      const shipment = shipBatch.shipment;
      const transportLeg = shipment?.transportLegs?.[0];
      const distributor = shipment?.distributor;
      const vendor = distributor?.vendor;
      const retail = vendor?.retails?.[0];

      return {
        status: shipment?.status,
        destination: shipment?.destination,
        driverName: transportLeg?.driverName,
        temperature: transportLeg?.temperatureProfile,
        route: transportLeg
          ? `${transportLeg.startLocation} -> ${transportLeg.toLocation}`
          : null,
        carrierCompany: transportLeg?.carrierCompany?.vendor?.name,
        distributorName: vendor?.name,
        distributorAddress: vendor?.address,
        distributorContact: vendor?.contactInfo,
        distributorType: distributor?.type,
        retailFormat: retail?.format,
      };
    }) || [];

    return {
      overview,
      certifications,
      processing,
      storage,
      shipping,
      pricing: [],
    };
  }
}
