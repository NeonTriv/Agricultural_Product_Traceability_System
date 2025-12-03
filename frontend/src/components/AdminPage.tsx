import { useEffect, useState } from 'react'
import axios from 'axios'

interface Product {
  id: string
  name: string
  variety?: string
  grade?: string
  harvestDate?: string
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

// Mock admin credentials - Ready to connect to DB later
const MOCK_ADMIN = {
  username: 'admin',
  password: 'admin123'
}

export default function AdminPage() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [loginError, setLoginError] = useState('')

  // Tab management
  const [activeTab, setActiveTab] = useState<'products' | 'farms'>('products')

  // Product management state
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Lists for dropdowns
  const [farms, setFarms] = useState<Array<{id: number, name: string}>>([])
  const [agricultureProducts, setAgricultureProducts] = useState<Array<{id: number, name: string}>>([])

  const [formData, setFormData] = useState({
    name: '',
    variety: '',
    grade: '',
    harvestDate: '',
    farmId: '',
    agricultureProductId: ''
  })

  // Farm management state
  const [farmsList, setFarmsList] = useState<Farm[]>([])
  const [provinces, setProvinces] = useState<Province[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [showFarmForm, setShowFarmForm] = useState(false)
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null)

  const [farmFormData, setFarmFormData] = useState({
    name: '',
    ownerName: '',
    contactInfo: '',
    longitude: '',
    latitude: '',
    provinceId: ''
  })

  const baseUrl = 'http://localhost:5000'

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
      loadProvinces()
      loadCountries()
      loadFarmsList()
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

