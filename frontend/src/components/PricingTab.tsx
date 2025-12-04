import React, { useState, useEffect } from 'react'
import axios from 'axios'

const baseUrl = 'http://localhost:5000'

interface Price {
  vendorProductId: number
  value: number
  currency: string
  productName?: string
  vendorName?: string
  unit?: string
}

interface VendorProduct {
  id: number
  productName?: string
  vendorName?: string
  unit?: string
}

export default function PricingTab() {
  const [prices, setPrices] = useState<Price[]>([])
  const [vendorProducts, setVendorProducts] = useState<VendorProduct[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    vendorProductId: '',
    value: '',
    currency: 'VND'
  })
  const [editingPrice, setEditingPrice] = useState<Price | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchPrices = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${baseUrl}/api/pricing/prices`)
      setPrices(res.data)
      setError('')
    } catch (err: any) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchVendorProducts = async () => {
    try {
      const res = await axios.get(`${baseUrl}/api/pricing/vendor-products`)
      setVendorProducts(res.data)
    } catch (err: any) {
      console.error('Failed to fetch vendor products:', err)
    }
  }

  useEffect(() => {
    fetchPrices()
    fetchVendorProducts()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingPrice) {
        await axios.patch(`${baseUrl}/api/pricing/prices/${editingPrice.vendorProductId}`, {
          value: parseFloat(formData.value),
          currency: formData.currency
        })
      } else {
        await axios.post(`${baseUrl}/api/pricing/prices`, {
          vendorProductId: parseInt(formData.vendorProductId),
          value: parseFloat(formData.value),
          currency: formData.currency
        })
      }
      setShowForm(false)
      setEditingPrice(null)
      setFormData({ vendorProductId: '', value: '', currency: 'VND' })
      fetchPrices()
    } catch (err: any) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (price: Price) => {
    setEditingPrice(price)
    setFormData({
      vendorProductId: price.vendorProductId.toString(),
      value: price.value.toString(),
      currency: price.currency
    })
    setShowForm(true)
  }

  const handleDelete = async (vendorProductId: number) => {
    if (!confirm('Are you sure you want to delete this price?')) return
    setLoading(true)
    try {
      await axios.delete(`${baseUrl}/api/pricing/prices/${vendorProductId}`)
      fetchPrices()
    } catch (err: any) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number, currency: string) => {
    if (currency === 'VND') {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
    }
    return `${value.toLocaleString()} ${currency}`
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ color: '#374151', fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
          💰 Price Management
        </h2>
        <p style={{ color: '#6b7280', fontSize: 14 }}>
          Manage pricing for vendor products
        </p>
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

      {showForm && (
        <div style={{
          background: 'white',
          padding: 24,
          borderRadius: 12,
          marginBottom: 24,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginTop: 0, color: '#374151' }}>
            {editingPrice ? 'Edit Price' : 'Add New Price'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {!editingPrice && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                    Vendor Product ID *
                  </label>
                  <select
                    value={formData.vendorProductId}
                    onChange={e => setFormData({ ...formData, vendorProductId: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: 8,
                      fontSize: 16
                    }}
                  >
                    <option value="">Select Vendor Product</option>
                    {vendorProducts.map(vp => (
                      <option key={vp.id} value={vp.id}>
                        {vp.id} - {vp.productName || 'Unknown Product'} - {vp.vendorName || 'Unknown Vendor'}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                  Price Value *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.value}
                  onChange={e => setFormData({ ...formData, value: e.target.value })}
                  required
                  min="0"
                  placeholder="Enter price"
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
                  Currency *
                </label>
                <select
                  value={formData.currency}
                  onChange={e => setFormData({ ...formData, currency: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: 8,
                    fontSize: 16
                  }}
                >
                  <option value="VND">VND (Vietnamese Dong)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="EUR">EUR (Euro)</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? 'Saving...' : (editingPrice ? 'Update' : 'Create')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingPrice(null)
                  setFormData({ vendorProductId: '', value: '', currency: 'VND' })
                }}
                style={{
                  padding: '12px 24px',
                  background: 'white',
                  color: '#667eea',
                  border: '2px solid #667eea',
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

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: 24
          }}
        >
          + Add New Price
        </button>
      )}

      <div style={{
        background: 'white',
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Vendor Product ID</th>
              <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Product Name</th>
              <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Vendor</th>
              <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Unit</th>
              <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Price</th>
              <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Currency</th>
              <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>
                  Loading prices...
                </td>
              </tr>
            ) : prices.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>
                  No prices found. Add your first price!
                </td>
              </tr>
            ) : (
              prices.map((price, index) => (
                <tr
                  key={price.vendorProductId}
                  style={{
                    borderBottom: index < prices.length - 1 ? '1px solid #e5e7eb' : 'none'
                  }}
                >
                  <td style={{ padding: 16, fontWeight: 600 }}>#{price.vendorProductId}</td>
                  <td style={{ padding: 16, color: '#374151' }}>{price.productName || '-'}</td>
                  <td style={{ padding: 16, color: '#6b7280' }}>{price.vendorName || '-'}</td>
                  <td style={{ padding: 16, color: '#6b7280' }}>{price.unit || '-'}</td>
                  <td style={{ padding: 16 }}>
                    <span style={{
                      padding: '6px 12px',
                      background: '#dcfce7',
                      color: '#166534',
                      borderRadius: 6,
                      fontSize: 14,
                      fontWeight: 700
                    }}>
                      {formatCurrency(price.value, price.currency)}
                    </span>
                  </td>
                  <td style={{ padding: 16, color: '#6b7280' }}>{price.currency}</td>
                  <td style={{ padding: 16 }}>
                    <button
                      onClick={() => handleEdit(price)}
                      style={{
                        padding: '6px 12px',
                        marginRight: 8,
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        fontSize: 14,
                        cursor: 'pointer'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(price.vendorProductId)}
                      style={{
                        padding: '6px 12px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        fontSize: 14,
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
