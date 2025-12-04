import { useEffect, useState } from 'react'
import axios from 'axios'

interface TraceabilityData {
  overview: {
    qrCode: string
    harvestDate: string
    grade?: string
    seedBatch?: string
    createdBy?: string
    productName: string
    productImage?: string
    variety?: string
    category?: string
    farmName: string
    farmOwner?: string
    farmContact?: string
    farmLocation?: string
  }
  certifications: Array<{ certification: string }>
  processing: Array<{
    facilityName?: string
    facilityAddress?: string
    facilityLicense?: string
    facilityContact?: string
    processingDate?: string
    packagingDate?: string
    packagingType?: string
    weightPerUnit?: number
    processedBy?: string
  }>
  storage: Array<{
    warehouseAddress?: string
    storeCondition?: string
    quantity?: number
    startDate?: string
    endDate?: string
  }>
  shipping: Array<{
    status?: string
    destination?: string
    driverName?: string
    temperature?: string
    route?: string
    carrierCompany?: string
    distributorName?: string
    distributorAddress?: string
    distributorContact?: string
    distributorType?: string
    retailFormat?: string
  }>
  pricing: Array<{
    vendorTin?: string
    vendorName?: string
    vendorAddress?: string
    vendorContact?: string
    vendorType?: string
    price?: number
    currency?: string
  }>
}

