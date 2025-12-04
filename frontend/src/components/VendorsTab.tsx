import { useState, useEffect } from 'react'
import axios from 'axios'

interface Vendor {
  tin: string
  name: string
  address: string
  contactInfo?: string
  type: 'vendor' | 'distributor' | 'retail'
  distributorType?: string
  retailFormat?: string
}

export default function VendorsTab() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null)

  const [formData, setFormData] = useState({
    tin: '',
    name: '',
    address: '',
    contactInfo: '',
    vendorType: '' as 'distributor' | 'retail' | '',
    distributorType: '',
    retailFormat: ''
  })

  const baseUrl = 'http://localhost:5000'

  useEffect(() => {
    loadVendors()
  }, [])

  const loadVendors = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(`${baseUrl}/api/vendors`)
      setVendors(response.data)
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load vendors')
      console.error('API Error:', e)
      setVendors([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (editingVendor) {
        // Update existing vendor
        await axios.patch(`${baseUrl}/api/vendors/${editingVendor.tin}`, {
          name: formData.name,
          address: formData.address,
          contactInfo: formData.contactInfo || undefined,
        })
      } else {
        // Create new vendor
        await axios.post(`${baseUrl}/api/vendors`, {
          tin: formData.tin,
          name: formData.name,
          address: formData.address,
          contactInfo: formData.contactInfo || undefined,
          vendorType: formData.vendorType || undefined,
          distributorType: formData.distributorType || undefined,
          retailFormat: formData.retailFormat || undefined,
        })
      }
      await loadVendors()
      resetForm()
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to save vendor')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (tin: string) => {
    if (!confirm('Are you sure you want to delete this vendor?')) return

    setLoading(true)
    setError(null)
    try {
      await axios.delete(`${baseUrl}/api/vendors/${tin}`)
      await loadVendors()
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to delete vendor')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor)
    setFormData({
      tin: vendor.tin,
      name: vendor.name,
      address: vendor.address,
      contactInfo: vendor.contactInfo || '',
      vendorType: vendor.type === 'vendor' ? '' : vendor.type,
      distributorType: vendor.distributorType || '',
      retailFormat: vendor.retailFormat || ''
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      tin: '',
      name: '',
      address: '',
      contactInfo: '',
      vendorType: '',
      distributorType: '',
      retailFormat: ''
    })
    setEditingVendor(null)
    setShowForm(false)
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        padding: '16px 0'
      }}>
        <h1 style={{
          fontSize: 28,
          fontWeight: 700,
          margin: 0
        }}>
          Vendor Management
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(102,126,234,0.4)'
          }}
        >
          {showForm ? 'Cancel' : '+ Add New Vendor'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          padding: 16,
          background: '#fee',
          color: '#c33',
          borderRadius: 8,
          marginBottom: 16
        }}>
          {error}
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
            {editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* TIN */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                  TIN (Tax ID) *
                </label>
                <input
                  type="text"
                  value={formData.tin}
                  onChange={e => setFormData({ ...formData, tin: e.target.value })}
                  required
                  disabled={!!editingVendor}
                  placeholder="e.g., 1234567890"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: 8,
                    fontSize: 16,
                    background: editingVendor ? '#f3f4f6' : 'white'
                  }}
                />
              </div>

              {/* Name */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                  Vendor Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., BigC Supermarket"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: 8,
                    fontSize: 16
                  }}
                />
              </div>

              {/* Address */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                  Address *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  required
                  placeholder="e.g., HCMC, Vietnam"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: 8,
                    fontSize: 16
                  }}
                />
              </div>

              {/* Contact Info */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                  Contact Info
                </label>
                <input
                  type="text"
                  value={formData.contactInfo}
                  onChange={e => setFormData({ ...formData, contactInfo: e.target.value })}
                  placeholder="Phone, email, etc."
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: 8,
                    fontSize: 16
                  }}
                />
              </div>

              {/* Vendor Type */}
              {!editingVendor && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                    Vendor Type
                  </label>
                  <select
                    value={formData.vendorType}
                    onChange={e => setFormData({ ...formData, vendorType: e.target.value as any })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: 8,
                      fontSize: 16
                    }}
                  >
                    <option value="">Regular Vendor</option>
                    <option value="distributor">Distributor</option>
                    <option value="retail">Retail</option>
                  </select>
                </div>
              )}

              {/* Distributor Type */}
              {formData.vendorType === 'distributor' && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                    Distributor Type *
                  </label>
                  <select
                    value={formData.distributorType}
                    onChange={e => setFormData({ ...formData, distributorType: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: 8,
                      fontSize: 16
                    }}
                  >
                    <option value="">Select type...</option>
                    <option value="Direct">Direct</option>
                    <option value="Indirect">Indirect</option>
                  </select>
                </div>
              )}

              {/* Retail Format */}
              {formData.vendorType === 'retail' && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                    Retail Format *
                  </label>
                  <select
                    value={formData.retailFormat}
                    onChange={e => setFormData({ ...formData, retailFormat: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: 8,
                      fontSize: 16
                    }}
                  >
                    <option value="">Select format...</option>
                    <option value="Supermarket">Supermarket</option>
                    <option value="Online Store">Online Store</option>
                    <option value="Convenience Store">Convenience Store</option>
                    <option value="Traditional Market">Traditional Market</option>
                    <option value="Specialty Shop">Specialty Shop</option>
                  </select>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? 'Saving...' : editingVendor ? 'Update Vendor' : 'Create Vendor'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                style={{
                  padding: '12px 24px',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
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

      {/* Vendors List */}
      <div style={{
        background: 'white',
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>TIN</th>
              <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Name</th>
              <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Address</th>
              <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Contact</th>
              <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Type</th>
              <th style={{ padding: 16, textAlign: 'center', fontWeight: 600, color: '#374151' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#6b7280' }}>
                  Loading vendors...
                </td>
              </tr>
            )}
            {!loading && vendors.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#6b7280' }}>
                  No vendors found. Click "+ Add New Vendor" to create one.
                </td>
              </tr>
            )}
            {!loading && vendors.map(vendor => (
              <tr key={vendor.tin} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: 16, color: '#374151', fontFamily: 'monospace' }}>{vendor.tin}</td>
                <td style={{ padding: 16, color: '#374151', fontWeight: 600 }}>{vendor.name}</td>
                <td style={{ padding: 16, color: '#6b7280' }}>{vendor.address}</td>
                <td style={{ padding: 16, color: '#6b7280' }}>{vendor.contactInfo || '-'}</td>
                <td style={{ padding: 16 }}>
                  <span style={{
                    padding: '4px 12px',
                    background: vendor.type === 'distributor' ? '#dbeafe' : vendor.type === 'retail' ? '#d1fae5' : '#f3f4f6',
                    color: vendor.type === 'distributor' ? '#1e40af' : vendor.type === 'retail' ? '#065f46' : '#374151',
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 600
                  }}>
                    {vendor.type === 'distributor' && vendor.distributorType
                      ? `${vendor.type} (${vendor.distributorType})`
                      : vendor.type === 'retail' && vendor.retailFormat
                      ? `${vendor.type} (${vendor.retailFormat})`
                      : vendor.type}
                  </span>
                </td>
                <td style={{ padding: 16, textAlign: 'center' }}>
                  <button
                    onClick={() => handleEdit(vendor)}
                    style={{
                      padding: '6px 12px',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      marginRight: 8
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(vendor.tin)}
                    style={{
                      padding: '6px 12px',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
