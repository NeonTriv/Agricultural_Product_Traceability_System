/**
 * DTOs for Trace API Response - OPTIMIZED for Single Query
 * Lấy tất cả thông tin từ 1 câu SQL duy nhất
 *
 * Relationships traced từ Batch (QR Code):
 * Batch → Farm → Province → Country
 * Batch → AgricultureProduct → Type
 * Batch → AgricultureProduct → VendorProduct → Vendor
 * Batch → AgricultureProduct → VendorProduct → Price
 * Batch → Processing → ProcessingFacility
 * Farm → FarmCertification
 */

export class TypeDto {
  id: string;
  name: string;
  variety?: string;
  characteristics?: string;
}

export class ProductDto {
  id: string;
  name: string;
  imageUrl?: string;
  qrCodeUrl?: string;
  batchId?: string;
  type?: TypeDto;
  category?: string;
}

export class BatchDto {
  id: string;
  harvestDate?: string;
  grade?: string;
  seedBatch?: string;
  createdBy?: string;
  farmName: string;
}

export class LocationDto {
  country?: string;
  province?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

export class FarmDto {
  id: string;
  name: string;
  ownerName?: string;
  contactInfo?: string;
  location?: LocationDto;
  certifications?: string[];
}

export class ProcessingFacilityDto {
  id: string;
  name: string;
  location?: string;
}

export class ProcessingDto {
  id: string;
  facility?: ProcessingFacilityDto;
  processingDate?: string;
  packagingDate?: string;
  processedBy?: string;
  packagingType?: string;
  weightPerUnit?: number;
}

export class VendorDto {
  tin: string;
  name?: string;
  address?: string;
  contactInfo?: string;
}

export class DistributorDto {
  vendor?: VendorDto;
  unit?: string;
  valuePerUnit?: number;
}

export class PriceDto {
  amount?: number;
  currency?: string;
}

export class WarehouseDto {
  id: number;
  address: string;
  capacity?: number;
  storeCondition?: string;
  province?: string;
  quantity?: number;
  startDate?: string;
  endDate?: string;
}

export class DiscountDto {
  id: number;
  name?: string;
  percentage?: number;
  minValue?: number;
  maxDiscountAmount?: number;
  startDate?: string;
  expiredDate?: string;
  isStackable?: boolean;
}

export class TransportLegDto {
  id: number;
  startLocation: string;
  toLocation: string;
  departureTime?: string;
  arrivalTime?: string;
  driverName?: string;
  temperatureProfile?: string;
  carrierCompany?: {
    name?: string;
    tin: string;
    contactInfo?: string;
  };
}

export class ShipmentDto {
  id: number;
  status: string;
  startLocation?: string;
  destination?: string;
  transportLegs?: TransportLegDto[];
}

export class TraceResponseDto {
  code: string; // QR Code URL
  product: ProductDto;
  batch?: BatchDto;
  farm?: FarmDto;
  processing?: ProcessingDto;
  distributor?: DistributorDto;
  price?: PriceDto;
  warehouses?: WarehouseDto[];
  discounts?: DiscountDto[];
  shipments?: ShipmentDto[];
}
