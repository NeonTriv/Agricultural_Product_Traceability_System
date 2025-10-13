export type Product = { id: string; name: string; imageUrl?: string }
export type Batch = { id: string; farmName: string; harvestDate: string }
export type Farm = { name: string; address?: string; certifications?: string[] }
export type Processing = { facility?: string; packedAt?: string }
export type Distributor = { name?: string; location?: string }
export type Price = { amount?: number; currency?: string }

export type TraceResponse = {
  code: string
  product: Product
  batch?: Batch
  farm?: Farm
  processing?: Processing
  distributor?: Distributor
  price?: Price
  [k: string]: unknown
}
