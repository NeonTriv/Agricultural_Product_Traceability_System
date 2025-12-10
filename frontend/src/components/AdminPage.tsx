import { useEffect, useState } from 'react'
import axios from 'axios'
import VendorsTab from './VendorsTab'
import FarmsTab from './FarmsTab'
import ProcessingTab from './ProcessingTab'
import LogisticsTab from './LogisticsTab'
import StorageTab from './StorageTab'
import PricingTab from './PricingTab'

interface Product {
  id: string
  name: string
  variety?: string
  grade?: string
  harvestDate?: string
  farmId?: number
  agricultureProductId?: number
  vendorProductId?: number
}

interface Farm {
  id: number
  name: string
  ownerName?: string
  contactInfo?: string
  longitude?: number
  latitude?: number
  provinceId: number
  provinceName?: string
  countryName?: string
}

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

interface Vendor {
  tin: string
  name: string
  address: string
  contactInfo?: string
  type: 'vendor' | 'distributor' | 'retail'
  distributorType?: string
  retailFormat?: string
}

// Mock admin credentials - Ready to connect to DB later
const MOCK_ADMIN = {
  username: 'admin',
  password: 'admin123'
}

// ==================== CATEGORIES SUB-TAB ====================
function CategoriesSubTab({ baseUrl }: { baseUrl: string }) {
  const [categories, setCategories] = useState<{id: number, name: string}[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '' })
  const [formErrors, setFormErrors] = useState<{[key: string]: boolean}>({})
  const [editingId, setEditingId] = useState<number | null>(null)

  useEffect(() => { loadCategories() }, [])

  const loadCategories = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${baseUrl}/api/master-data/categories`)
      setCategories(res.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name) { setFormErrors({ name: true }); return }
    setLoading(true)
    try {
      if (editingId) {
        await axios.patch(`${baseUrl}/api/master-data/categories/${editingId}`, formData)
      } else {
        await axios.post(`${baseUrl}/api/master-data/categories`, formData)
      }
      setFormData({ name: '' }); setShowForm(false); setEditingId(null); loadCategories()
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this category?')) return
    try { await axios.delete(`${baseUrl}/api/master-data/categories/${id}`); loadCategories() }
    catch (e) { console.error(e) }
  }

  return (
    <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ margin: 0, color: '#374151' }}>Categories / Danh mục</h3>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ name: '' }) }}
          style={{ padding: '8px 16px', background: showForm ? '#9ca3af' : '#667eea', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
          {showForm ? 'Cancel' : '+ Add Category'}
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: 16, padding: 16, background: '#f9fafb', borderRadius: 8 }}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Name <span style={{ color: '#dc2626' }}>*</span></label>
            <input type="text" value={formData.name} onChange={e => { setFormData({ name: e.target.value }); setFormErrors({}) }}
              style={{ width: '100%', padding: '10px 14px', border: formErrors.name ? '2px solid #dc2626' : '2px solid #e5e7eb', borderRadius: 6 }} />
            {formErrors.name && <span style={{ color: '#dc2626', fontSize: 12 }}>Required</span>}
          </div>
          <button type="submit" disabled={loading} style={{ padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
          </button>
        </form>
      )}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
          <th style={{ padding: 12, textAlign: 'left', fontWeight: 600, color: '#374151', fontSize: 14 }}>ID</th>
          <th style={{ padding: 12, textAlign: 'left', fontWeight: 600, color: '#374151', fontSize: 14 }}>Name</th>
          <th style={{ padding: 12, textAlign: 'right', fontWeight: 600, color: '#374151', fontSize: 14 }}>Actions</th>
        </tr></thead>
        <tbody>
          {categories.map(c => (
            <tr key={c.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: 12, color: '#374151', fontSize: 14 }}>{c.id}</td>
              <td style={{ padding: 12, color: '#374151', fontSize: 14 }}>{c.name}</td>
              <td style={{ padding: 12, textAlign: 'right' }}>
                <button onClick={() => { setEditingId(c.id); setFormData({ name: c.name }); setShowForm(true) }}
                  style={{ padding: '6px 12px', marginRight: 8, background: 'white', color: '#667eea', border: '1px solid #667eea', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                <button onClick={() => handleDelete(c.id)}
                  style={{ padding: '6px 12px', background: 'white', color: '#dc2626', border: '1px solid #dc2626', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ==================== TYPES SUB-TAB ====================
function TypesSubTab({ baseUrl }: { baseUrl: string }) {
  const [types, setTypes] = useState<{id: number, variety: string, categoryId: number, categoryName?: string}[]>([])
  const [categories, setCategories] = useState<{id: number, name: string}[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ variety: '', categoryId: '' })
  const [formErrors, setFormErrors] = useState<{[key: string]: boolean}>({})
  const [editingId, setEditingId] = useState<number | null>(null)

  useEffect(() => { loadTypes(); loadCategories() }, [])

  const loadTypes = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${baseUrl}/api/master-data/types`)
      setTypes(res.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const loadCategories = async () => {
    try { const res = await axios.get(`${baseUrl}/api/master-data/categories`); setCategories(res.data) }
    catch (e) { console.error(e) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errors: {[key: string]: boolean} = {}
    if (!formData.variety) errors.variety = true
    if (!formData.categoryId) errors.categoryId = true
    if (Object.keys(errors).length) { setFormErrors(errors); return }
    setLoading(true)
    try {
      if (editingId) {
        await axios.patch(`${baseUrl}/api/master-data/types/${editingId}`, { variety: formData.variety, categoryId: parseInt(formData.categoryId) })
      } else {
        await axios.post(`${baseUrl}/api/master-data/types`, { variety: formData.variety, categoryId: parseInt(formData.categoryId) })
      }
      setFormData({ variety: '', categoryId: '' }); setShowForm(false); setEditingId(null); loadTypes()
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this type?')) return
    try { await axios.delete(`${baseUrl}/api/master-data/types/${id}`); loadTypes() }
    catch (e) { console.error(e) }
  }

  return (
    <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ margin: 0, color: '#374151' }}>Types / Loại sản phẩm</h3>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ variety: '', categoryId: '' }) }}
          style={{ padding: '8px 16px', background: showForm ? '#9ca3af' : '#667eea', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
          {showForm ? 'Cancel' : '+ Add Type'}
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: 16, padding: 16, background: '#f9fafb', borderRadius: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Category <span style={{ color: '#dc2626' }}>*</span></label>
              <select value={formData.categoryId} onChange={e => { setFormData({ ...formData, categoryId: e.target.value }); setFormErrors({ ...formErrors, categoryId: false }) }}
                style={{ width: '100%', padding: '10px 14px', border: formErrors.categoryId ? '2px solid #dc2626' : '2px solid #e5e7eb', borderRadius: 6 }}>
                <option value="">-- Chọn danh mục --</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {formErrors.categoryId && <span style={{ color: '#dc2626', fontSize: 12 }}>Required</span>}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Variety <span style={{ color: '#dc2626' }}>*</span></label>
              <input type="text" value={formData.variety} onChange={e => { setFormData({ ...formData, variety: e.target.value }); setFormErrors({ ...formErrors, variety: false }) }}
                style={{ width: '100%', padding: '10px 14px', border: formErrors.variety ? '2px solid #dc2626' : '2px solid #e5e7eb', borderRadius: 6 }} placeholder="e.g., Jasmine, Basmati" />
              {formErrors.variety && <span style={{ color: '#dc2626', fontSize: 12 }}>Required</span>}
            </div>
          </div>
          <button type="submit" disabled={loading} style={{ marginTop: 16, padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
          </button>
        </form>
      )}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
          <th style={{ padding: 12, textAlign: 'left', fontWeight: 600, color: '#374151', fontSize: 14 }}>ID</th>
          <th style={{ padding: 12, textAlign: 'left', fontWeight: 600, color: '#374151', fontSize: 14 }}>Variety</th>
          <th style={{ padding: 12, textAlign: 'left', fontWeight: 600, color: '#374151', fontSize: 14 }}>Category</th>
          <th style={{ padding: 12, textAlign: 'right', fontWeight: 600, color: '#374151', fontSize: 14 }}>Actions</th>
        </tr></thead>
        <tbody>
          {types.map(t => (
            <tr key={t.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: 12, color: '#374151', fontSize: 14 }}>{t.id}</td>
              <td style={{ padding: 12, color: '#374151', fontSize: 14 }}>{t.variety}</td>
              <td style={{ padding: 12, color: '#6b7280', fontSize: 14 }}>{t.categoryName || '-'}</td>
              <td style={{ padding: 12, textAlign: 'right' }}>
                <button onClick={() => { setEditingId(t.id); setFormData({ variety: t.variety, categoryId: t.categoryId.toString() }); setShowForm(true) }}
                  style={{ padding: '6px 12px', marginRight: 8, background: 'white', color: '#667eea', border: '1px solid #667eea', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                <button onClick={() => handleDelete(t.id)}
                  style={{ padding: '6px 12px', background: 'white', color: '#dc2626', border: '1px solid #dc2626', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ==================== AGRICULTURE PRODUCTS SUB-TAB ====================
function AgricultureProductsSubTab({ baseUrl, onUpdate }: { baseUrl: string, onUpdate: () => void }) {
  const [products, setProducts] = useState<{id: number, name: string, imageUrl?: string, typeId: number, typeName?: string}[]>([])
  const [types, setTypes] = useState<{id: number, variety: string}[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', imageUrl: '', typeId: '' })
  const [formErrors, setFormErrors] = useState<{[key: string]: boolean}>({})
  const [editingId, setEditingId] = useState<number | null>(null)

  useEffect(() => { loadProducts(); loadTypes() }, [])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${baseUrl}/api/master-data/agriculture-products`)
      setProducts(res.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const loadTypes = async () => {
    try { const res = await axios.get(`${baseUrl}/api/master-data/types`); setTypes(res.data) }
    catch (e) { console.error(e) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errors: {[key: string]: boolean} = {}
    if (!formData.name) errors.name = true
    if (!formData.typeId) errors.typeId = true
    if (Object.keys(errors).length) { setFormErrors(errors); return }
    setLoading(true)
    try {
      if (editingId) {
        await axios.patch(`${baseUrl}/api/master-data/agriculture-products/${editingId}`, { name: formData.name, imageUrl: formData.imageUrl || undefined, typeId: parseInt(formData.typeId) })
      } else {
        await axios.post(`${baseUrl}/api/master-data/agriculture-products`, { name: formData.name, imageUrl: formData.imageUrl || undefined, typeId: parseInt(formData.typeId) })
      }
      setFormData({ name: '', imageUrl: '', typeId: '' }); setShowForm(false); setEditingId(null); loadProducts(); onUpdate()
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this product?')) return
    try { await axios.delete(`${baseUrl}/api/master-data/agriculture-products/${id}`); loadProducts(); onUpdate() }
    catch (e) { console.error(e) }
  }

  return (
    <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ margin: 0, color: '#374151' }}>Agriculture Products / Nông sản</h3>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ name: '', imageUrl: '', typeId: '' }) }}
          style={{ padding: '8px 16px', background: showForm ? '#9ca3af' : '#667eea', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
          {showForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: 16, padding: 16, background: '#f9fafb', borderRadius: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Type <span style={{ color: '#dc2626' }}>*</span></label>
              <select value={formData.typeId} onChange={e => { setFormData({ ...formData, typeId: e.target.value }); setFormErrors({ ...formErrors, typeId: false }) }}
                style={{ width: '100%', padding: '10px 14px', border: formErrors.typeId ? '2px solid #dc2626' : '2px solid #e5e7eb', borderRadius: 6 }}>
                <option value="">-- Chọn loại --</option>
                {types.map(t => <option key={t.id} value={t.id}>{t.variety}</option>)}
              </select>
              {formErrors.typeId && <span style={{ color: '#dc2626', fontSize: 12 }}>Required</span>}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Name <span style={{ color: '#dc2626' }}>*</span></label>
              <input type="text" value={formData.name} onChange={e => { setFormData({ ...formData, name: e.target.value }); setFormErrors({ ...formErrors, name: false }) }}
                style={{ width: '100%', padding: '10px 14px', border: formErrors.name ? '2px solid #dc2626' : '2px solid #e5e7eb', borderRadius: 6 }} placeholder="e.g., Gạo ST25" />
              {formErrors.name && <span style={{ color: '#dc2626', fontSize: 12 }}>Required</span>}
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Image URL</label>
              <input type="text" value={formData.imageUrl} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', border: '2px solid #e5e7eb', borderRadius: 6 }} placeholder="https://..." />
            </div>
          </div>
          <button type="submit" disabled={loading} style={{ marginTop: 16, padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
          </button>
        </form>
      )}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
          <th style={{ padding: 12, textAlign: 'left', fontWeight: 600, color: '#374151', fontSize: 14 }}>ID</th>
          <th style={{ padding: 12, textAlign: 'left', fontWeight: 600, color: '#374151', fontSize: 14 }}>Name</th>
          <th style={{ padding: 12, textAlign: 'left', fontWeight: 600, color: '#374151', fontSize: 14 }}>Type</th>
          <th style={{ padding: 12, textAlign: 'left', fontWeight: 600, color: '#374151', fontSize: 14 }}>Image</th>
          <th style={{ padding: 12, textAlign: 'right', fontWeight: 600, color: '#374151', fontSize: 14 }}>Actions</th>
        </tr></thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: 12, color: '#374151', fontSize: 14 }}>{p.id}</td>
              <td style={{ padding: 12, color: '#374151', fontSize: 14 }}>{p.name}</td>
              <td style={{ padding: 12, color: '#6b7280', fontSize: 14 }}>{p.typeName || '-'}</td>
              <td style={{ padding: 12, fontSize: 14 }}>
                {p.imageUrl ? (
                  <img 
                    src={p.imageUrl} 
                    alt={p.name} 
                    style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/50x50?text=No+Image' }}
                  />
                ) : <span style={{ color: '#9ca3af' }}>-</span>}
              </td>
              <td style={{ padding: 12, textAlign: 'right' }}>
                <button onClick={() => { setEditingId(p.id); setFormData({ name: p.name, imageUrl: p.imageUrl || '', typeId: p.typeId.toString() }); setShowForm(true) }}
                  style={{ padding: '6px 12px', marginRight: 8, background: 'white', color: '#667eea', border: '1px solid #667eea', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                <button onClick={() => handleDelete(p.id)}
                  style={{ padding: '6px 12px', background: 'white', color: '#dc2626', border: '1px solid #dc2626', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ==================== PROVINCES SUB-TAB ====================
function ProvincesSubTab({ baseUrl }: { baseUrl: string }) {
  const [provinces, setProvinces] = useState<Province[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<{ name: string; countryId: string; countryName: string }>({ name: '', countryId: '', countryName: '' })
  const [formErrors, setFormErrors] = useState<{[key: string]: boolean}>({})

  useEffect(() => { loadProvinces(); loadCountries() }, [])

  const loadProvinces = async () => { setLoading(true); try { const res = await axios.get(`${baseUrl}/api/products/provinces`); setProvinces(res.data) } catch (e) { console.error(e) } finally { setLoading(false) } }
  const loadCountries = async () => { try { const res = await axios.get(`${baseUrl}/api/products/countries`); setCountries(res.data) } catch (e) { console.error(e) } }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); const errors: {[key: string]: boolean} = {}; if (!formData.name) errors.name = true; if (!formData.countryId && !formData.countryName) errors.country = true; if (Object.keys(errors).length) { setFormErrors(errors); return }
    setLoading(true); try { const payload: any = { name: formData.name }; if (formData.countryId) payload.countryId = parseInt(formData.countryId); if (formData.countryName) payload.countryName = formData.countryName; await axios.post(`${baseUrl}/api/products/provinces`, payload); setFormData({ name: '', countryId: '', countryName: '' }); setShowForm(false); setFormErrors({}); loadProvinces() } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const handleDeleteProvince = async (id: number) => {
    if (!confirm('Delete this province?')) return
    setLoading(true)
    try { 
      await axios.delete(`${baseUrl}/api/products/provinces/${id}`)
      loadProvinces()
    } catch (e) { console.error(e) } 
    finally { setLoading(false) }
  }

  return (
    <div style={{ marginTop: 24 }}> 
      {/* HEADER + ACTION BAR (Single Line) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
           <h2 style={{ margin: 0, color: '#374151', fontSize: 24 }}>Provinces List</h2>
           <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: 14 }}>Manage provinces and countries locations</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setFormData({ name: '', countryId: '', countryName: '' }); setFormErrors({}) }}
          style={{ padding: '10px 20px', background: showForm ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, boxShadow: '0 2px 4px rgba(102,126,234,0.3)' }}>
          {showForm ? 'Cancel' : '+ Add Province'}
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: 24, padding: 24, background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Province Name <span style={{ color: '#dc2626' }}>*</span></label>
              <input type="text" value={formData.name} onChange={e => { setFormData({ ...formData, name: e.target.value }); setFormErrors({ ...formErrors, name: false }) }}
                style={{ width: '100%', padding: 12, border: formErrors.name ? '2px solid #dc2626' : '2px solid #e5e7eb', borderRadius: 8 }} placeholder="e.g., Lam Dong" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Country <span style={{ color: '#dc2626' }}>*</span></label>
              <select value={formData.countryId} onChange={e => { setFormData({ ...formData, countryId: e.target.value }); setFormErrors({ ...formErrors, country: false }) }}
                style={{ width: '100%', padding: 12, border: formErrors.country ? '2px solid #dc2626' : '2px solid #e5e7eb', borderRadius: 8, marginBottom: 8 }}>
                <option value="">-- Select Country --</option>
                {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input type="text" value={formData.countryName} onChange={e => { setFormData({ ...formData, countryName: e.target.value }); setFormErrors({ ...formErrors, country: false }) }}
                placeholder="Or type new country name..." style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8 }} />
            </div>
          </div>
          <button type="submit" disabled={loading} style={{ marginTop: 16, padding: '12px 24px', background: '#667eea', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
            {loading ? 'Saving...' : 'Create Province'}
          </button>
        </form>
      )}

      {/* TABLE */}
      <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
            <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>ID</th>
            <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Province Name</th>
            <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Country</th>
            <th style={{ padding: 16, textAlign: 'right', fontWeight: 600, color: '#374151' }}>Actions</th>
          </tr></thead>
          <tbody>
            {provinces.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: 16, color: '#374151', fontWeight: 600 }}>#{p.id}</td>
                <td style={{ padding: 16, color: '#374151' }}>{p.name}</td>
                <td style={{ padding: 16, color: '#6b7280' }}>{p.countryName}</td>
                <td style={{ padding: 16, textAlign: 'right' }}>
                  <button onClick={() => handleDeleteProvince(p.id)}
                    style={{ padding: '6px 12px', border: '1px solid #ef4444', color: '#ef4444', borderRadius: 6, background: 'white', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>
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

export default function AdminPage() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [loginError, setLoginError] = useState('')

  // Tab management
  const [activeTab, setActiveTab] = useState<'products' | 'provinces' | 'farms' | 'vendors' | 'processing' | 'logistics' | 'storage' | 'pricing'>('products')
  
  // Products sub-tab management
  const [masterSubTab, setMasterSubTab] = useState<'batches' | 'categories' | 'types' | 'agriculture-products'>('batches')

  // Product management state
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Lists for dropdowns
  const [farms, setFarms] = useState<Array<{id: number, name: string}>>([])
  const [agricultureProducts, setAgricultureProducts] = useState<Array<{id: number, name: string}>>([])
  const [types, setTypes] = useState<Array<{id: number, name: string, variety?: string}>>([])
  const [vendorProducts, setVendorProducts] = useState<Array<{id: number, productName: string, vendorName: string}>>([])

  const [formData, setFormData] = useState({
    variety: '',
    grade: '',
    harvestDate: '',
    farmId: '',
    agricultureProductId: '',
    productTypeId: '',
    vendorProductId: ''
  })

  // Form validation state
  const [formErrors, setFormErrors] = useState<{[key: string]: boolean}>({})

  // Vendor management state
  const [vendorsList, setVendorsList] = useState<Vendor[]>([])
  const [showVendorForm, setShowVendorForm] = useState(false)
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null)

  const [vendorFormData, setVendorFormData] = useState({
    tin: '',
    name: '',
    address: '',
    contactInfo: '',
    vendorType: '' as 'distributor' | 'retail' | '',
    distributorType: '',
    retailFormat: ''
  })

  const baseUrl = 'http://localhost:5000'

  // Country creation state (quick add)
  const [newCountryName, setNewCountryName] = useState('')
  const [creatingCountry, setCreatingCountry] = useState(false)
  const [createCountryError, setCreateCountryError] = useState('')

  // Check if user is already logged in (from sessionStorage)
  useEffect(() => {
    const savedAuth = sessionStorage.getItem('adminAuth')
    if (savedAuth === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      loadProducts()
      loadFarms()
      loadAgricultureProducts()
      loadTypes()
      loadVendorProducts()
    }
  }, [isAuthenticated])

  const loadFarms = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/products/farms`)
      setFarms(response.data)
    } catch (e: any) {
      console.error('Failed to load farms:', e)
    }
  }

  const loadAgricultureProducts = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/products/agriculture-products`)
      setAgricultureProducts(response.data)
    } catch (e: any) {
      console.error('Failed to load agriculture products:', e)
    }
  }

  const loadTypes = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/products/types`)
      setTypes(response.data)
    } catch (e: any) {
      console.error('Failed to load types:', e)
    }
  }

  const loadVendorProducts = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/pricing/vendor-products`)
      setVendorProducts(response.data)
    } catch (e: any) {
      console.error('Failed to load vendor products:', e)
    }
  }



  // Handle login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')

    // TODO: Replace with real API call to backend
    // const response = await axios.post(`${baseUrl}/api/auth/admin-login`, {
    //   username: loginForm.username,
    //   password: loginForm.password
    // })

    // Mock authentication - will be replaced with real DB check
    if (loginForm.username === MOCK_ADMIN.username && loginForm.password === MOCK_ADMIN.password) {
      setIsAuthenticated(true)
      sessionStorage.setItem('adminAuth', 'true')
      setLoginForm({ username: '', password: '' })
    } else {
      setLoginError('Invalid username or password')
    }
  }

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem('adminAuth')
    setProducts([])
  }

  const loadProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(`${baseUrl}/api/products`)
      // Map API response to frontend format
      const mappedProducts = response.data.map((item: any) => ({
        id: item.batchId?.toString() || item.id?.toString(),
        name: item.productName || item.name || 'Unknown Product',
        variety: item.variety || '-',
        grade: item.grade || '-',
        harvestDate: item.harvestDate ? new Date(item.harvestDate).toISOString().split('T')[0] : '',
        origin: item.farmName || '-',
        certifications: '-',
        description: '-',
        // Map additional IDs for editing
        farmId: item.farmId,
        agricultureProductId: item.agricultureProductId,
        vendorProductId: item.vendorProductId
      }))
      setProducts(mappedProducts)
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load products from database')
      console.error('API Error:', e)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields for new product
    if (!editingProduct) {
      const errors: {[key: string]: boolean} = {}
      if (!formData.farmId) errors.farmId = true
      if (!formData.agricultureProductId) errors.agricultureProductId = true
      
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors)
        return
      }
    }
    
    setLoading(true)
    setError(null)
    setFormErrors({})

    try {
      if (editingProduct) {
        // Update existing product - map frontend fields to backend format
        const updateData = {
          grade: formData.grade || undefined,
          harvestDate: formData.harvestDate || undefined,
          seedBatch: formData.variety || undefined,
        }
        await axios.patch(`${baseUrl}/api/products/${editingProduct.id}`, updateData)
      } else {
        // Create new product
        const createData = {
          qrCodeUrl: `QR_${Date.now()}`,
          farmId: parseInt(formData.farmId),
          agricultureProductId: parseInt(formData.agricultureProductId),
          harvestDate: formData.harvestDate,
          grade: formData.grade,
          seedBatch: formData.variety,
          vendorProductId: formData.vendorProductId ? parseInt(formData.vendorProductId) : undefined,
        }
        await axios.post(`${baseUrl}/api/products`, createData)
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
      // TODO: Replace with real API call
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
      variety: product.variety || '',
      grade: product.grade || '',
      harvestDate: product.harvestDate ? product.harvestDate.split('T')[0] : '',
      farmId: product.farmId?.toString() || '',
      agricultureProductId: product.agricultureProductId?.toString() || '',
      productTypeId: '',
      vendorProductId: product.vendorProductId?.toString() || ''
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      variety: '',
      grade: '',
      harvestDate: '',
      farmId: '',
      agricultureProductId: '',
      productTypeId: '',
      vendorProductId: ''
    })
    setEditingProduct(null)
    setShowForm(false)
    setFormErrors({})
  }

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          background: 'white',
          padding: 48,
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          width: '100%',
          maxWidth: 400
        }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={{
              fontSize: 32,
              fontWeight: 700,
              marginBottom: 8,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Admin Login
            </h1>
            <p style={{ color: '#6b7280', fontSize: 14 }}>
              Enter your credentials to access the admin panel
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: 'block',
                marginBottom: 8,
                fontWeight: 600,
                color: '#374151',
                fontSize: 14
              }}>
                Username
              </label>
              <input
                type="text"
                value={loginForm.username}
                onChange={e => setLoginForm({ ...loginForm, username: e.target.value })}
                required
                placeholder="Enter username"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 16,
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = '#667eea'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{
                display: 'block',
                marginBottom: 8,
                fontWeight: 600,
                color: '#374151',
                fontSize: 14
              }}>
                Password
              </label>
              <input
                type="password"
                value={loginForm.password}
                onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                required
                placeholder="Enter password"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 16,
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = '#667eea'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            {loginError && (
              <div style={{
                padding: 12,
                marginBottom: 20,
                background: '#fee2e2',
                border: '1px solid #fecaca',
                borderRadius: 8,
                color: '#b91c1c',
                fontSize: 14,
                textAlign: 'center'
              }}>
                {loginError}
              </div>
            )}

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '14px 24px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(102,126,234,0.4)',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Sign In
            </button>
          </form>

          <div style={{
            marginTop: 24,
            padding: 16,
            background: '#f3f4f6',
            borderRadius: 8,
            fontSize: 12,
            color: '#6b7280'
          }}>
            <strong>Demo Credentials:</strong><br />
            Username: admin<br />
            Password: admin123
          </div>

          <div style={{
            marginTop: 20,
            textAlign: 'center'
          }}>
            <a
              href="/"
              style={{
                color: '#667eea',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 500
              }}
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Admin Panel (after login)
  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: 24 }}>
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
              color: '#6b7280',
              textDecoration: 'none',
              fontWeight: 600,
              borderRadius: 8
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            Home
          </a>
          <span
            style={{
              padding: '8px 16px',
              color: '#667eea',
              fontWeight: 600,
              background: '#f3f4f6',
              borderRadius: 8
            }}
          >
            Admin Panel
          </span>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            background: 'white',
            color: '#dc2626',
            border: '2px solid #dc2626',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>

      {/* Tab Switcher */}
      <div style={{
        display: 'flex',
        gap: 16,
        marginBottom: 24,
        borderBottom: '2px solid #e5e7eb'
      }}>
        <button
          onClick={() => {
            setActiveTab('products')
            setShowForm(false)
          }}
          style={{
            padding: '12px 24px',
            background: activeTab === 'products' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
            color: activeTab === 'products' ? 'white' : '#6b7280',
            border: 'none',
            borderBottom: activeTab === 'products' ? '3px solid #667eea' : 'none',
            borderRadius: '8px 8px 0 0',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Products / Sản phẩm
        </button>
        <button
          onClick={() => {
            setActiveTab('farms')
            setShowForm(false)
          }}
          style={{
            padding: '12px 24px',
            background: activeTab === 'farms' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
            color: activeTab === 'farms' ? 'white' : '#6b7280',
            border: 'none',
            borderBottom: activeTab === 'farms' ? '3px solid #667eea' : 'none',
            borderRadius: '8px 8px 0 0',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Farms / Trang trại
        </button>
        <button
          onClick={() => {
            setActiveTab('provinces')
            setShowForm(false)
          }}
          style={{
            padding: '12px 24px',
            background: activeTab === 'provinces' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
            color: activeTab === 'provinces' ? 'white' : '#6b7280',
            border: 'none',
            borderBottom: activeTab === 'provinces' ? '3px solid #667eea' : 'none',
            borderRadius: '8px 8px 0 0',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Provinces / Tỉnh thành
        </button>
        <button
          onClick={() => {
            setActiveTab('vendors')
            setShowForm(false)
          }}
          style={{
            padding: '12px 24px',
            background: activeTab === 'vendors' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
            color: activeTab === 'vendors' ? 'white' : '#6b7280',
            border: 'none',
            borderBottom: activeTab === 'vendors' ? '3px solid #667eea' : 'none',
            borderRadius: '8px 8px 0 0',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Vendors / Nhà cung cấp
        </button>
        <button
          onClick={() => {
            setActiveTab('processing')
            setShowForm(false)
          }}
          style={{
            padding: '12px 24px',
            background: activeTab === 'processing' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
            color: activeTab === 'processing' ? 'white' : '#6b7280',
            border: 'none',
            borderBottom: activeTab === 'processing' ? '3px solid #667eea' : 'none',
            borderRadius: '8px 8px 0 0',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Processing / Chế biến
        </button>
        <button
          onClick={() => {
            setActiveTab('logistics')
            setShowForm(false)
          }}
          style={{
            padding: '12px 24px',
            background: activeTab === 'logistics' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
            color: activeTab === 'logistics' ? 'white' : '#6b7280',
            border: 'none',
            borderBottom: activeTab === 'logistics' ? '3px solid #667eea' : 'none',
            borderRadius: '8px 8px 0 0',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Logistics / Vận chuyển
        </button>
        <button
          onClick={() => {
            setActiveTab('storage')
            setShowForm(false)
          }}
          style={{
            padding: '12px 24px',
            background: activeTab === 'storage' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
            color: activeTab === 'storage' ? 'white' : '#6b7280',
            border: 'none',
            borderBottom: activeTab === 'storage' ? '3px solid #667eea' : 'none',
            borderRadius: '8px 8px 0 0',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Storage / Kho lưu trữ
        </button>
        <button
          onClick={() => {
            setActiveTab('pricing')
            setShowForm(false)
          }}
          style={{
            padding: '12px 24px',
            background: activeTab === 'pricing' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
            color: activeTab === 'pricing' ? 'white' : '#6b7280',
            border: 'none',
            borderBottom: activeTab === 'pricing' ? '3px solid #667eea' : 'none',
            borderRadius: '8px 8px 0 0',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Pricing / Giá cả
        </button>
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
          {activeTab === 'products' ? 'Product Information Management' : activeTab === 'farms' ? 'Farm Management' : activeTab === 'provinces' ? 'Provinces Management' : activeTab === 'vendors' ? 'Vendor Management' : activeTab === 'processing' ? 'Processing Management' : activeTab === 'logistics' ? 'Logistics Management' : activeTab === 'storage' ? 'Storage Management' : 'Pricing Management'}
        </h1>
        {activeTab === 'products' && (
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
        )}
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

      {/* Products Tab with Sub-tabs - Master Data Navigation */}
      {activeTab === 'products' && (
        <div style={{
          background: 'white',
          borderRadius: 12,
          marginBottom: 16,
          padding: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => setMasterSubTab('batches')} style={{ padding: '8px 12px', borderRadius: 8, border: masterSubTab === 'batches' ? '2px solid #667eea' : '1px solid #e5e7eb', background: masterSubTab === 'batches' ? '#eef2ff' : 'white', fontWeight: masterSubTab === 'batches' ? 600 : 500, cursor: 'pointer' }}>🌾 Batches</button>
            <button onClick={() => setMasterSubTab('categories')} style={{ padding: '8px 12px', borderRadius: 8, border: masterSubTab === 'categories' ? '2px solid #667eea' : '1px solid #e5e7eb', background: masterSubTab === 'categories' ? '#eef2ff' : 'white', fontWeight: masterSubTab === 'categories' ? 600 : 500, cursor: 'pointer' }}>📁 Categories</button>
            <button onClick={() => setMasterSubTab('types')} style={{ padding: '8px 12px', borderRadius: 8, border: masterSubTab === 'types' ? '2px solid #667eea' : '1px solid #e5e7eb', background: masterSubTab === 'types' ? '#eef2ff' : 'white', fontWeight: masterSubTab === 'types' ? 600 : 500, cursor: 'pointer' }}>🏷️ Types</button>
            <button onClick={() => setMasterSubTab('agriculture-products')} style={{ padding: '8px 12px', borderRadius: 8, border: masterSubTab === 'agriculture-products' ? '2px solid #667eea' : '1px solid #e5e7eb', background: masterSubTab === 'agriculture-products' ? '#eef2ff' : 'white', fontWeight: masterSubTab === 'agriculture-products' ? 600 : 500, cursor: 'pointer' }}>🥬 Agriculture Products</button>
          </div>

          {masterSubTab === 'batches' && (
            <button
              onClick={() => setShowForm(!showForm)}
              style={{
                padding: '12px 24px',
                background: showForm ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(102,126,234,0.35)'
              }}
            >
              {showForm ? 'Cancel' : '+ Add New Product'}
            </button>
          )}
        </div>
      )}

      {/* Product Form - Only show in Batches sub-tab */}
      {activeTab === 'products' && masterSubTab === 'batches' && showForm && (
        <div style={{
          background: 'white',
          padding: 24,
          borderRadius: 12,
          marginBottom: 24,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginTop: 0, color: '#374151' }}>
            {editingProduct ? 'Edit Product Information' : 'Add New Product'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Farm Selection - Required */}
              {!editingProduct && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                    Farm / Trang trại <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <select
                    value={formData.farmId}
                    onChange={e => {
                      setFormData({ ...formData, farmId: e.target.value })
                      if (e.target.value) setFormErrors({ ...formErrors, farmId: false })
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: formErrors.farmId ? '2px solid #dc2626' : '2px solid #e5e7eb',
                      borderRadius: 8,
                      fontSize: 16,
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="">-- Chọn trang trại --</option>
                    {farms.map(farm => (
                      <option key={farm.id} value={farm.id}>{farm.name}</option>
                    ))}
                  </select>
                  {formErrors.farmId && (
                    <span style={{ color: '#dc2626', fontSize: 12 }}>Vui lòng chọn Farm</span>
                  )}
                </div>
              )}

              {/* Agriculture Product Selection - Required */}
              {!editingProduct && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                    Agriculture Product / Sản phẩm nông nghiệp <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <select
                    value={formData.agricultureProductId}
                    onChange={e => {
                      setFormData({ ...formData, agricultureProductId: e.target.value })
                      if (e.target.value) setFormErrors({ ...formErrors, agricultureProductId: false })
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: formErrors.agricultureProductId ? '2px solid #dc2626' : '2px solid #e5e7eb',
                      borderRadius: 8,
                      fontSize: 16,
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="">-- Chọn sản phẩm --</option>
                    {agricultureProducts.map(product => (
                      <option key={product.id} value={product.id}>{product.name}</option>
                    ))}
                  </select>
                  {formErrors.agricultureProductId && (
                    <span style={{ color: '#dc2626', fontSize: 12 }}>Vui lòng chọn Agriculture Product</span>
                  )}
                </div>
              )}

              {/* Product Type Selection */}
              {!editingProduct && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                    Product Type / Loại sản phẩm
                  </label>
                  <select
                    value={formData.productTypeId}
                    onChange={e => {
                      setFormData({ ...formData, productTypeId: e.target.value })
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: 8,
                      fontSize: 16,
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="">-- Chọn loại --</option>
                    {types.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name} {type.variety ? `(${type.variety})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Vendor Product Selection */}
              {!editingProduct && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                    Vendor Product / Sản phẩm nhà cung cấp
                  </label>
                  <select
                    value={formData.vendorProductId}
                    onChange={e => {
                      setFormData({ ...formData, vendorProductId: e.target.value })
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: 8,
                      fontSize: 16,
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="">-- Chọn vendor product --</option>
                    {vendorProducts.map(vp => (
                      <option key={vp.id} value={vp.id}>
                        {vp.productName} - {vp.vendorName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Variety */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                  Variety / Giống
                </label>
                <input
                  type="text"
                  value={formData.variety}
                  onChange={e => setFormData({ ...formData, variety: e.target.value })}
                  placeholder="e.g., Jasmine, Basmati"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: 8,
                    fontSize: 16
                  }}
                />
              </div>

              {/* Grade */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                  Grade / Phẩm cấp
                </label>
                <select
                  value={formData.grade}
                  onChange={e => setFormData({ ...formData, grade: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: 8,
                    fontSize: 16
                  }}
                >
                  <option value="">Select Grade</option>
                  <option value="A">Grade A</option>
                  <option value="B">Grade B</option>
                  <option value="C">Grade C</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>

              {/* Harvest Date */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                  Harvest Date / Ngày thu hoạch
                </label>
                <input
                  type="date"
                  value={formData.harvestDate}
                  onChange={e => setFormData({ ...formData, harvestDate: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: 8,
                    fontSize: 16
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
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

      {/* Products List - Only show in Batches sub-tab */}
      {activeTab === 'products' && masterSubTab === 'batches' && (
        <div style={{
          background: 'white',
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: 12, textAlign: 'left', fontWeight: 600, color: '#374151', fontSize: 14 }}>Product Name</th>
              <th style={{ padding: 12, textAlign: 'left', fontWeight: 600, color: '#374151', fontSize: 14 }}>Variety</th>
              <th style={{ padding: 12, textAlign: 'left', fontWeight: 600, color: '#374151', fontSize: 14 }}>Grade</th>
              <th style={{ padding: 12, textAlign: 'left', fontWeight: 600, color: '#374151', fontSize: 14 }}>Harvest Date</th>
              <th style={{ padding: 12, textAlign: 'center', fontWeight: 600, color: '#374151', fontSize: 14 }}>Actions</th>
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
                  key={product.id}
                  style={{
                    borderBottom: index < products.length - 1 ? '1px solid #e5e7eb' : 'none'
                  }}
                >
                  <td style={{ padding: 12, fontWeight: 500, color: '#374151', fontSize: 14 }}>{product.name}</td>
                  <td style={{ padding: 12, color: '#6b7280', fontSize: 14 }}>{product.variety || '-'}</td>
                  <td style={{ padding: 12, fontSize: 14 }}>
                    {product.grade ? (
                      <span style={{
                        padding: '4px 12px',
                        background: product.grade === 'A' ? '#dcfce7' : product.grade === 'Premium' ? '#fef3c7' : '#e5e7eb',
                        color: product.grade === 'A' ? '#166534' : product.grade === 'Premium' ? '#92400e' : '#374151',
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 500
                      }}>
                        {product.grade}
                      </span>
                    ) : (
                      <span style={{ color: '#6b7280' }}>-</span>
                    )}
                  </td>
                  <td style={{ padding: 12, color: '#6b7280', fontSize: 14 }}>
                    {product.harvestDate ? new Date(product.harvestDate).toLocaleDateString('vi-VN') : '-'}
                  </td>
                  <td style={{ padding: 12, textAlign: 'center' }}>
                    <button
                      onClick={() => handleEdit(product)}
                      style={{
                        padding: '6px 12px',
                        marginRight: 8,
                        background: 'white',
                        color: '#667eea',
                        border: '1px solid #667eea',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      style={{
                        padding: '6px 12px',
                        background: 'white',
                        color: '#dc2626',
                        border: '1px solid #dc2626',
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
              ))
            )}
          </tbody>
        </table>
      </div>
      )}

      {/* Master Data Sub-tabs Content */}
      {activeTab === 'products' && masterSubTab === 'categories' && (<CategoriesSubTab baseUrl={baseUrl} />)}
      {activeTab === 'products' && masterSubTab === 'types' && (<TypesSubTab baseUrl={baseUrl} />)}
      {activeTab === 'products' && masterSubTab === 'agriculture-products' && (<AgricultureProductsSubTab baseUrl={baseUrl} onUpdate={loadAgricultureProducts} />)}

      {/* Farms Tab - Full featured component with certifications */}
      {activeTab === 'farms' && <FarmsTab />}

      {/* Provinces Tab */}
      {activeTab === 'provinces' && (<ProvincesSubTab baseUrl={baseUrl} />)}

      {/* Vendors Tab */}
      {activeTab === 'vendors' && <VendorsTab />}

      {/* Processing Tab */}
      {activeTab === 'processing' && <ProcessingTab />}

      {/* Logistics Tab */}
      {activeTab === 'logistics' && <LogisticsTab />}

      {/* Storage Tab */}
      {activeTab === 'storage' && <StorageTab />}

      {/* Pricing Tab */}
      {activeTab === 'pricing' && <PricingTab />}
    </div>
  )
}