  const loadProvinces = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/products/provinces`)
      setProvinces(response.data)
    } catch (e: any) {
      console.error('Failed to load provinces:', e)
    }
  }

  const loadCountries = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/products/countries`)
      setCountries(response.data)
    } catch (e: any) {
      console.error('Failed to load countries:', e)
    }
  }

  const loadFarmsList = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(`${baseUrl}/api/farms`)
      setFarmsList(response.data)
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load farms')
      console.error('API Error:', e)
      setFarmsList([])
    } finally {
      setLoading(false)
    }
  }

  const handleFarmSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const createData = {
        name: farmFormData.name,
        ownerName: farmFormData.ownerName || undefined,
        contactInfo: farmFormData.contactInfo || undefined,
        longitude: farmFormData.longitude ? parseFloat(farmFormData.longitude) : undefined,
        latitude: farmFormData.latitude ? parseFloat(farmFormData.latitude) : undefined,
        provinceId: parseInt(farmFormData.provinceId),
      }
      await axios.post(`${baseUrl}/api/farms`, createData)
      await loadFarmsList()
      resetFarmForm()
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to create farm')
    } finally {
      setLoading(false)
    }
  }

  const resetFarmForm = () => {
    setFarmFormData({
      name: '',
      ownerName: '',
      contactInfo: '',
      longitude: '',
      latitude: '',
      provinceId: ''
    })
    setSelectedProvince(null)
    setShowFarmForm(false)
  }

  const handleProvinceChange = (provinceId: string) => {
    setFarmFormData({ ...farmFormData, provinceId })
    const province = provinces.find(p => p.id === parseInt(provinceId))
    setSelectedProvince(province || null)
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
        description: '-'
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
    setLoading(true)
    setError(null)

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
      name: product.name,
      variety: product.variety || '',
      grade: product.grade || '',
      harvestDate: product.harvestDate || '',
      farmId: '',
      agricultureProductId: ''
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      variety: '',
      grade: '',
      harvestDate: '',
      farmId: '',
      agricultureProductId: ''
    })
    setEditingProduct(null)
    setShowForm(false)
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
            setShowFarmForm(false)
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
            setShowFarmForm(false)
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
          {activeTab === 'products' ? 'Product Information Management' : 'Farm Management'}
        </h1>
        <button
          onClick={() => activeTab === 'products' ? setShowForm(!showForm) : setShowFarmForm(!showFarmForm)}
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
          {activeTab === 'products'
            ? (showForm ? 'Cancel' : '+ Add New Product')
            : (showFarmForm ? 'Cancel' : '+ Add New Farm')}
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

      {/* Product Form */}
      {activeTab === 'products' && showForm && (
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
              {/* Product Name */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., Organic Jasmine Rice"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: 8,
                    fontSize: 16
                  }}
                />
              </div>

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

              {/* Farm and Product Selection - Only show when creating */}
              {!editingProduct && (
                <>
                  {/* Farm Selection */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                      Farm / Trang trại *
                    </label>
                    <select
                      value={formData.farmId}
                      onChange={e => setFormData({ ...formData, farmId: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: 8,
                        fontSize: 16,
                        backgroundColor: 'white'
                      }}
                    >
                      <option value="">Select a farm...</option>
                      {farms.map(farm => (
                        <option key={farm.id} value={farm.id}>{farm.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Agriculture Product Selection */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                      Product Type / Loại sản phẩm *
                    </label>
                    <select
                      value={formData.agricultureProductId}
                      onChange={e => setFormData({ ...formData, agricultureProductId: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: 8,
                        fontSize: 16,
                        backgroundColor: 'white'
                      }}
                    >
                      <option value="">Select a product type...</option>
                      {agricultureProducts.map(product => (
                        <option key={product.id} value={product.id}>{product.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
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

      {/* Products List */}
      {activeTab === 'products' && (
        <div style={{
          background: 'white',
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Product Name</th>
              <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Variety</th>
              <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Grade</th>
              <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Harvest Date</th>
              <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Expiration</th>
              <th style={{ padding: 16, textAlign: 'right', fontWeight: 600, color: '#374151' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && !products.length ? (
              <tr>
                <td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>
                  Loading products...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>
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
                  <td style={{ padding: 16, fontWeight: 600 }}>{product.name}</td>
                  <td style={{ padding: 16, color: '#6b7280' }}>{product.variety || '-'}</td>
                  <td style={{ padding: 16 }}>
                    {product.grade && (
                      <span style={{
                        padding: '4px 12px',
                        background: product.grade === 'A' ? '#dcfce7' : product.grade === 'Premium' ? '#fef3c7' : '#e5e7eb',
                        color: product.grade === 'A' ? '#166534' : product.grade === 'Premium' ? '#92400e' : '#374151',
                        borderRadius: 6,
                        fontSize: 14,
                        fontWeight: 600
                      }}>
                        {product.grade}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: 16, color: '#6b7280' }}>
                    {product.harvestDate ? new Date(product.harvestDate).toLocaleDateString('vi-VN') : '-'}
                  </td>
                  <td style={{ padding: 16, color: '#6b7280' }}>
                    {product.expirationDate ? new Date(product.expirationDate).toLocaleDateString('vi-VN') : '-'}
                  </td>
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
                      onClick={() => handleDelete(product.id)}
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
      )}

      {/* Farm Form */}
      {activeTab === 'farms' && showFarmForm && (
        <div style={{
          background: 'white',
          padding: 24,
          borderRadius: 12,
          marginBottom: 24,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginTop: 0, color: '#374151' }}>Add New Farm</h2>
          <form onSubmit={handleFarmSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Farm Name */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                  Farm Name / Tên trang trại *
                </label>
                <input
                  type="text"
                  value={farmFormData.name}
                  onChange={e => setFarmFormData({ ...farmFormData, name: e.target.value })}
                  required
                  placeholder="e.g., Green Valley Farm"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: 8,
                    fontSize: 16
                  }}
                />
              </div>

              {/* Owner Name */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                  Owner Name / Chủ trang trại
                </label>
                <input
                  type="text"
                  value={farmFormData.ownerName}
                  onChange={e => setFarmFormData({ ...farmFormData, ownerName: e.target.value })}
                  placeholder="e.g., Nguyen Van A"
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
                  Contact Info / Thông tin liên hệ
                </label>
                <input
                  type="text"
                  value={farmFormData.contactInfo}
                  onChange={e => setFarmFormData({ ...farmFormData, contactInfo: e.target.value })}
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

              {/* Province Selection */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                  Province / Tỉnh thành *
                </label>
                <select
                  value={farmFormData.provinceId}
                  onChange={e => handleProvinceChange(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: 8,
                    fontSize: 16
                  }}
                >
                  <option value="">Select a province...</option>
                  {provinces.map(province => (
                    <option key={province.id} value={province.id}>
                      {province.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Country (Auto-filled) */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                  Country / Quốc gia
                </label>
                <input
                  type="text"
                  value={selectedProvince?.countryName || ''}
                  disabled
                  placeholder="Auto-filled from province"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: 8,
                    fontSize: 16,
                    background: '#f9fafb',
                    color: '#6b7280'
                  }}
                />
              </div>

              {/* Longitude */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                  Longitude / Kinh độ
                </label>
                <input
                  type="number"
                  step="any"
                  value={farmFormData.longitude}
                  onChange={e => setFarmFormData({ ...farmFormData, longitude: e.target.value })}
                  placeholder="e.g., 105.8342"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: 8,
                    fontSize: 16
                  }}
                />
              </div>

              {/* Latitude */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                  Latitude / Vĩ độ
                </label>
                <input
                  type="number"
                  step="any"
                  value={farmFormData.latitude}
                  onChange={e => setFarmFormData({ ...farmFormData, latitude: e.target.value })}
                  placeholder="e.g., 21.0285"
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

            <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
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
                {loading ? 'Creating...' : 'Create Farm'}
              </button>
              <button
                type="button"
                onClick={resetFarmForm}
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

      {/* Farms List */}
      {activeTab === 'farms' && (
        <div style={{
          background: 'white',
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Farm Name</th>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Owner</th>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Contact</th>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Province</th>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Country</th>
              </tr>
            </thead>
            <tbody>
              {loading && !farmsList.length ? (
                <tr>
                  <td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>
                    Loading farms...
                  </td>
                </tr>
              ) : farmsList.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>
                    No farms found. Add your first farm!
                  </td>
                </tr>
              ) : (
                farmsList.map((farm, index) => (
                  <tr
                    key={farm.id}
                    style={{
                      borderBottom: index < farmsList.length - 1 ? '1px solid #e5e7eb' : 'none'
                    }}
                  >
                    <td style={{ padding: 16, fontWeight: 600 }}>{farm.name}</td>
                    <td style={{ padding: 16, color: '#6b7280' }}>{farm.ownerName || '-'}</td>
                    <td style={{ padding: 16, color: '#6b7280' }}>{farm.contactInfo || '-'}</td>
                    <td style={{ padding: 16, color: '#6b7280' }}>{farm.provinceName || '-'}</td>
                    <td style={{ padding: 16, color: '#6b7280' }}>{farm.countryName || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
