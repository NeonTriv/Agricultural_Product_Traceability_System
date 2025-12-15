import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Batch } from './entities/batch.entity';
import {
  TraceResponseDto,
  ProductDto,
  BatchDto,
  FarmDto,
  ProcessingDto,
  DistributorDto,
  PriceDto,
  TypeDto,
  LocationDto,
  VendorDto,
  ProcessingFacilityDto,
  WarehouseDto,
  DiscountDto,
  ShipmentDto,
  TransportLegDto,
} from './dto/trace-response.dto';

/**
 * TraceService - Core Traceability Lookup
 * 
 * Single Responsibility: QR code lookup and traceability response mapping.
 * All CRUD operations moved to ProductService.
 */
@Injectable()
export class TraceService {
  constructor(
    @InjectRepository(Batch)
    private readonly batchRepo: Repository<Batch>,
  ) {}

  /**
   * Fetch full traceability by QR code (single optimized query)
   */
  async getTraceByCode(qrCodeUrl: string): Promise<TraceResponseDto> {
    const batch = await this.batchRepo
      .createQueryBuilder('batch')
      .leftJoinAndSelect('batch.farm', 'farm')
      .leftJoinAndSelect('farm.province', 'province')
      .leftJoinAndSelect('province.country', 'country')
      .leftJoinAndSelect('farm.certifications', 'cert')
      .leftJoinAndSelect('batch.agricultureProduct', 'product')
      .leftJoinAndSelect('product.type', 'type')
      .leftJoinAndSelect('batch.vendorProduct', 'vendorProduct')
      .leftJoinAndSelect('vendorProduct.vendor', 'vendor')
      .leftJoinAndSelect('vendorProduct.prices', 'price')
      .leftJoinAndSelect('vendorProduct.productHasDiscounts', 'productDiscount')
      .leftJoinAndSelect('productDiscount.discount', 'discount')
      .leftJoinAndSelect('batch.processings', 'processing')
      .leftJoinAndSelect('processing.facility', 'facility')
      .leftJoinAndSelect('batch.storedIn', 'storedIn')
      .leftJoinAndSelect('storedIn.warehouse', 'warehouse')
      .leftJoinAndSelect('warehouse.province', 'warehouseProvince')
      .leftJoinAndSelect('batch.shipBatches', 'shipBatch')
      .leftJoinAndSelect('shipBatch.shipment', 'shipment')
      .leftJoinAndSelect('shipment.transportLegs', 'transportLeg')
      .leftJoinAndSelect('transportLeg.carrierCompany', 'carrierCompany')
      .leftJoinAndSelect('carrierCompany.vendor', 'carrierVendor')
      .where('batch.qrCodeUrl = :qrCodeUrl', { qrCodeUrl })
      .getOne();

    if (!batch) {
      throw new NotFoundException(`Product with QR code "${qrCodeUrl}" not found`);
    }

    return this.mapToResponse(batch);
  }

  /**
   * Get all batches for testing/listing
   */
  async getAllProducts(): Promise<any[]> {
    const batches = await this.batchRepo
      .createQueryBuilder('batch')
      .select([
        'batch.id', 'batch.qrCodeUrl', 'batch.harvestDate', 'batch.grade',
        'batch.seedBatch', 'batch.farmId', 'batch.agricultureProductId', 'batch.vendorProductId',
        'product.id', 'product.name', 'product.imageUrl',
        'farm.id', 'farm.name',
        'province.id', 'province.name',
        'country.id', 'country.name',
      ])
      .leftJoin('batch.agricultureProduct', 'product')
      .leftJoin('batch.farm', 'farm')
      .leftJoin('farm.province', 'province')
      .leftJoin('province.country', 'country')
      .orderBy('batch.id', 'DESC')
      .take(100)
      .getMany();

    return batches.map((b) => ({
      batchId: b.id,
      qrCodeUrl: b.qrCodeUrl,
      productName: b.agricultureProduct?.name || 'Unknown',
      productImageUrl: b.agricultureProduct?.imageUrl,
      farmId: b.farmId,
      farmName: b.farm?.name || 'Unknown Farm',
      agricultureProductId: b.agricultureProductId,
      vendorProductId: b.vendorProductId,
      province: b.farm?.province?.name,
      country: b.farm?.province?.country?.name,
      harvestDate: b.harvestDate,
      grade: b.grade,
      variety: b.seedBatch,
    }));
  }

  // === Private Mapping Helpers ===

  private mapToResponse(batch: Batch): TraceResponseDto {
    return {
      code: batch.qrCodeUrl,
      product: this.mapProduct(batch),
      batch: this.mapBatch(batch),
      farm: this.mapFarm(batch),
      processing: this.mapProcessing(batch),
      distributor: this.mapDistributor(batch),
      price: this.mapPrice(batch),
      warehouses: this.mapWarehouses(batch),
      discounts: this.mapDiscounts(batch),
      shipments: this.mapShipments(batch),
    };
  }

  private mapProduct(batch: Batch): ProductDto {
    const type: TypeDto | undefined = batch.agricultureProduct?.type ? {
      id: String(batch.agricultureProduct.type.id || ''),
      name: batch.agricultureProduct.type.variety || '',
      variety: batch.agricultureProduct.type.variety,
    } : undefined;

    return {
      id: String(batch.agricultureProduct?.id || 'unknown'),
      name: batch.agricultureProduct?.name || 'Unknown Product',
      imageUrl: batch.agricultureProduct?.imageUrl,
      qrCodeUrl: batch.qrCodeUrl,
      batchId: String(batch.id),
      type,
    };
  }

