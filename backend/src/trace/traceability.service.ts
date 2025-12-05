import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Batch } from './entities/batch.entity';

@Injectable()
export class TraceabilityService {
  constructor(
    @InjectRepository(Batch)
    private readonly batchRepo: Repository<Batch>,
  ) {}

  async getFullTraceability(qrCodeUrl: string) {
    // Find batch by QR code
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

    // 1. THÔNG TIN TỔNG QUAN
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

    // 2. CHỨNG CHỈ NÔNG TRẠI
    const certifications = batch.farm?.certifications?.map((cert) => ({
      certification: cert.farmCertifications,
    })) || [];

    // 3. QUÁ TRÌNH CHẾ BIẾN & ĐÓNG GÓI
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

    // 4. THÔNG TIN LƯU KHO
    const storage = batch.storedIn?.map((stored) => ({
      warehouseId: stored.warehouseId,
      storeCondition: stored.warehouse?.storeCondition,
      quantity: stored.quantity,
      // warehouseAddress: stored.warehouse?.addressDetail, // Column does not exist in DB
      // startDate: stored.startDate, // Column does not exist in DB
      // endDate: stored.endDate, // Column does not exist in DB
    })) || [];

    // 5. VẬN CHUYỂN & PHÂN PHỐI
    const shipping = batch.shipBatches?.map((shipBatch) => {
      const shipment = shipBatch.shipment;
      const transportLeg = shipment?.transportLegs?.[0]; // Lấy leg đầu tiên
      const distributor = shipment?.distributor;
      const vendor = distributor?.vendor;
      const retail = vendor?.retails?.[0]; // Lấy retail đầu tiên

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

    // 6. GIÁ BÁN - Cần query riêng vì không có direct relationship từ Batch
    const pricing = [];

    return {
      overview,
      certifications,
      processing,
      storage,
      shipping,
      pricing,
    };
  }
}
