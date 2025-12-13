import { useEffect, useState } from 'react'
import axios from 'axios'

interface Province {
  id: number
  name: string
  countryId: number
  countryName: string
}

interface Country {
  id: number
  name: string
}

interface ProvincesTabProps {
  baseUrl: string
}

export default function ProvincesTab({ baseUrl }: ProvincesTabProps) {
  const [provinces, setProvinces] = useState<Province[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingProvinceId, setEditingProvinceId] = useState<number | null>(null)
  const [formData, setFormData] = useState({ name: '', countryId: '', countryName: '' })
  const [formErrors, setFormErrors] = useState<{ name?: boolean; country?: boolean }>({})
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: number | null }>({ show: false, id: null })
  const [errorModal, setErrorModal] = useState<{ show: boolean; title: string; message: string }>({ show: false, title: '', message: '' })

  useEffect(() => {
    loadProvinces()
    loadCountries()
  }, [])

  const loadProvinces = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/products/provinces`)
      setProvinces(response.data)
    } catch (e) {
      console.error('Failed to load provinces:', e)
    }
  }

  const loadCountries = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/products/countries`)
      setCountries(response.data)
    } catch (e) {
      console.error('Failed to load countries:', e)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate
    const errors: { name?: boolean; country?: boolean } = {}
    if (!formData.name.trim()) errors.name = true
    if (!formData.countryId && !formData.countryName.trim()) errors.country = true
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setLoading(true)
    try {
      if (editingProvinceId) {
        await axios.patch(`${baseUrl}/api/products/provinces/${editingProvinceId}`, {
          name: formData.name,
          countryId: parseInt(formData.countryId)
        })
      } else {
        await axios.post(`${baseUrl}/api/products/provinces`, {
          name: formData.name,
          countryId: formData.countryId ? parseInt(formData.countryId) : undefined,
          countryName: formData.countryName || undefined
        })
      }
      loadProvinces()
      loadCountries()
      setShowForm(false)
      setFormData({ name: '', countryId: '', countryName: '' })
      setEditingProvinceId(null)
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message
      setErrorModal({ show: true, title: '⚠️ Error', message: msg })
    } finally {
      setLoading(false)
    }
  }

  const handleEditProvince = (p: Province) => {
    setEditingProvinceId(p.id)
    setFormData({ name: p.name, countryId: p.countryId.toString(), countryName: '' })
    setShowForm(true)
  }

  const handleDeleteProvince = (id: number) => {
    setDeleteConfirm({ show: true, id })
  }

  const confirmDeleteProvince = async () => {
    if (!deleteConfirm.id) return
    setLoading(true)
    try {
      await axios.delete(`${baseUrl}/api/products/provinces/${deleteConfirm.id}`)
      loadProvinces()
      setDeleteConfirm({ show: false, id: null })
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message
      setErrorModal({ show: true, title: '⚠️ Cannot Delete Province', message: msg })
      setDeleteConfirm({ show: false, id: null })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ marginTop: 0 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Provinces Management
          </h2>
          <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: 14 }}>Manage provinces and countries locations</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setFormData({ name: '', countryId: '', countryName: '' }); setFormErrors({}); setEditingProvinceId(null) }}
          style={{ padding: '12px 24px', background: showForm ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(102,126,234,0.3)' }}
        >
          {showForm ? 'Cancel' : editingProvinceId ? 'Cancel Edit' : '+ Add Province'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: 24, padding: 24, background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#374151' }}>{editingProvinceId ? 'Edit Province' : 'New Province'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Province Name <span style={{ color: '#dc2626' }}>*</span></label>
              <input
                type="text"
                value={formData.name}
                onChange={e => { setFormData({ ...formData, name: e.target.value }); setFormErrors({ ...formErrors, name: false }) }}
                style={{ width: '100%', padding: 12, border: formErrors.name ? '2px solid #dc2626' : '2px solid #e5e7eb', borderRadius: 8 }}
                placeholder="e.g., Lam Dong"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Country <span style={{ color: '#dc2626' }}>*</span></label>
              <select
                value={formData.countryId}
                onChange={e => { setFormData({ ...formData, countryId: e.target.value }); setFormErrors({ ...formErrors, country: false }) }}
                style={{ width: '100%', padding: 12, border: formErrors.country ? '2px solid #dc2626' : '2px solid #e5e7eb', borderRadius: 8, marginBottom: 8 }}
              >
                <option value="">-- Select Country --</option>
                {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {!editingProvinceId && (
                <input
                  type="text"
                  value={formData.countryName}
                  onChange={e => { setFormData({ ...formData, countryName: e.target.value }); setFormErrors({ ...formErrors, country: false }) }}
                  placeholder="Or type new country name..."
                  style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8 }}
                />
              )}
            </div>
          </div>
          <button type="submit" disabled={loading} style={{ marginTop: 16, padding: '12px 24px', background: '#667eea', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
            {loading ? 'Saving...' : editingProvinceId ? 'Update Province' : 'Create Province'}
          </button>
        </form>
      )}

      {/* Table */}
      <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>ID</th>
              <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Province Name</th>
              <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Country</th>
              <th style={{ padding: 16, textAlign: 'right', fontWeight: 600, color: '#374151' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {provinces.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: 16, color: '#374151', fontWeight: 600 }}>#{p.id}</td>
                <td style={{ padding: 16, color: '#374151' }}>{p.name}</td>
                <td style={{ padding: 16, color: '#6b7280' }}>{p.countryName}</td>
                <td style={{ padding: 16, textAlign: 'right' }}>
                  <button
                    onClick={() => handleEditProvince(p)}
                    style={{ marginRight: 8, padding: '6px 12px', border: '1px solid #3b82f6', color: '#3b82f6', borderRadius: 6, background: 'white', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProvince(p.id)}
                    style={{ padding: '6px 12px', border: '1px solid #ef4444', color: '#ef4444', borderRadius: 6, background: 'white', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div
          onClick={() => setDeleteConfirm({ show: false, id: null })}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
        >
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: 'white', padding: 32, borderRadius: 16, maxWidth: 400, width: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 16 }}>❓</div>
            <h3 style={{ fontSize: 24, fontWeight: 600, marginBottom: 12, textAlign: 'center' }}>Confirm Delete</h3>
            <p style={{ color: '#666', textAlign: 'center', marginBottom: 24 }}>
              Are you sure you want to delete this province? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setDeleteConfirm({ show: false, id: null })} style={{ flex: 1, padding: '12px 24px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>Cancel</button>
              <button onClick={confirmDeleteProvince} style={{ flex: 1, padding: '12px 24px', borderRadius: 8, border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {errorModal.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 32, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', maxWidth: 500, textAlign: 'left' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: 20, fontWeight: 700 }}>{errorModal.title}</h3>
            <p style={{ margin: '0 0 24px 0', color: '#6b7280', fontSize: 15, lineHeight: '1.6' }}>{errorModal.message}</p>
            <button
              onClick={() => setErrorModal({ show: false, title: '', message: '' })}
              style={{ width: '100%', padding: '10px 24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
