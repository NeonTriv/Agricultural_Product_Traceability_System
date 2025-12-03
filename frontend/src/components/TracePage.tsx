import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { getSiteUrl } from '../lib/networks'
import axios from 'axios'

export default function TracePage() {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const [apiProducts, setApiProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fallback hardcoded products (if API fails)
  const fallbackProducts = [
    {
      label: 'Organic Lettuce',
      code: 'QR_BATCH_00001',
      emoji: '🥬',
      grade: 'B',
      color: '#3b82f6',
      bgColor: '#dbeafe',
      variety: 'Butterhead',
      origin: 'Da Lat, Vietnam',
      harvestDate: '2024-11-25',
      expirationDate: '2024-12-05',
      certifications: 'VietGAP, Organic',
      description: 'Fresh organic lettuce grown in Da Lat highlands with natural farming methods'
    },
    {
      label: 'Fresh Carrot',
      code: 'QR_BATCH_00002',
      emoji: '🥕',
      grade: 'C',
      color: '#f59e0b',
      bgColor: '#fef3c7',
      variety: 'Nantes',
      origin: 'Lam Dong, Vietnam',
      harvestDate: '2024-11-20',
      expirationDate: '2024-12-20',
      certifications: 'VietGAP',
      description: 'Sweet and crunchy carrots perfect for salads and juicing'
    },
    {
      label: 'Premium Strawberry',
      code: 'QR_BATCH_00003',
      emoji: '🍓',
      grade: 'A',
      color: '#10b981',
      bgColor: '#d1fae5',
      variety: 'Korean Sweet',
      origin: 'Da Lat, Vietnam',
      harvestDate: '2024-11-28',
      expirationDate: '2024-12-08',
      certifications: 'USDA Organic, GlobalG.A.P',
      description: 'Premium quality strawberries with exceptional sweetness and aroma'
    },
    {
      label: 'Sweet Orange',
      code: 'QR_BATCH_00004',
      emoji: '🍊',
      grade: 'B',
      color: '#3b82f6',
      bgColor: '#dbeafe',
      variety: 'Navel',
      origin: 'Hau Giang, Vietnam',
      harvestDate: '2024-11-15',
      expirationDate: '2024-12-25',
      certifications: 'VietGAP',
      description: 'Juicy navel oranges from the Mekong Delta region'
    },
    {
      label: 'Tropical Mango',
      code: 'QR_BATCH_00005',
      emoji: '🥭',
      grade: 'C',
      color: '#f59e0b',
      bgColor: '#fef3c7',
      variety: 'Cat Hoa Loc',
      origin: 'Dong Thap, Vietnam',
      harvestDate: '2024-11-10',
      expirationDate: '2024-12-10',
      certifications: 'VietGAP',
      description: 'Famous Cat Hoa Loc mango with sweet honey-like flavor'
    },
    {
      label: 'Grapefruit',
      code: 'QR_BATCH_00006',
      emoji: '🍊',
      grade: 'A',
      color: '#10b981',
      bgColor: '#d1fae5',
      variety: 'Ruby Red',
      origin: 'Ben Tre, Vietnam',
      harvestDate: '2024-11-22',
      expirationDate: '2024-12-22',
      certifications: 'GlobalG.A.P, VietGAP',
      description: 'Premium ruby red grapefruit with perfect sweet-tart balance'
    },
  ]

  // Helper functions to map grade to colors
  const getColorForGrade = (grade: string | undefined) => {
    if (!grade) return '#3b82f6'
    if (grade === 'A') return '#10b981'
    if (grade === 'B') return '#3b82f6'
    if (grade === 'C') return '#f59e0b'
    return '#3b82f6'
  }

  const getBgColorForGrade = (grade: string | undefined) => {
    if (!grade) return '#dbeafe'
    if (grade === 'A') return '#d1fae5'
    if (grade === 'B') return '#dbeafe'
    if (grade === 'C') return '#fef3c7'
    return '#dbeafe'
  }

  const getEmojiForProduct = (productName: string) => {
    const name = productName.toLowerCase()
    if (name.includes('lettuce') || name.includes('salad')) return '🥬'
    if (name.includes('carrot')) return '🥕'
    if (name.includes('strawberry')) return '🍓'
    if (name.includes('orange')) return '🍊'
    if (name.includes('mango')) return '🥭'
    if (name.includes('grapefruit')) return '🍊'
    if (name.includes('tomato')) return '🍅'
    if (name.includes('cucumber')) return '🥒'
    if (name.includes('pepper')) return '🌶️'
    if (name.includes('potato')) return '🥔'
    return '🌾'
  }

  // Load products from API
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true)
      try {
        const baseUrl = window.location.origin.replace(':5001', ':5000')
        const response = await axios.get(`${baseUrl}/api/products`)

        // Map API response to product format
        const dbProducts = response.data.map((item: any) => ({
          label: item.productName || 'Unknown Product',
          code: item.qrCodeUrl || `QR_BATCH_${item.batchId}`,
          emoji: getEmojiForProduct(item.productName || ''),
          grade: item.grade || 'B',
          color: getColorForGrade(item.grade),
          bgColor: getBgColorForGrade(item.grade),
          variety: item.variety || '-',
          origin: item.farmName || '-',
          harvestDate: item.harvestDate ? new Date(item.harvestDate).toISOString().split('T')[0] : '',
          expirationDate: '',
          certifications: '-',
          description: '-'
        }))

        setApiProducts(dbProducts)
      } catch (error) {
        console.error('Failed to load products from API:', error)
        setApiProducts([])
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [])

  // Combine API products with fallback products (API takes priority)
  const products = apiProducts.length > 0 ? apiProducts : fallbackProducts

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

            {/* Product Details Section */}
            {(() => {
              const product = products.find(p => p.code === selectedProduct)
              if (!product) return null

              return (
                <div style={{
                  marginTop: 32,
                  width: '100%',
                  maxWidth: 600,
                  background: 'white',
                  padding: 32,
                  borderRadius: 16,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                  <h3 style={{
                    margin: 0,
                    marginBottom: 24,
                    fontSize: 24,
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textAlign: 'center'
                  }}>
                    Product Information
                  </h3>

                  <div style={{ display: 'grid', gap: 20 }}>
                    {/* Product Name */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: 12,
                        color: '#6b7280',
                        marginBottom: 6,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Product Name
                      </label>
                      <p style={{
                        margin: 0,
                        fontSize: 18,
                        fontWeight: 700,
                        color: '#374151'
                      }}>
                        {product.emoji} {product.label}
                      </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                      {/* Variety */}
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: 12,
                          color: '#6b7280',
                          marginBottom: 6,
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          Variety
                        </label>
                        <p style={{ margin: 0, fontSize: 16, color: '#374151' }}>
                          {product.variety}
                        </p>
                      </div>

                      {/* Grade */}
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: 12,
                          color: '#6b7280',
                          marginBottom: 6,
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          Quality Grade
                        </label>
                        <span style={{
                          display: 'inline-block',
                          padding: '6px 16px',
                          background: product.bgColor,
                          color: product.color,
                          borderRadius: 999,
                          fontSize: 14,
                          fontWeight: 700,
                          letterSpacing: '0.5px'
                        }}>
                          GRADE {product.grade}
                        </span>
                      </div>
                    </div>

                    {/* Origin */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: 12,
                        color: '#6b7280',
                        marginBottom: 6,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Origin
                      </label>
                      <p style={{ margin: 0, fontSize: 16, color: '#374151' }}>
                        📍 {product.origin}
                      </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                      {/* Harvest Date */}
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: 12,
                          color: '#6b7280',
                          marginBottom: 6,
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          Harvest Date
                        </label>
                        <p style={{ margin: 0, fontSize: 16, color: '#374151' }}>
                          🌾 {new Date(product.harvestDate).toLocaleDateString('vi-VN')}
                        </p>
                      </div>

                      {/* Expiration Date */}
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: 12,
                          color: '#6b7280',
                          marginBottom: 6,
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          Best Before
                        </label>
                        <p style={{ margin: 0, fontSize: 16, color: '#374151' }}>
                          📅 {new Date(product.expirationDate).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>

                    {/* Certifications */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: 12,
                        color: '#6b7280',
                        marginBottom: 6,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Certifications
                      </label>
                      <p style={{ margin: 0, fontSize: 16, color: '#374151' }}>
                        ✓ {product.certifications}
                      </p>
                    </div>

                    {/* Description */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: 12,
                        color: '#6b7280',
                        marginBottom: 6,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Description
                      </label>
                      <p style={{
                        margin: 0,
                        fontSize: 16,
                        color: '#374151',
                        lineHeight: 1.6
                      }}>
                        {product.description}
                      </p>
                    </div>

                    {/* Batch Code */}
                    <div style={{
                      marginTop: 8,
                      padding: 16,
                      background: '#f9fafb',
                      borderRadius: 8,
                      textAlign: 'center'
                    }}>
                      <label style={{
                        display: 'block',
                        fontSize: 11,
                        color: '#6b7280',
                        marginBottom: 4,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Batch Code
                      </label>
                      <code style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: '#667eea',
                        fontFamily: 'monospace'
                      }}>
                        {product.code}
                      </code>
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        )}
      </div>
    </div>
  )
}
