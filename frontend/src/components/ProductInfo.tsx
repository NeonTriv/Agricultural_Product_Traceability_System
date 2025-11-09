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

    const baseUrl = 'http://localhost:5000'

    fetchTraceByCode(baseUrl, code)
      .then(d => setData(d))
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

      {/* Product Information */}
      <div style={{
        background: 'white',
        padding: 24,
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>PRODUCT</div>
        <h2 style={{ margin: '0 0 16px 0', fontSize: 24, color: '#111827' }}>{data.product.name}</h2>

        {data.product.imageUrl && (
          <img
            src={data.product.imageUrl}
            alt={data.product.name}
            style={{ width: '100%', maxWidth: 300, borderRadius: 8, marginBottom: 16 }}
          />
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 14 }}>
          <div>
            <span style={{ color: '#6b7280' }}>Product ID:</span>
            <div style={{ color: '#111827', fontWeight: 600, marginTop: 4 }}>{data.product.id}</div>
          </div>
          <div>
            <span style={{ color: '#6b7280' }}>QR Code:</span>
            <div style={{ color: '#111827', fontWeight: 600, marginTop: 4, fontFamily: 'monospace', fontSize: 12 }}>{data.code}</div>
          </div>
        </div>
      </div>

      {/* Batch Information */}
      <div style={{
        background: 'white',
        padding: 24,
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 12 }}>BATCH DETAILS</div>
        <div style={{ display: 'grid', gap: 12, fontSize: 14 }}>
          <div>
            <span style={{ color: '#6b7280' }}>Batch ID:</span>
            <div style={{ color: '#111827', fontWeight: 600, marginTop: 4 }}>{data.batch.id}</div>
          </div>
          {data.batch.harvestDate && (
            <div>
              <span style={{ color: '#6b7280' }}>Harvest Date:</span>
              <div style={{ color: '#111827', fontWeight: 600, marginTop: 4 }}>📅 {data.batch.harvestDate}</div>
            </div>
          )}
          {data.batch.grade && (
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
                ⭐ {data.batch.grade}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Farm Information */}
      <div style={{
        background: 'white',
        padding: 24,
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 12 }}>FARM INFORMATION</div>
        <div style={{ display: 'grid', gap: 12, fontSize: 14 }}>
          <div>
            <span style={{ color: '#6b7280' }}>Farm Name:</span>
            <div style={{ color: '#111827', fontWeight: 600, marginTop: 4 }}>🏡 {data.farm.name}</div>
          </div>
          {data.farm.address && (
            <div>
              <span style={{ color: '#6b7280' }}>Address:</span>
              <div style={{ color: '#111827', marginTop: 4 }}>{data.farm.address}</div>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {data.farm.province && (
              <div>
                <span style={{ color: '#6b7280' }}>Province:</span>
                <div style={{ color: '#111827', fontWeight: 600, marginTop: 4 }}>{data.farm.province}</div>
              </div>
            )}
            {data.farm.country && (
              <div>
                <span style={{ color: '#6b7280' }}>Country:</span>
                <div style={{ color: '#111827', fontWeight: 600, marginTop: 4 }}>🇻🇳 {data.farm.country}</div>
              </div>
            )}
          </div>
          {data.farm.certifications && data.farm.certifications.length > 0 && (
            <div>
              <span style={{ color: '#6b7280' }}>Certifications:</span>
              <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {data.farm.certifications.map((cert, i) => (
                  <span key={i} style={{
                    padding: '4px 12px',
                    background: '#dbeafe',
                    color: '#1e40af',
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 500
                  }}>
                    ✓ {cert}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Processing Information */}
      {data.processing && (
        <div style={{
          background: 'white',
          padding: 24,
          borderRadius: '0 0 12px 12px'
        }}>
          <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 12 }}>PROCESSING DETAILS</div>
          <div style={{ display: 'grid', gap: 12, fontSize: 14 }}>
            {data.processing.facility && (
              <div>
                <span style={{ color: '#6b7280' }}>Processing Facility:</span>
                <div style={{ color: '#111827', fontWeight: 600, marginTop: 4 }}>🏭 {data.processing.facility}</div>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {data.processing.packedAt && (
                <div>
                  <span style={{ color: '#6b7280' }}>Packed Date:</span>
                  <div style={{ color: '#111827', fontWeight: 600, marginTop: 4 }}>📦 {data.processing.packedAt}</div>
                </div>
              )}
              {data.processing.processedBy && (
                <div>
                  <span style={{ color: '#6b7280' }}>Processed By:</span>
                  <div style={{ color: '#111827', fontWeight: 600, marginTop: 4 }}>👤 {data.processing.processedBy}</div>
                </div>
              )}
            </div>
            {data.processing.packagingType && (
              <div>
                <span style={{ color: '#6b7280' }}>Packaging Type:</span>
                <div style={{ color: '#111827', fontWeight: 600, marginTop: 4 }}>📦 {data.processing.packagingType}</div>
              </div>
            )}
          </div>
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
