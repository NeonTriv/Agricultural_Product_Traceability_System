import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { getSiteUrl } from '../lib/networks'

export default function TracePage() {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)

  const products = [
    { label: 'Grapefruit', code: 'sample_qr_code_123', emoji: '🍊' },
    { label: 'Dragon Fruit', code: 'QR_DRAGON_001', emoji: '🐉' },
    { label: 'Mango', code: 'QR_MANGO_001', emoji: '🥭' },
    { label: 'Durian', code: 'test_product_qr_001', emoji: '🌰' },
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {products.map(product => (
            <button
              key={product.code}
              onClick={() => handleProductClick(product.code)}
              style={{
                padding: '20px',
                background: selectedProduct === product.code ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
                color: selectedProduct === product.code ? 'white' : '#374151',
                border: selectedProduct === product.code ? 'none' : '2px solid #e5e7eb',
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: selectedProduct === product.code ? '0 4px 6px rgba(102,126,234,0.4)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8
              }}
              onMouseEnter={e => {
                if (selectedProduct !== product.code) {
                  e.currentTarget.style.borderColor = '#667eea'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }
              }}
              onMouseLeave={e => {
                if (selectedProduct !== product.code) {
                  e.currentTarget.style.borderColor = '#e5e7eb'
                  e.currentTarget.style.transform = 'translateY(0)'
                }
              }}
            >
              <span style={{ fontSize: 32 }}>{product.emoji}</span>
              <span>{product.label}</span>
            </button>
          ))}
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
