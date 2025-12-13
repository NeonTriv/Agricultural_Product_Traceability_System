/**
 * API Configuration
 * Centralized API base URL configuration
 */

// Use Vite environment variable or fallback to localhost
export const API_BASE_URL = import.meta.env.VITE_API_TARGET || 'http://localhost:5000'

// Common API endpoints
export const API_ENDPOINTS = {
  // Health
  health: `${API_BASE_URL}/api/health`,
  
  // Products
  products: `${API_BASE_URL}/api/products`,
  batches: `${API_BASE_URL}/api/products/batches`,
  farms: `${API_BASE_URL}/api/products/farms`,
  categories: `${API_BASE_URL}/api/products/categories`,
  types: `${API_BASE_URL}/api/products/types`,
  agricultureProducts: `${API_BASE_URL}/api/products/agriculture-products`,
  provinces: `${API_BASE_URL}/api/products/provinces`,
  countries: `${API_BASE_URL}/api/products/countries`,
  
  // Trace
  trace: `${API_BASE_URL}/api/trace`,
  
  // Vendors
  vendors: `${API_BASE_URL}/api/vendors`,
  
  // Processing
  processingFacilities: `${API_BASE_URL}/api/processing/facilities`,
  processingOperations: `${API_BASE_URL}/api/processing/operations`,
  processSteps: `${API_BASE_URL}/api/processing/process-steps`,
  
  // Logistics
  carriers: `${API_BASE_URL}/api/logistics/carriers`,
  shipments: `${API_BASE_URL}/api/logistics/shipments`,
  transportLegs: `${API_BASE_URL}/api/logistics/transport-legs`,
  distributors: `${API_BASE_URL}/api/logistics/distributors`,
  
  // Storage
  warehouses: `${API_BASE_URL}/api/storage/warehouses`,
  storedIn: `${API_BASE_URL}/api/storage/stored-in`,
  
  // Pricing
  vendorProducts: `${API_BASE_URL}/api/pricing/vendor-products`,
  prices: `${API_BASE_URL}/api/pricing/prices`,
  discounts: `${API_BASE_URL}/api/pricing/discounts`,
} as const
