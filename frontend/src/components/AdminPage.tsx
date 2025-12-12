import { useEffect, useState } from 'react'
import axios from 'axios'
import ProductManagementTab from './BatchesTab'
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

// ==================== PROVINCES SUB-TAB ====================
function ProvincesSubTab({ baseUrl }: { baseUrl: string }) {
  const [provinces, setProvinces] = useState<Province[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingProvinceId, setEditingProvinceId] = useState<number | null>(null)
  const [formData, setFormData] = useState<{ name: string; countryId: string; countryName: string }>({ name: '', countryId: '', countryName: '' })
  const [formErrors, setFormErrors] = useState<{[key: string]: boolean}>({})
  const [errorModal, setErrorModal] = useState<{ show: boolean; title: string; message: string }>({ show: false, title: '', message: '' })
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: number | null }>({ show: false, id: null })

  useEffect(() => { loadProvinces(); loadCountries() }, [])

  const loadProvinces = async () => { setLoading(true); try { const res = await axios.get(`${baseUrl}/api/products/provinces`); setProvinces(res.data) } catch (e) { console.error(e) } finally { setLoading(false) } }
  const loadCountries = async () => { try { const res = await axios.get(`${baseUrl}/api/products/countries`); setCountries(res.data) } catch (e) { console.error(e) } }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); const errors: {[key: string]: boolean} = {}; if (!formData.name) errors.name = true; if (!formData.countryId && !formData.countryName) errors.country = true; if (Object.keys(errors).length) { setFormErrors(errors); return }
    setLoading(true); try { 
      const payload: any = { name: formData.name }; 
      if (formData.countryId) payload.countryId = parseInt(formData.countryId); 
      if (formData.countryName) payload.countryName = formData.countryName; 
      if (editingProvinceId) {
        await axios.patch(`${baseUrl}/api/products/provinces/${editingProvinceId}`, payload)
      } else {
        await axios.post(`${baseUrl}/api/products/provinces`, payload)
      }
      setFormData({ name: '', countryId: '', countryName: '' }); setShowForm(false); setFormErrors({}); setEditingProvinceId(null); loadProvinces() 
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const handleEditProvince = (p: Province) => {
    setEditingProvinceId(p.id)
    setFormData({ name: p.name, countryId: p.countryId.toString(), countryName: '' })
    setShowForm(true)
    setFormErrors({})
  }

  const handleDeleteProvince = async (id: number) => {
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
      setErrorModal({
        show: true,
        title: '⚠️ Cannot Delete Province',
        message: msg
      })
      setDeleteConfirm({ show: false, id: null })
    } finally { 
      setLoading(false) 
    }
  }

  return (
    <div style={{ marginTop: 0 }}> 
      {/* HEADER ROW: Title & Button aligned on same line */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
           <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
             Provinces Management
           </h2>
           <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: 14 }}>Manage provinces and countries locations</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setFormData({ name: '', countryId: '', countryName: '' }); setFormErrors({}); setEditingProvinceId(null) }}
          style={{ padding: '12px 24px', background: showForm ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(102,126,234,0.3)' }}>
          {showForm ? 'Cancel' : editingProvinceId ? 'Cancel Edit' : '+ Add Province'}
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: 24, padding: 24, background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#374151' }}>{editingProvinceId ? 'Edit Province' : 'New Province'}</h3>
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
              {!editingProvinceId && <input type="text" value={formData.countryName} onChange={e => { setFormData({ ...formData, countryName: e.target.value }); setFormErrors({ ...formErrors, country: false }) }}
                placeholder="Or type new country name..." style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8 }} />}
            </div>
          </div>
          <button type="submit" disabled={loading} style={{ marginTop: 16, padding: '12px 24px', background: '#667eea', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
            {loading ? 'Saving...' : editingProvinceId ? 'Update Province' : 'Create Province'}
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
                  <button onClick={() => handleEditProvince(p)}
                    style={{ marginRight: 8, padding: '6px 12px', border: '1px solid #3b82f6', color: '#3b82f6', borderRadius: 6, background: 'white', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>
                    Edit
                  </button>
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

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirm.show && (
        <div onClick={() => setDeleteConfirm({ show: false, id: null })} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'white', padding: 32, borderRadius: 16, maxWidth: 400, width: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
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

      {/* ERROR MODAL */}
      {errorModal.show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: 12,
            padding: 32,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            maxWidth: 500,
            textAlign: 'left'
          }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: 20, fontWeight: 700 }}>
              {errorModal.title}
            </h3>
            <p style={{ margin: '0 0 24px 0', color: '#6b7280', fontSize: 15, lineHeight: '1.6' }}>
              {errorModal.message}
            </p>
            <button onClick={() => setErrorModal({ show: false, title: '', message: '' })}
              style={{
                width: '100%',
                padding: '10px 24px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 14
              }}>
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminPage() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [loginError, setLoginError] = useState('')

  // Tab management
  const [activeTab, setActiveTab] = useState<'batches' | 'provinces' | 'farms' | 'vendors' | 'processing' | 'logistics' | 'storage' | 'pricing'>('batches')

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
            setActiveTab('batches')
            setShowForm(false)
          }}
          style={{
            padding: '12px 24px',
            background: activeTab === 'batches' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
            color: activeTab === 'batches' ? 'white' : '#6b7280',
            border: 'none',
            borderBottom: activeTab === 'batches' ? '3px solid #667eea' : 'none',
            borderRadius: '8px 8px 0 0',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Batches / Lô hàng
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

      {/* Batches Tab - Super Form for complete product management */}
      {activeTab === 'batches' && <ProductManagementTab />}

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