export default function ProductInfo() {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code') || ''

  const [data, setData] = useState<TraceabilityData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!code) return

    setLoading(true)
    setError(null)

    const baseUrl = 'http://localhost:5000'
    axios.get(`${baseUrl}/api/traceability/full?qrCode=${encodeURIComponent(code)}`)
      .then(res => setData(res.data))
      .catch(e => setError(e?.response?.data?.message || e?.message || 'Failed to fetch'))
      .finally(() => setLoading(false))
  }, [code])

  if (!code) {
    return (
      <div style={{ maxWidth: 600, margin: '40px auto', padding: 24, textAlign: 'center' }}>
        <h2 style={{ color: '#b91c1c' }}>No QR code provided</h2>
        <p style={{ color: '#6b7280' }}>Please scan a valid QR code</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 600, margin: '40px auto', padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <h2 style={{ color: '#667eea' }}>Loading product information...</h2>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ maxWidth: 600, margin: '40px auto', padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ color: '#b91c1c' }}>Error</h2>
        <p style={{ color: '#6b7280' }}>{error}</p>
      </div>
    )
  }

  if (!data) return null

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 16, background: '#f9fafb', minHeight: '100vh' }}>
      {/* Navigation Header */}
      <div style={{
        background: 'white',
        padding: 16,
        borderRadius: '12px 12px 0 0',
        marginBottom: 1,
        display: 'flex',
        gap: 16,
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
      }}>
        <a
          href="/"
          style={{
            padding: '8px 16px',
            color: '#6b7280',
            textDecoration: 'none',
            fontWeight: 600,
            borderRadius: 8
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#f3f4f6'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          ← Back to Home
        </a>
        <a
          href="/admin"
          style={{
            padding: '8px 16px',
            color: '#6b7280',
            textDecoration: 'none',
            fontWeight: 600,
            borderRadius: 8
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#f3f4f6'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          Admin Panel
        </a>
      </div>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 24,
        color: 'white'
      }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>🌾 Product Traceability</h1>
        <p style={{ margin: '8px 0 0 0', opacity: 0.9 }}>From farm to your table</p>
      </div>

      {/* 1. PRODUCT & BATCH OVERVIEW */}
      <div style={{
        background: 'white',
        padding: 24,
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>🌾 PRODUCT INFORMATION</div>
        <h2 style={{ margin: '0 0 16px 0', fontSize: 24, color: '#111827' }}>{data.overview.productName}</h2>

        {data.overview.productImage && (
          <img
            src={data.overview.productImage}
            alt={data.overview.productName}
            style={{ width: '100%', maxWidth: 300, borderRadius: 8, marginBottom: 16 }}
          />
        )}

        <div style={{ display: 'grid', gap: 12, fontSize: 14 }}>
          {data.overview.variety && (
            <div>
              <span style={{ color: '#6b7280' }}>Variety:</span>
              <div style={{ color: '#111827', fontWeight: 600, marginTop: 4 }}>{data.overview.variety}</div>
            </div>
          )}
          {data.overview.category && (
            <div>
              <span style={{ color: '#6b7280' }}>Category:</span>
              <div style={{ color: '#111827', fontWeight: 600, marginTop: 4 }}>{data.overview.category}</div>
            </div>
          )}
          {data.overview.harvestDate && (
            <div>
              <span style={{ color: '#6b7280' }}>Harvest Date:</span>
              <div style={{ color: '#111827', fontWeight: 600, marginTop: 4 }}>📅 {new Date(data.overview.harvestDate).toLocaleDateString('vi-VN')}</div>
            </div>
          )}
          {data.overview.grade && (
            <div>
              <span style={{ color: '#6b7280' }}>Grade:</span>
              <div style={{
                display: 'inline-block',
                marginTop: 4,
                padding: '4px 12px',
                background: '#dcfce7',
                color: '#166534',
                borderRadius: 999,
                fontWeight: 600,
                fontSize: 12
              }}>
                ⭐ {data.overview.grade}
              </div>
            </div>
          )}
          {data.overview.seedBatch && (
            <div>
              <span style={{ color: '#6b7280' }}>Seed Batch:</span>
              <div style={{ color: '#111827', fontWeight: 600, marginTop: 4 }}>{data.overview.seedBatch}</div>
            </div>
          )}
          {data.overview.createdBy && (
            <div>
              <span style={{ color: '#6b7280' }}>Created By:</span>
              <div style={{ color: '#111827', fontWeight: 600, marginTop: 4 }}>{data.overview.createdBy}</div>
            </div>
          )}
          <div>
            <span style={{ color: '#6b7280' }}>QR Code:</span>
            <div style={{ color: '#111827', fontWeight: 600, marginTop: 4, fontFamily: 'monospace', fontSize: 11, wordBreak: 'break-all' }}>{data.overview.qrCode}</div>
          </div>
        </div>
      </div>

      {/* 2. FARM INFORMATION */}
      <div style={{
        background: 'white',
        padding: 24,
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 12 }}>🏡 FARM INFORMATION</div>
        <div style={{ display: 'grid', gap: 12, fontSize: 14 }}>
          <div>
            <span style={{ color: '#6b7280' }}>Farm Name:</span>
            <div style={{ color: '#111827', fontWeight: 600, marginTop: 4 }}>{data.overview.farmName}</div>
          </div>
          {data.overview.farmOwner && (
            <div>
              <span style={{ color: '#6b7280' }}>Owner:</span>
              <div style={{ color: '#111827', fontWeight: 600, marginTop: 4 }}>{data.overview.farmOwner}</div>
            </div>
          )}
          {data.overview.farmContact && (
            <div>
              <span style={{ color: '#6b7280' }}>Contact:</span>
              <div style={{ color: '#111827', marginTop: 4 }}>{data.overview.farmContact}</div>
            </div>
          )}
          {data.overview.farmLocation && (
            <div>
              <span style={{ color: '#6b7280' }}>Location:</span>
              <div style={{ color: '#111827', fontWeight: 600, marginTop: 4 }}>📍 {data.overview.farmLocation}</div>
            </div>
          )}
        </div>

        {/* Certifications */}
        {data.certifications && data.certifications.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <span style={{ color: '#6b7280', fontSize: 14 }}>Certifications:</span>
            <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {data.certifications.map((cert, i) => (
                <span key={i} style={{
                  padding: '4px 12px',
                  background: '#dbeafe',
                  color: '#1e40af',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 500
                }}>
                  ✓ {cert.certification}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. PROCESSING INFORMATION */}
      {data.processing && data.processing.length > 0 && (
        <div style={{
          background: 'white',
          padding: 24,
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 12 }}>🏭 PROCESSING & PACKAGING</div>
          {data.processing.map((proc, idx) => (
            <div key={idx} style={{
              padding: 16,
              background: '#f9fafb',
              borderRadius: 8,
              marginBottom: idx < data.processing.length - 1 ? 12 : 0
            }}>
              <div style={{ display: 'grid', gap: 12, fontSize: 14 }}>
                {proc.facilityName && (
                  <div>
                    <span style={{ color: '#6b7280' }}>Facility:</span>
                    <div style={{ color: '#111827', fontWeight: 600, marginTop: 4 }}>{proc.facilityName}</div>
                  </div>
                )}
                {proc.facilityAddress && (
                  <div>
                    <span style={{ color: '#6b7280' }}>Address:</span>
                    <div style={{ color: '#111827', marginTop: 4 }}>{proc.facilityAddress}</div>
                  </div>
                )}
                {proc.facilityLicense && (
                  <div>
                    <span style={{ color: '#6b7280' }}>License:</span>
                    <div style={{ color: '#111827', marginTop: 4 }}>{proc.facilityLicense}</div>
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {proc.processingDate && (
                    <div>
                      <span style={{ color: '#6b7280' }}>Processing Date:</span>
                      <div style={{ color: '#111827', fontWeight: 600, marginTop: 4 }}>
                        📅 {new Date(proc.processingDate).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  )}
                  {proc.packagingDate && (
                    <div>
                      <span style={{ color: '#6b7280' }}>Packaging Date:</span>
                      <div style={{ color: '#111827', fontWeight: 600, marginTop: 4 }}>
                        📦 {new Date(proc.packagingDate).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  )}
                </div>
                {proc.packagingType && (
                  <div>
                    <span style={{ color: '#6b7280' }}>Packaging Type:</span>
                    <div style={{ color: '#111827', fontWeight: 600, marginTop: 4 }}>{proc.packagingType}</div>
                  </div>
                )}
                {proc.weightPerUnit && (
                  <div>
                    <span style={{ color: '#6b7280' }}>Weight per Unit:</span>
                    <div style={{ color: '#111827', fontWeight: 600, marginTop: 4 }}>{proc.weightPerUnit} kg</div>
                  </div>
                )}
                {proc.processedBy && (
                  <div>
                    <span style={{ color: '#6b7280' }}>Processed By:</span>
                    <div style={{ color: '#111827', fontWeight: 600, marginTop: 4 }}>👤 {proc.processedBy}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. STORAGE INFORMATION */}
      {data.storage && data.storage.length > 0 && (
        <div style={{
          background: 'white',
          padding: 24,
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 12 }}>📦 STORAGE INFORMATION</div>
          {data.storage.map((store, idx) => (
            <div key={idx} style={{
              padding: 16,
              background: '#f9fafb',
              borderRadius: 8,
              marginBottom: idx < data.storage.length - 1 ? 12 : 0
            }}>
              <div style={{ display: 'grid', gap: 12, fontSize: 14 }}>
                {store.warehouseAddress && (
                  <div>
                    <span style={{ color: '#6b7280' }}>Warehouse:</span>
                    <div style={{ color: '#111827', fontWeight: 600, marginTop: 4 }}>{store.warehouseAddress}</div>
                  </div>
                )}
                {store.storeCondition && (
                  <div>
                    <span style={{ color: '#6b7280' }}>Storage Condition:</span>
                    <div style={{ color: '#111827', fontWeight: 600, marginTop: 4 }}>🌡️ {store.storeCondition}</div>
                  </div>
                )}
                {store.quantity && (
                  <div>
                    <span style={{ color: '#6b7280' }}>Quantity:</span>
                    <div style={{ color: '#111827', fontWeight: 600, marginTop: 4 }}>{store.quantity}</div>
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {store.startDate && (
                    <div>
                      <span style={{ color: '#6b7280' }}>Start Date:</span>
                      <div style={{ color: '#111827', fontWeight: 600, marginTop: 4 }}>
                        {new Date(store.startDate).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  )}
                  {store.endDate && (
                    <div>
                      <span style={{ color: '#6b7280' }}>End Date:</span>
                      <div style={{ color: '#111827', fontWeight: 600, marginTop: 4 }}>
                        {new Date(store.endDate).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. SHIPPING & DISTRIBUTION */}
      {data.shipping && data.shipping.length > 0 && (
        <div style={{
          background: 'white',
          padding: 24,
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 12 }}>🚚 SHIPPING & DISTRIBUTION</div>
          {data.shipping.map((ship, idx) => (
            <div key={idx} style={{
              padding: 16,
              background: '#f9fafb',
              borderRadius: 8,
              marginBottom: idx < data.shipping.length - 1 ? 12 : 0
            }}>
              <div style={{ display: 'grid', gap: 12, fontSize: 14 }}>
                {ship.status && (
                  <div>
                    <span style={{ color: '#6b7280' }}>Status:</span>
                    <div style={{
                      display: 'inline-block',
                      marginTop: 4,
                      padding: '4px 12px',
                      background: ship.status === 'Delivered' ? '#dcfce7' : '#fef3c7',
                      color: ship.status === 'Delivered' ? '#166534' : '#92400e',
                      borderRadius: 999,
                      fontWeight: 600,
                      fontSize: 12
                    }}>
                      {ship.status}
                    </div>
                  </div>
                )}
                {ship.destination && (
                  <div>
                    <span style={{ color: '#6b7280' }}>Destination:</span>
                    <div style={{ color: '#111827', fontWeight: 600, marginTop: 4 }}>📍 {ship.destination}</div>
                  </div>
                )}
                {ship.route && (
                  <div>
                    <span style={{ color: '#6b7280' }}>Route:</span>
                    <div style={{ color: '#111827', fontWeight: 600, marginTop: 4 }}>{ship.route}</div>
                  </div>
                )}
                {ship.carrierCompany && (
                  <div>
                    <span style={{ color: '#6b7280' }}>Carrier Company:</span>
                    <div style={{ color: '#111827', fontWeight: 600, marginTop: 4 }}>{ship.carrierCompany}</div>
                  </div>
                )}
                {ship.driverName && (
                  <div>
                    <span style={{ color: '#6b7280' }}>Driver:</span>
                    <div style={{ color: '#111827', fontWeight: 600, marginTop: 4 }}>👤 {ship.driverName}</div>
                  </div>
                )}
                {ship.temperature && (
                  <div>
                    <span style={{ color: '#6b7280' }}>Temperature Profile:</span>
                    <div style={{ color: '#111827', fontWeight: 600, marginTop: 4 }}>🌡️ {ship.temperature}</div>
                  </div>
                )}
                {ship.distributorName && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #e5e7eb' }}>
                    <div style={{ color: '#6b7280', marginBottom: 8, fontWeight: 600 }}>Distributor:</div>
                    <div style={{ display: 'grid', gap: 8 }}>
                      <div>
                        <span style={{ color: '#6b7280' }}>Name:</span>
                        <div style={{ color: '#111827', fontWeight: 600, marginTop: 4 }}>{ship.distributorName}</div>
                      </div>
                      {ship.distributorType && (
                        <div>
                          <span style={{ color: '#6b7280' }}>Type:</span>
                          <div style={{ color: '#111827', marginTop: 4 }}>{ship.distributorType}</div>
                        </div>
                      )}
                      {ship.distributorAddress && (
                        <div>
                          <span style={{ color: '#6b7280' }}>Address:</span>
                          <div style={{ color: '#111827', marginTop: 4 }}>{ship.distributorAddress}</div>
                        </div>
                      )}
                      {ship.retailFormat && (
                        <div>
                          <span style={{ color: '#6b7280' }}>Retail Format:</span>
                          <div style={{ color: '#111827', marginTop: 4 }}>{ship.retailFormat}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 6. PRICING INFORMATION */}
      {data.pricing && data.pricing.length > 0 && (
        <div style={{
          background: 'white',
          padding: 24,
          borderRadius: '0 0 12px 12px'
        }}>
          <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 12 }}>💰 PRICING INFORMATION</div>
          {data.pricing.map((price, idx) => (
            <div key={idx} style={{
              padding: 16,
              background: '#f9fafb',
              borderRadius: 8,
              marginBottom: idx < data.pricing.length - 1 ? 12 : 0
            }}>
              <div style={{ display: 'grid', gap: 12, fontSize: 14 }}>
                {price.vendorName && (
                  <div>
                    <span style={{ color: '#6b7280' }}>Vendor:</span>
                    <div style={{ color: '#111827', fontWeight: 600, marginTop: 4 }}>{price.vendorName}</div>
                  </div>
                )}
                {price.vendorType && (
                  <div>
                    <span style={{ color: '#6b7280' }}>Type:</span>
                    <div style={{ color: '#111827', marginTop: 4 }}>{price.vendorType}</div>
                  </div>
                )}
                {price.price && (
                  <div>
                    <span style={{ color: '#6b7280' }}>Price:</span>
                    <div style={{
                      marginTop: 4,
                      padding: '8px 16px',
                      background: '#dcfce7',
                      color: '#166534',
                      borderRadius: 8,
                      fontWeight: 700,
                      fontSize: 18,
                      display: 'inline-block'
                    }}>
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: price.currency || 'VND'
                      }).format(price.price)}
                    </div>
                  </div>
                )}
                {price.vendorAddress && (
                  <div>
                    <span style={{ color: '#6b7280' }}>Address:</span>
                    <div style={{ color: '#111827', marginTop: 4 }}>{price.vendorAddress}</div>
                  </div>
                )}
                {price.vendorContact && (
                  <div>
                    <span style={{ color: '#6b7280' }}>Contact:</span>
                    <div style={{ color: '#111827', marginTop: 4 }}>{price.vendorContact}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        padding: 24,
        fontSize: 12,
        color: '#9ca3af'
      }}>
        <div>✓ Verified and traced from source to destination</div>
        <div style={{ marginTop: 8 }}>Powered by Agricultural Product Traceability System</div>
      </div>
    </div>
  )
}
