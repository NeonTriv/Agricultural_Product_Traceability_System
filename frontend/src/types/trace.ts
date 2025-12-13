export type TypeDto = {
  id: string
  name: string
  variety?: string
  characteristics?: string
}

export type Product = {
  id: string
  name: string
  imageUrl?: string
  qrCodeUrl?: string
  batchId?: string
  type?: TypeDto
  category?: string
}

export type Batch = {
  id: string
  harvestDate?: string
  grade?: string
  seedBatch?: string
  createdBy?: string
  farmName: string
}

export type Location = {
  country?: string
  province?: string
  address?: string
  latitude?: number
  longitude?: number
}

export type Farm = {
  id: string
  name: string
  ownerName?: string
  contactInfo?: string
  location?: Location
  certifications?: string[]
}

export type ProcessingFacility = {
  id: string
  name: string
  location?: string
}

export type Processing = {
  id: string
  facility?: ProcessingFacility
  processingDate?: string
  packagingDate?: string
  processedBy?: string
  packagingType?: string
  weightPerUnit?: number
}

export type Vendor = {
  tin: string
  name?: string
  address?: string
  contactInfo?: string
}

export type Distributor = {
  vendor?: Vendor
  unit?: string
}

export type Price = {
  amount?: number
  currency?: string
}

export type Warehouse = {
  id: number
  address: string
  capacity?: number
  storeCondition?: string
  province?: string
  quantity?: number
  startDate?: string
  endDate?: string
}

export type Discount = {
  id: number
  name?: string
  percentage?: number
  minValue?: number
  maxDiscountAmount?: number
  startDate?: string
  expiredDate?: string
  isStackable?: boolean
}

export type TransportLeg = {
  id: number
  startLocation: string
  toLocation: string
  departureTime?: string
  arrivalTime?: string
  driverName?: string
  temperatureProfile?: string
  carrierCompany?: {
    name?: string
    tin: string
    contactInfo?: string
  }
}

export type Shipment = {
  id: number
  status: string
  startLocation?: string
  destination?: string
  transportLegs?: TransportLeg[]
}

export type TraceResponse = {
  code: string
  product: Product
  batch?: Batch
  farm?: Farm
  processing?: Processing
  distributor?: Distributor
  price?: Price
  warehouses?: Warehouse[]
  discounts?: Discount[]
  shipments?: Shipment[]
}
