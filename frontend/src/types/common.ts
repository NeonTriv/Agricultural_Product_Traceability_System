// Common types used across admin components
// Extracted from duplicated type definitions to follow DRY principle

export interface Country {
  id: number
  name: string
}

export interface Province {
  id: number
  name: string
  countryId: number
  countryName?: string
}

export interface Farm {
  id: number
  name: string
  ownerName?: string
  contactInfo?: string
  addressDetail?: string
  longitude?: number
  latitude?: number
  provinceId: number
  provinceName?: string
  countryName?: string
}

export interface AgricultureProduct {
  id: number
  name: string
  imageUrl?: string
  typeId?: number
  typeName?: string
  categoryId?: number
  categoryName?: string
}

export interface Category {
  id: number
  name: string
}

export interface ProductType {
  id: number
  variety: string
  categoryId?: number
  categoryName?: string
}

export interface Batch {
  id: number
  qrCodeUrl: string
  productName: string
  productImageUrl?: string
  farmId: number
  farmName: string
  agricultureProductId: number
  vendorProductId?: number
  province?: string
  country?: string
  harvestDate?: Date | string
  grade?: string
  variety?: string
}

export interface Vendor {
  tin: string
  name: string
  address: string
  contactInfo?: string
  provinceId?: number
  provinceName?: string
  countryName?: string
  type?: 'vendor' | 'distributor' | 'retail'
  distributorType?: string
  retailFormat?: string
}

export interface VendorProduct {
  id: number
  unit: string
  vendorTin: string
  vendorName?: string
  agricultureProductId: number
  productName?: string
}

export interface Price {
  vendorProductId: number
  value: number
  currency: string
  productName?: string
  vendorName?: string
  unit?: string
}

export interface Discount {
  id: number
  name: string
  percentage?: number
  minValue?: number
  maxDiscountAmount?: number
  priority?: number
  isStackable?: boolean
  startDate?: Date | string
  expiredDate?: Date | string
}

export interface ProcessingFacility {
  id: number
  name: string
  address?: string
  provinceId?: number
  provinceName?: string
  countryName?: string
  contactInfo?: string
}

export interface Processing {
  id: number
  batchId: number
  facilityId: number
  processingDate?: Date | string
  packagingDate?: Date | string
  processedBy?: string
  packagingType?: string
  weightPerUnit?: number
  batchQrCode?: string
  productName?: string
  facilityName?: string
}

export interface ProcessStep {
  processingId: number
  step: string
  description?: string
}

export interface Warehouse {
  id: number
  capacity?: number
  storeCondition?: string
  addressDetail?: string
  longitude?: number
  latitude?: number
  provinceId: number
  provinceName?: string
  countryName?: string
}

export interface StoredIn {
  batchId: number
  warehouseId: number
  quantity: number
  startDate?: string
  endDate?: string
  batchQrCode?: string
  productName?: string
  warehouseAddress?: string
}

export interface CarrierCompany {
  vTin: string
  name?: string
  addressDetail?: string
  provinceId?: number
  provinceName?: string
  countryName?: string
  contactInfo?: string
  transportLegCount?: number
}

export interface Shipment {
  id: number
  status: string
  destination?: string
  startLocation?: string
  distributorTin: string
  distributorName?: string
  transportLegCount?: number
}

export interface TransportLeg {
  id: number
  shipmentId: number
  driverName?: string
  temperatureProfile?: string
  startLocation: string
  toLocation: string
  departureTime?: Date | string
  arrivalTime?: Date | string
  carrierCompanyTin: string
  carrierCompanyName?: string
  shipmentDestination?: string
}

export interface Distributor {
  vTin: string
  name: string
}

// Form state helpers
export interface FormErrors {
  [key: string]: boolean
}

export interface ErrorModal {
  show: boolean
  title: string
  message: string
}

export interface DeleteConfirm {
  show: boolean
  id: number | string | null
}

// API Response types
export interface ApiSuccessResponse {
  success: boolean
  id?: number | string
  [key: string]: any
}

export interface ApiErrorResponse {
  message: string
  statusCode?: number
}
