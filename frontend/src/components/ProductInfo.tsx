import { useEffect, useState } from 'react'
import { fetchTraceByCode } from '../api/trace'
import type { TraceResponse } from '../types/trace'

export default function ProductInfo() {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code') || ''

  const [data, setData] = useState<TraceResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!code) return

    setLoading(true)
    setError(null)

    // Use empty baseUrl to leverage Vite proxy
    const baseUrl = ''
    fetchTraceByCode(baseUrl, code)
      .then(res => setData(res))
      .catch(e => setError(e?.message || 'Failed to fetch'))
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
    <div style={{ 
      background: 'linear-gradient(to bottom, #f0f9ff 0%, #f9fafb 100%)', 
      minHeight: '100vh',
      paddingBottom: 40
    }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        {/* Navigation Header */}
        <div style={{
          background: 'white',
          padding: '16px 24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          display: 'flex',
          gap: 16,
          borderBottom: '2px solid #e5e7eb'
        }}>
          <a
            href="/"
            style={{
              padding: '8px 16px',
              color: '#6b7280',
              textDecoration: 'none',
              fontWeight: 600,
              borderRadius: 8,
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#f3f4f6'
              e.currentTarget.style.color = '#667eea'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = '#6b7280'
            }}
          >
            ← Back to Home
          </a>
        </div>

        {/* Hero Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '48px 32px',
          color: 'white',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            pointerEvents: 'none'
          }} />
          <h1 style={{ 
            margin: 0, 
            fontSize: 36, 
            fontWeight: 800,
            letterSpacing: '-0.5px',
            position: 'relative'
          }}>
            🌾 Product Traceability
          </h1>
          <p style={{ 
            margin: '12px 0 0 0', 
            fontSize: 18,
            opacity: 0.95,
            fontWeight: 500,
            position: 'relative'
          }}>
            From farm to your table
          </p>
        </div>

        {/* Main Content Grid */}
        <div style={{
          padding: '32px 24px',
          display: 'grid',
          gap: 24
        }}>
          {/* Product Overview Card */}
          <div style={{
            background: 'white',
            borderRadius: 16,
            padding: 32,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ 
              fontSize: 12, 
              color: '#667eea', 
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              marginBottom: 16
            }}>
              🌾 Product Information
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: data.product.imageUrl ? '300px 1fr' : '1fr', gap: 32, alignItems: 'start' }}>
              {data.product.imageUrl && (
                <img
                  src={data.product.imageUrl}
                  alt={data.product.name}
                  style={{ 
                    width: '100%', 
                    borderRadius: 12,
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                    border: '3px solid #f3f4f6'
                  }}
                />
              )}
              
              <div>
                <h2 style={{ 
                  margin: '0 0 24px 0', 
                  fontSize: 32, 
                  color: '#111827',
                  fontWeight: 700,
                  lineHeight: 1.2
                }}>
                  {data.product.name}
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  {data.product.type?.variety && (
                    <div style={{
                      padding: 16,
                      background: '#f9fafb',
                      borderRadius: 12,
                      border: '1px solid #e5e7eb'
                    }}>
                      <span style={{ color: '#6b7280', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Variety</span>
                      <div style={{ color: '#111827', fontWeight: 700, marginTop: 8, fontSize: 16 }}>{data.product.type.variety}</div>
                    </div>
                  )}
                  
                  {data.batch?.harvestDate && (
                    <div style={{
                      padding: 16,
                      background: '#f9fafb',
                      borderRadius: 12,
                      border: '1px solid #e5e7eb'
                    }}>
                      <span style={{ color: '#6b7280', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Harvest Date</span>
                      <div style={{ color: '#111827', fontWeight: 700, marginTop: 8, fontSize: 16 }}>
                        📅 {new Date(data.batch.harvestDate).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  )}
                  
                  {data.batch?.grade && (
                    <div style={{
                      padding: 16,
                      background: '#f9fafb',
                      borderRadius: 12,
                      border: '1px solid #e5e7eb'
                    }}>
                      <span style={{ color: '#6b7280', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Grade</span>
                      <div style={{ marginTop: 8 }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '6px 16px',
                          background: 'linear-gradient(135deg, #dcfce7 0%, #86efac 100%)',
                          color: '#166534',
                          borderRadius: 999,
                          fontWeight: 700,
                          fontSize: 14,
                          letterSpacing: '0.5px'
                        }}>
                          ⭐ {data.batch.grade}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {data.batch?.seedBatch && (
                    <div style={{
                      padding: 16,
                      background: '#f9fafb',
                      borderRadius: 12,
                      border: '1px solid #e5e7eb'
                    }}>
                      <span style={{ color: '#6b7280', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Seed Batch</span>
                      <div style={{ color: '#111827', fontWeight: 700, marginTop: 8, fontSize: 16 }}>{data.batch.seedBatch}</div>
                    </div>
                  )}
                  
                  {data.batch?.createdBy && (
                    <div style={{
                      padding: 16,
                      background: '#f9fafb',
                      borderRadius: 12,
                      border: '1px solid #e5e7eb',
                      gridColumn: data.batch?.seedBatch ? 'auto' : '1 / -1'
                    }}>
                      <span style={{ color: '#6b7280', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Created By</span>
                      <div style={{ color: '#111827', fontWeight: 700, marginTop: 8, fontSize: 16 }}>👤 {data.batch.createdBy}</div>
                    </div>
                  )}
                </div>

                <div style={{
                  marginTop: 20,
                  padding: 16,
                  background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                  borderRadius: 12,
                  border: '2px dashed #667eea'
                }}>
                  <span style={{ color: '#667eea', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>QR Code ID</span>
                  <div style={{ 
                    color: '#1e40af', 
                    fontWeight: 700, 
                    marginTop: 6, 
                    fontFamily: 'monospace',
                    fontSize: 14,
                    wordBreak: 'break-all'
                  }}>
                    {data.code}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Farm Information Card */}
          <div style={{
            background: 'white',
            borderRadius: 16,
            padding: 32,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ 
              fontSize: 12, 
              color: '#10b981', 
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              marginBottom: 16
            }}>
              🏡 Farm Information
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div style={{
                padding: 20,
                background: '#f9fafb',
                borderRadius: 12,
                border: '1px solid #e5e7eb',
                gridColumn: '1 / -1'
              }}>
                <span style={{ color: '#6b7280', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Farm Name</span>
                <div style={{ color: '#111827', fontWeight: 700, marginTop: 8, fontSize: 18 }}>
                  {data.farm?.name || data.batch?.farmName || 'Unknown'}
                </div>
              </div>

              {data.farm?.ownerName && (
                <div style={{
                  padding: 16,
                  background: '#f9fafb',
                  borderRadius: 12,
                  border: '1px solid #e5e7eb'
                }}>
                  <span style={{ color: '#6b7280', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Owner</span>
                  <div style={{ color: '#111827', fontWeight: 700, marginTop: 8, fontSize: 16 }}>👤 {data.farm.ownerName}</div>
                </div>
              )}

              {data.farm?.contactInfo && (
                <div style={{
                  padding: 16,
                  background: '#f9fafb',
                  borderRadius: 12,
                  border: '1px solid #e5e7eb'
                }}>
                  <span style={{ color: '#6b7280', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contact</span>
                  <div style={{ color: '#111827', fontWeight: 700, marginTop: 8, fontSize: 16 }}>📞 {data.farm.contactInfo}</div>
                </div>
              )}

              {data.farm?.location && (
                <div style={{
                  padding: 16,
                  background: '#f9fafb',
                  borderRadius: 12,
                  border: '1px solid #e5e7eb',
                  gridColumn: '1 / -1'
                }}>
                  <span style={{ color: '#6b7280', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Location</span>
                  <div style={{ color: '#111827', fontWeight: 700, marginTop: 8, fontSize: 16 }}>
                    📍 {[data.farm.location.address, data.farm.location.province, data.farm.location.country].filter(Boolean).join(', ')}
                  </div>
                </div>
              )}
            </div>

            {data.farm?.certifications && data.farm.certifications.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <span style={{ color: '#6b7280', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 12 }}>
                  Certifications
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {data.farm.certifications.map((cert, i) => (
                    <span key={i} style={{
                      padding: '8px 16px',
                      background: 'linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%)',
                      color: '#1e40af',
                      borderRadius: 999,
                      fontSize: 13,
                      fontWeight: 600,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}>
                      ✓ {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Processing Information Card */}
          {data.processing && (
            <div style={{
              background: 'white',
              borderRadius: 16,
              padding: 32,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ 
                fontSize: 12, 
                color: '#f59e0b', 
                fontWeight: 700,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                marginBottom: 16
              }}>
                🏭 Processing & Packaging
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {data.processing.facility && (
                  <>
                    <div style={{
                      padding: 16,
                      background: '#f9fafb',
                      borderRadius: 12,
                      border: '1px solid #e5e7eb',
                      gridColumn: '1 / -1'
                    }}>
                      <span style={{ color: '#6b7280', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Facility</span>
                      <div style={{ color: '#111827', fontWeight: 700, marginTop: 8, fontSize: 18 }}>{data.processing.facility.name}</div>
                      {data.processing.facility.location && (
                        <div style={{ color: '#6b7280', marginTop: 6, fontSize: 14 }}>{data.processing.facility.location}</div>
                      )}
                    </div>
                  </>
                )}

                {data.processing.processingDate && (
                  <div style={{
                    padding: 16,
                    background: '#f9fafb',
                    borderRadius: 12,
                    border: '1px solid #e5e7eb'
                  }}>
                    <span style={{ color: '#6b7280', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Processing Date</span>
                    <div style={{ color: '#111827', fontWeight: 700, marginTop: 8, fontSize: 16 }}>
                      📅 {new Date(data.processing.processingDate).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                )}

                {data.processing.packagingDate && (
                  <div style={{
                    padding: 16,
                    background: '#f9fafb',
                    borderRadius: 12,
                    border: '1px solid #e5e7eb'
                  }}>
                    <span style={{ color: '#6b7280', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Packaging Date</span>
                    <div style={{ color: '#111827', fontWeight: 700, marginTop: 8, fontSize: 16 }}>
                      📦 {new Date(data.processing.packagingDate).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                )}

                {data.processing.packagingType && (
                  <div style={{
                    padding: 16,
                    background: '#f9fafb',
                    borderRadius: 12,
                    border: '1px solid #e5e7eb'
                  }}>
                    <span style={{ color: '#6b7280', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Packaging Type</span>
                    <div style={{ color: '#111827', fontWeight: 700, marginTop: 8, fontSize: 16 }}>{data.processing.packagingType}</div>
                  </div>
                )}

                {data.processing.weightPerUnit && (
                  <div style={{
                    padding: 16,
                    background: '#f9fafb',
                    borderRadius: 12,
                    border: '1px solid #e5e7eb'
                  }}>
                    <span style={{ color: '#6b7280', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Weight per Unit</span>
                    <div style={{ color: '#111827', fontWeight: 700, marginTop: 8, fontSize: 16 }}>⚖️ {data.processing.weightPerUnit} kg</div>
                  </div>
                )}

                {data.processing.processedBy && (
                  <div style={{
                    padding: 16,
                    background: '#f9fafb',
                    borderRadius: 12,
                    border: '1px solid #e5e7eb',
                    gridColumn: '1 / -1'
                  }}>
                    <span style={{ color: '#6b7280', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Processed By</span>
                    <div style={{ color: '#111827', fontWeight: 700, marginTop: 8, fontSize: 16 }}>👤 {data.processing.processedBy}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Distribution & Pricing Card */}
          {(data.distributor || data.price) && (
            <div style={{
              background: 'white',
              borderRadius: 16,
              padding: 32,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ 
                fontSize: 12, 
                color: '#10b981', 
                fontWeight: 700,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                marginBottom: 16
              }}>
                💰 Distribution & Pricing
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {data.distributor?.vendor && (
                  <>
                    <div style={{
                      padding: 16,
                      background: '#f9fafb',
                      borderRadius: 12,
                      border: '1px solid #e5e7eb',
                      gridColumn: '1 / -1'
                    }}>
                      <span style={{ color: '#6b7280', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Distributor</span>
                      <div style={{ color: '#111827', fontWeight: 700, marginTop: 8, fontSize: 18 }}>
                        {data.distributor.vendor.name || 'Unknown'}
                      </div>
                    </div>

                    {data.distributor.vendor.address && (
                      <div style={{
                        padding: 16,
                        background: '#f9fafb',
                        borderRadius: 12,
                        border: '1px solid #e5e7eb',
                        gridColumn: '1 / -1'
                      }}>
                        <span style={{ color: '#6b7280', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Address</span>
                        <div style={{ color: '#111827', fontWeight: 600, marginTop: 8, fontSize: 15 }}>📍 {data.distributor.vendor.address}</div>
                      </div>
                    )}

                    {data.distributor.vendor.contactInfo && (
                      <div style={{
                        padding: 16,
                        background: '#f9fafb',
                        borderRadius: 12,
                        border: '1px solid #e5e7eb'
                      }}>
                        <span style={{ color: '#6b7280', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contact</span>
                        <div style={{ color: '#111827', fontWeight: 700, marginTop: 8, fontSize: 16 }}>📞 {data.distributor.vendor.contactInfo}</div>
                      </div>
                    )}

                    {data.distributor.unit && (
                      <div style={{
                        padding: 16,
                        background: '#f9fafb',
                        borderRadius: 12,
                        border: '1px solid #e5e7eb'
                      }}>
                        <span style={{ color: '#6b7280', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Unit</span>
                        <div style={{ color: '#111827', fontWeight: 700, marginTop: 8, fontSize: 16 }}>📦 {data.distributor.valuePerUnit ? `${data.distributor.valuePerUnit} ${data.distributor.unit}` : data.distributor.unit}</div>
                      </div>
                    )}
                  </>
                )}

                {data.price && data.price.amount && (
                  <div style={{
                    padding: 24,
                    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                    borderRadius: 12,
                    border: '2px solid #86efac',
                    gridColumn: '1 / -1',
                    textAlign: 'center'
                  }}>
                    <span style={{ color: '#15803d', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: 8 }}>
                      Price
                    </span>
                    <div style={{
                      color: '#15803d',
                      fontWeight: 800,
                      fontSize: 32,
                      letterSpacing: '-0.5px'
                    }}>
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: data.price.currency || 'VND'
                      }).format(data.price.amount)}
                    </div>
                  </div>
                )}
              </div>

              {/* Discounts */}
              {data.discounts && data.discounts.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <div style={{ 
                    fontSize: 12, 
                    color: '#0891b2', 
                    fontWeight: 700,
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    marginBottom: 12
                  }}>
                    🏷️ Active Discounts
                  </div>
                  <div style={{ display: 'grid', gap: 12 }}>
                    {data.discounts.map((discount) => (
                      <div key={discount.id} style={{
                        padding: 16,
                        background: 'linear-gradient(135deg, #cffafe 0%, #a5f3fc 100%)',
                        borderRadius: 12,
                        border: '2px solid #06b6d4'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ color: '#0e7490', fontWeight: 700, fontSize: 16 }}>{discount.name || 'Discount'}</div>
                            {discount.percentage && (
                              <div style={{ color: '#0891b2', fontWeight: 800, fontSize: 24, marginTop: 4 }}>
                                -{discount.percentage}%
                              </div>
                            )}
                            {discount.minValue && (
                              <div style={{ color: '#155e75', fontSize: 12, marginTop: 4 }}>
                                Min: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discount.minValue)}
                              </div>
                            )}
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            {discount.startDate && discount.expiredDate && (
                              <div style={{ color: '#155e75', fontSize: 11 }}>
                                Valid: {new Date(discount.startDate).toLocaleDateString('vi-VN')} - {new Date(discount.expiredDate).toLocaleDateString('vi-VN')}
                              </div>
                            )}
                            {discount.isStackable && (
                              <div style={{ color: '#166534', fontSize: 11, marginTop: 4, fontWeight: 600 }}>✓ Stackable</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Warehouse Storage Card */}
          {data.warehouses && data.warehouses.length > 0 && (
            <div style={{
              background: 'white',
              borderRadius: 16,
              padding: 32,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ 
                fontSize: 12, 
                color: '#6366f1', 
                fontWeight: 700,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                marginBottom: 16
              }}>
                🏪 Warehouse Storage
              </div>

              <div style={{ display: 'grid', gap: 20 }}>
                {data.warehouses.map((warehouse, idx) => (
                  <div key={warehouse.id} style={{
                    padding: 20,
                    background: '#f9fafb',
                    borderRadius: 12,
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{ color: '#4f46e5', fontWeight: 700, fontSize: 16, marginBottom: 12 }}>
                      Warehouse #{idx + 1}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <span style={{ color: '#6b7280', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', display: 'block' }}>Address</span>
                        <div style={{ color: '#111827', fontWeight: 600, marginTop: 4 }}>📍 {warehouse.address}</div>
                      </div>
                      {warehouse.province && (
                        <div>
                          <span style={{ color: '#6b7280', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', display: 'block' }}>Province</span>
                          <div style={{ color: '#111827', fontWeight: 600, marginTop: 4 }}>{warehouse.province}</div>
                        </div>
                      )}
                      {warehouse.capacity && (
                        <div>
                          <span style={{ color: '#6b7280', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', display: 'block' }}>Capacity</span>
                          <div style={{ color: '#111827', fontWeight: 600, marginTop: 4 }}>{warehouse.capacity} units</div>
                        </div>
                      )}
                      {warehouse.quantity && (
                        <div>
                          <span style={{ color: '#6b7280', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', display: 'block' }}>Stored Quantity</span>
                          <div style={{ color: '#111827', fontWeight: 700, marginTop: 4 }}>📦 {warehouse.quantity} units</div>
                        </div>
                      )}
                      {warehouse.storeCondition && (
                        <div style={{ gridColumn: '1 / -1' }}>
                          <span style={{ color: '#6b7280', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', display: 'block' }}>Storage Condition</span>
                          <div style={{ color: '#111827', fontWeight: 600, marginTop: 4 }}>🌡️ {warehouse.storeCondition}</div>
                        </div>
                      )}
                      {warehouse.startDate && (
                        <div>
                          <span style={{ color: '#6b7280', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', display: 'block' }}>Storage Start</span>
                          <div style={{ color: '#111827', fontWeight: 600, marginTop: 4 }}>
                            📅 {new Date(warehouse.startDate).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                      )}
                      {warehouse.endDate && (
                        <div>
                          <span style={{ color: '#6b7280', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', display: 'block' }}>Storage End</span>
                          <div style={{ color: '#111827', fontWeight: 600, marginTop: 4 }}>
                            📅 {new Date(warehouse.endDate).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shipment & Transportation Card */}
          {data.shipments && data.shipments.length > 0 && (
            <div style={{
              background: 'white',
              borderRadius: 16,
              padding: 32,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ 
                fontSize: 12, 
                color: '#ec4899', 
                fontWeight: 700,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                marginBottom: 16
              }}>
                🚚 Shipment & Transportation
              </div>

              <div style={{ display: 'grid', gap: 24 }}>
                {data.shipments.map((shipment) => (
                  <div key={shipment.id} style={{
                    padding: 20,
                    background: '#fdf4ff',
                    borderRadius: 12,
                    border: '2px solid #ec4899'
                  }}>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div style={{ color: '#be185d', fontWeight: 700, fontSize: 16 }}>Shipment #{shipment.id}</div>
                        <div style={{
                          padding: '4px 12px',
                          background: shipment.status === 'Delivered' ? '#dcfce7' : '#fef3c7',
                          color: shipment.status === 'Delivered' ? '#166534' : '#92400e',
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 700
                        }}>
                          {shipment.status}
                        </div>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        {shipment.startLocation && (
                          <div>
                            <span style={{ color: '#9f1239', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', display: 'block' }}>From</span>
                            <div style={{ color: '#111827', fontWeight: 600, marginTop: 4 }}>📍 {shipment.startLocation}</div>
                          </div>
                        )}
                        {shipment.destination && (
                          <div>
                            <span style={{ color: '#9f1239', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', display: 'block' }}>To</span>
                            <div style={{ color: '#111827', fontWeight: 600, marginTop: 4 }}>🎯 {shipment.destination}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Transport Legs */}
                    {shipment.transportLegs && shipment.transportLegs.length > 0 && (
                      <div>
                        <div style={{ 
                          fontSize: 12, 
                          color: '#9f1239', 
                          fontWeight: 700,
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase',
                          marginBottom: 12
                        }}>
                          🛣️ Transport Route ({shipment.transportLegs.length} legs)
                        </div>
                        <div style={{ display: 'grid', gap: 12 }}>
                          {shipment.transportLegs.map((leg, legIdx) => (
                            <div key={leg.id} style={{
                              padding: 16,
                              background: 'white',
                              borderRadius: 8,
                              border: '1px solid #e5e7eb'
                            }}>
                              <div style={{ color: '#7c3aed', fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
                                Leg {legIdx + 1}: {leg.startLocation} → {leg.toLocation}
                              </div>
                              
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
                                {leg.departureTime && (
                                  <div>
                                    <span style={{ color: '#6b7280', fontSize: 11 }}>Departure:</span>
                                    <div style={{ color: '#111827', fontWeight: 600, marginTop: 2 }}>
                                      🕐 {new Date(leg.departureTime).toLocaleString('vi-VN')}
                                    </div>
                                  </div>
                                )}
                                {leg.arrivalTime && (
                                  <div>
                                    <span style={{ color: '#6b7280', fontSize: 11 }}>Arrival:</span>
                                    <div style={{ color: '#111827', fontWeight: 600, marginTop: 2 }}>
                                      🕐 {new Date(leg.arrivalTime).toLocaleString('vi-VN')}
                                    </div>
                                  </div>
                                )}
                                {leg.driverName && (
                                  <div>
                                    <span style={{ color: '#6b7280', fontSize: 11 }}>Driver:</span>
                                    <div style={{ color: '#111827', fontWeight: 600, marginTop: 2 }}>👤 {leg.driverName}</div>
                                  </div>
                                )}
                                {leg.temperatureProfile && (
                                  <div>
                                    <span style={{ color: '#6b7280', fontSize: 11 }}>Temperature:</span>
                                    <div style={{ color: '#111827', fontWeight: 600, marginTop: 2 }}>🌡️ {leg.temperatureProfile}</div>
                                  </div>
                                )}
                                {leg.carrierCompany && (
                                  <div style={{ gridColumn: '1 / -1' }}>
                                    <span style={{ color: '#6b7280', fontSize: 11 }}>Carrier Company:</span>
                                    <div style={{ color: '#111827', fontWeight: 700, marginTop: 2 }}>
                                      🚛 {leg.carrierCompany.name || leg.carrierCompany.tin}
                                      {leg.carrierCompany.contactInfo && (
                                        <span style={{ color: '#6b7280', fontWeight: 500, marginLeft: 8 }}>
                                          ({leg.carrierCompany.contactInfo})
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          padding: '32px 24px',
          color: '#9ca3af'
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>✓ Verified and traced from source to destination</div>
          <div style={{ fontSize: 12 }}>Powered by Agricultural Product Traceability System</div>
        </div>
      </div>
    </div>
  )
}
