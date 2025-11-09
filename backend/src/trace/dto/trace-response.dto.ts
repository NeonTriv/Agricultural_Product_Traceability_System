/**
 * DTOs for Trace API Response
 * These match the frontend types in frontend/src/types/trace.ts
 */

export class ProductDto {
  id: string;
  name: string;
  imageUrl?: string;
  qrCodeUrl?: string;
  batchId?: string;
  typeId?: string;
}

export class BatchDto {
  id: string;
  farmName: string;
  harvestDate?: string;
  grade?: string;
}

export class FarmDto {
  name: string;
  address?: string;
  certifications?: string[];
  country?: string;
  province?: string;
}

export class ProcessingDto {
  facility?: string;
  packedAt?: string;
  processedBy?: string;
  packagingType?: string;
}

export class DistributorDto {
  name?: string;
  location?: string;
}

export class PriceDto {
  amount?: number;
  currency?: string;
}

export class TraceResponseDto {
  code: string;
  product: ProductDto;
  batch?: BatchDto;
  farm?: FarmDto;
  processing?: ProcessingDto;
  distributor?: DistributorDto;
  price?: PriceDto;
}