  private mapBatch(batch: Batch): BatchDto {
    return {
      id: String(batch.id),
      harvestDate: this.formatDate(batch.harvestDate),
      grade: batch.grade,
      seedBatch: (batch as any).seedBatch,
      createdBy: (batch as any).createdBy,
      farmName: batch.farm?.name || 'Unknown Farm',
    };
  }

  private mapFarm(batch: Batch): FarmDto | undefined {
    if (!batch.farm) return undefined;

    const location: LocationDto = {
      country: batch.farm.province?.country?.name,
      province: batch.farm.province?.name,
      address: batch.farm.addressDetail,
      latitude: batch.farm.latitude ? Number(batch.farm.latitude) : undefined,
      longitude: batch.farm.longitude ? Number(batch.farm.longitude) : undefined,
    };

    return {
      id: String(batch.farm.id || ''),
      name: batch.farm.name,
      ownerName: batch.farm.ownerName,
      contactInfo: batch.farm.contactInfo,
      location,
      certifications: batch.farm.certifications?.map(c => c.farmCertifications) || [],
    };
  }

  private mapProcessing(batch: Batch): ProcessingDto | undefined {
    const proc = (batch as any).processings?.[0];
    if (!proc) return undefined;

    const facility: ProcessingFacilityDto | undefined = proc.facility ? {
      id: String(proc.facility.id || ''),
      name: proc.facility.name,
      location: proc.facility.address,
    } : undefined;

    return {
      id: String(proc.id || ''),
      facility,
      processingDate: this.formatDate(proc.processingDate),
      packagingDate: this.formatDate(proc.packagingDate),
      processedBy: proc.processedBy,
      packagingType: proc.packagingType,
      weightPerUnit: proc.weightPerUnit ? Number(proc.weightPerUnit) : undefined,
    };
  }

  private mapDistributor(batch: Batch): DistributorDto | undefined {
    const vp = (batch as any).vendorProduct;
    if (!vp?.vendor) return undefined;

    const vendor: VendorDto = {
      tin: vp.vendor.tin || '',
      name: vp.vendor.name,
      address: vp.vendor.address,
      contactInfo: vp.vendor.contactInfo,
    };

    return { vendor, unit: vp.unit, valuePerUnit: vp.valuePerUnit ? Number(vp.valuePerUnit) : undefined };
  }

  private mapPrice(batch: Batch): PriceDto | undefined {
    const price = (batch as any).vendorProduct?.prices?.[0];
    if (!price) return undefined;

    return {
      amount: price.value ? Number(price.value) : undefined,
      currency: price.currency,
    };
  }

  private mapWarehouses(batch: Batch): WarehouseDto[] | undefined {
    const storedIn = (batch as any).storedIn;
    if (!storedIn?.length) return undefined;

    const warehouses = storedIn
      .filter((s: any) => s.warehouse)
      .map((s: any) => ({
        id: s.warehouse.id,
        address: s.warehouse.addressDetail || '',
        capacity: s.warehouse.capacity ? Number(s.warehouse.capacity) : undefined,
        storeCondition: s.warehouse.storeCondition,
        province: s.warehouse.province?.name,
        quantity: s.quantity ? Number(s.quantity) : undefined,
        startDate: this.formatDate(s.startDate),
        endDate: this.formatDate(s.endDate),
      }));

    return warehouses.length ? warehouses : undefined;
  }

  private mapDiscounts(batch: Batch): DiscountDto[] | undefined {
    const vp = (batch as any).vendorProduct;
    if (!vp) return undefined;
    
    const discounts: DiscountDto[] = [];
    const phds = (vp as any).productHasDiscounts || [];
    for (const phd of phds) {
      if (phd.discount) {
        discounts.push({
          id: phd.discount.id,
          name: phd.discount.name,
          percentage: phd.discount.percentage ? Number(phd.discount.percentage) : undefined,
          minValue: phd.discount.minValue ? Number(phd.discount.minValue) : undefined,
          maxDiscountAmount: phd.discount.maxDiscountAmount ? Number(phd.discount.maxDiscountAmount) : undefined,
          startDate: this.formatDate(phd.discount.startDate),
          expiredDate: this.formatDate(phd.discount.expiredDate),
          isStackable: phd.discount.isStackable,
        });
      }
    }

    return discounts.length ? discounts : undefined;
  }

  private mapShipments(batch: Batch): ShipmentDto[] | undefined {
    const shipBatches = (batch as any).shipBatches;
    if (!shipBatches?.length) return undefined;

    const shipments = shipBatches
      .filter((sb: any) => sb.shipment)
      .map((sb: any) => {
        const legs = sb.shipment.transportLegs?.map((leg: any): TransportLegDto => ({
          id: leg.id,
          startLocation: leg.startLocation,
          toLocation: leg.toLocation,
          departureTime: leg.departureTime ? new Date(leg.departureTime).toISOString() : undefined,
          arrivalTime: leg.arrivalTime ? new Date(leg.arrivalTime).toISOString() : undefined,
          driverName: leg.driverName,
          temperatureProfile: leg.temperatureProfile,
          carrierCompany: leg.carrierCompany?.vendor ? {
            name: leg.carrierCompany.vendor.name,
            tin: leg.carrierCompany.vTin,
            contactInfo: leg.carrierCompany.vendor.contactInfo,
          } : undefined,
        })) || [];

        return {
          id: sb.shipment.id,
          status: sb.shipment.status,
          startLocation: sb.shipment.startLocation,
          destination: sb.shipment.destination,
          transportLegs: legs.length ? legs : undefined,
        };
      });

    return shipments.length ? shipments : undefined;
  }

  private formatDate(date?: Date | string): string | undefined {
    if (!date) return undefined;
    return new Date(date).toISOString().split('T')[0];
  }
}
