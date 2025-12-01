import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { getSiteUrl } from '../lib/networks'

export default function TracePage() {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)

  const products = [
    {
      label: 'Organic Lettuce',
      code: 'QR_BATCH_00001',
      emoji: '🥬',
      grade: 'B',
      color: '#3b82f6', // Blue for Grade B
      bgColor: '#dbeafe'
    },
    {
      label: 'Fresh Carrot',
      code: 'QR_BATCH_00002',
      emoji: '🥕',
      grade: 'C',
      color: '#f59e0b', // Orange for Grade C
      bgColor: '#fef3c7'
    },
    {
      label: 'Premium Strawberry',
      code: 'QR_BATCH_00003',
      emoji: '🍓',
      grade: 'A',
      color: '#10b981', // Green for Grade A
      bgColor: '#d1fae5'
    },
    {
      label: 'Sweet Orange',
      code: 'QR_BATCH_00004',
      emoji: '🍊',
      grade: 'B',
      color: '#3b82f6', // Blue for Grade B
      bgColor: '#dbeafe'
    },
    {
      label: 'Tropical Mango',
      code: 'QR_BATCH_00005',
      emoji: '🥭',
      grade: 'C',
      color: '#f59e0b', // Orange for Grade C
      bgColor: '#fef3c7'
    },
    {
      label: 'Grapefruit',
      code: 'QR_BATCH_00006',
      emoji: '🍊',
      grade: 'A',
      color: '#10b981', // Green for Grade A
      bgColor: '#d1fae5'
    },
  ]

  const handleProductClick = (code: string) => {
    setSelectedProduct(code)
  }

  const getProductUrl = (code: string) => {
    const siteUrl = getSiteUrl()
    return `${siteUrl}/product?code=${code}`
  }

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: 24 }}>
      {/* Navigation Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        padding: '16px 0',
        borderBottom: '2px solid #e5e7eb'
      }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <a
            href="/"
            style={{
              padding: '8px 16px',
              color: '#667eea',
              textDecoration: 'none',
              fontWeight: 600,
              background: '#f3f4f6',
              borderRadius: 8
            }}
          >
            Home
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
      </div>

      <h1 style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontSize: 42,
        fontWeight: 700,
        marginBottom: 8
      }}>
        Agricultural Product Traceability
      </h1>
      <p style={{ color: '#6b7280', marginBottom: 24 }}>
        Select a product to generate QR code for mobile scanning
      </p>

      <div style={{
        background: 'white',
        borderRadius: 16,
        padding: 24,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ marginBottom: 16, color: '#374151', fontSize: 18, fontWeight: 600 }}>
          Select Product:
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {products.map(product => {
            const isSelected = selectedProduct === product.code
            return (
              <button
                key={product.code}
                onClick={() => handleProductClick(product.code)}
                style={{
                  padding: '24px',
                  background: isSelected ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
                  color: isSelected ? 'white' : '#374151',
                  border: isSelected ? 'none' : `2px solid ${product.bgColor}`,
                  borderRadius: 16,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: isSelected ? '0 8px 16px rgba(102,126,234,0.3)' : '0 2px 8px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 12,
                  position: 'relative' as const,
                  overflow: 'hidden'
                }}
                onMouseEnter={e => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = product.color
                    e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'
                    e.currentTarget.style.boxShadow = `0 8px 16px ${product.color}40`
                  }
                }}
                onMouseLeave={e => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = product.bgColor
                    e.currentTarget.style.transform = 'translateY(0) scale(1)'
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'
                  }
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  background: isSelected ? 'rgba(255,255,255,0.3)' : product.bgColor,
                  color: isSelected ? 'white' : product.color,
                  padding: '4px 12px',
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.5px'
                }}>
                  GRADE {product.grade}
                </div>
                <span style={{ fontSize: 48, marginTop: 8 }}>{product.emoji}</span>
                <span style={{ fontSize: 18, fontWeight: 700 }}>{product.label}</span>
                <span style={{
                  fontSize: 12,
                  opacity: isSelected ? 0.9 : 0.6,
                  fontFamily: 'monospace',
                  marginTop: 4
                }}>
                  {product.code}
                </span>
              </button>
            )
          })}
        </div>

        {selectedProduct && (
          <div style={{
            marginTop: 32,
            padding: 24,
            background: '#f9fafb',
            borderRadius: 12,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16
          }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#374151' }}>
              Scan QR Code with your phone:
            </div>
            <div style={{
              padding: 20,
              background: 'white',
              borderRadius: 12,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <QRCodeSVG
                value={getProductUrl(selectedProduct)}
                size={256}
                level="H"
                includeMargin={true}
              />
            </div>
            <div style={{
              fontSize: 14,
              color: '#6b7280',
              textAlign: 'center',
              maxWidth: 400
            }}>
              Point your phone camera at this QR code to view detailed product information
            </div>
            <div style={{
              fontSize: 12,
              color: '#9ca3af',
              fontFamily: 'monospace',
              background: 'white',
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #e5e7eb'
            }}>
              {getProductUrl(selectedProduct)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
