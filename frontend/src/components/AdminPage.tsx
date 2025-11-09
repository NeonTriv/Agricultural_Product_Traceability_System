import { useEffect, useState } from 'react'
import axios from 'axios'

interface Product {
  agricultureProductId: string
  qrCodeUrl: string
  batchId: string
  typeId: string
  typeName?: string
}

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const [formData, setFormData] = useState({
    qrCodeUrl: '',
    batchId: '',
    typeId: ''
  })

  const baseUrl = 'http://localhost:5000'

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(`${baseUrl}/api/trace`)
      setProducts(response.data)
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (editingProduct) {
        // Update existing product
        await axios.patch(`${baseUrl}/api/products/${editingProduct.agricultureProductId}`, formData)
      } else {
        // Create new product
        await axios.post(`${baseUrl}/api/products`, formData)
      }
      await loadProducts()
      resetForm()
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to save product')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    setLoading(true)
    setError(null)
    try {
      await axios.delete(`${baseUrl}/api/products/${id}`)
      await loadProducts()
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to delete product')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      qrCodeUrl: product.qrCodeUrl,
      batchId: product.batchId,
      typeId: product.typeId
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({ qrCodeUrl: '', batchId: '', typeId: '' })
    setEditingProduct(null)
    setShowForm(false)
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      {/* Navigation Header */}
      <div style={{
        display: 'flex',
        gap: 16,
        marginBottom: 24,
        padding: '16px 0',
        borderBottom: '2px solid #e5e7eb'
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
          Home
        </a>
        <a
          href="/admin"
          style={{
            padding: '8px 16px',
            color: '#667eea',
            textDecoration: 'none',
            fontWeight: 600,
            background: '#f3f4f6',
            borderRadius: 8
          }}
        >
          Admin Panel
        </a>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24
      }}>
        <h1 style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: 36,
          fontWeight: 700,
          margin: 0
        }}>
          Admin - Product Management
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(102,126,234,0.4)'
          }}
        >
          {showForm ? 'Cancel' : '+ Add New Product'}
        </button>
      </div>

      {error && (
        <div style={{
          padding: 16,
          marginBottom: 24,
          background: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: 8,
          color: '#b91c1c'
        }}>
          Error: {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div style={{
          background: 'white',
          padding: 24,
          borderRadius: 12,
          marginBottom: 24,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginTop: 0, color: '#374151' }}>
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                QR Code URL
              </label>
              <input
                type="text"
                value={formData.qrCodeUrl}
                onChange={e => setFormData({ ...formData, qrCodeUrl: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 16
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                Batch ID
              </label>
              <input
                type="text"
                value={formData.batchId}
                onChange={e => setFormData({ ...formData, batchId: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 16
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                Type ID
              </label>
              <input
                type="text"
                value={formData.typeId}
                onChange={e => setFormData({ ...formData, typeId: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 16
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '12px 24px',
                  background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                style={{
                  padding: '12px 24px',
                  background: 'white',
                  color: '#6b7280',
                  border: '2px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products List */}
      <div style={{
        background: 'white',
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>QR Code</th>
              <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Product</th>
              <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Batch ID</th>
              <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Type ID</th>
              <th style={{ padding: 16, textAlign: 'right', fontWeight: 600, color: '#374151' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && !products.length ? (
              <tr>
                <td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>
                  Loading products...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>
                  No products found. Add your first product!
                </td>
              </tr>
            ) : (
              products.map((product, index) => (
                <tr
                  key={product.agricultureProductId}
                  style={{
                    borderBottom: index < products.length - 1 ? '1px solid #e5e7eb' : 'none'
                  }}
                >
                  <td style={{ padding: 16 }}>
                    <code style={{ fontSize: 12, color: '#667eea', background: '#f3f4f6', padding: '4px 8px', borderRadius: 4 }}>
                      {product.qrCodeUrl}
                    </code>
                  </td>
                  <td style={{ padding: 16, fontWeight: 500 }}>{product.typeName || 'N/A'}</td>
                  <td style={{ padding: 16, color: '#6b7280' }}>{product.batchId}</td>
                  <td style={{ padding: 16, color: '#6b7280' }}>{product.typeId}</td>
                  <td style={{ padding: 16, textAlign: 'right' }}>
                    <button
                      onClick={() => handleEdit(product)}
                      style={{
                        padding: '6px 12px',
                        marginRight: 8,
                        background: 'white',
                        color: '#667eea',
                        border: '1px solid #667eea',
                        borderRadius: 6,
                        fontSize: 14,
                        fontWeight: 500,
                        cursor: 'pointer'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.agricultureProductId)}
                      style={{
                        padding: '6px 12px',
                        background: 'white',
                        color: '#dc2626',
                        border: '1px solid #dc2626',
                        borderRadius: 6,
                        fontSize: 14,
                        fontWeight: 500,
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
