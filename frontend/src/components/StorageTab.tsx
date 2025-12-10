import React, { useEffect, useState } from 'react'
import axios from 'axios'

const baseUrl = 'http://localhost:5000'

// --- Interfaces ---
interface Warehouse {
  id: number
  capacity?: number
  storeCondition?: string
  addressDetail: string
  longitude?: number
  latitude?: number
  provinceId: number
  provinceName?: string
  countryName?: string
  countryId?: number // Frontend helper
  storedInCount?: number
}

interface StoredIn {
  batchId: number
  warehouseId: number
  quantity: number
  startDate?: string
  endDate?: string
  batchQrCode?: string
  productName?: string
  warehouseAddress?: string
}

interface Batch {
  id: number
  qrCodeUrl?: string
  productName?: string
  grade?: string
}

interface Province { id: number; name: string; countryId: number }
interface Country { id: number; name: string }

const tabButtonStyle = (active: boolean) => ({
  padding: '8px 16px', borderRadius: 8, border: active ? '2px solid #667eea' : '1px solid #e5e7eb',
  background: active ? '#eef2ff' : 'white', color: active ? '#667eea' : '#6b7280',
  fontSize: 14, fontWeight: active ? 600 : 500, cursor: 'pointer', transition: 'all 0.2s', marginRight: 8
})

export default function StorageTab() {
  const [subTab, setSubTab] = useState<'warehouses' | 'storedIn'>('warehouses')

  // --- Data State ---
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [storedInList, setStoredInList] = useState<StoredIn[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [provinces, setProvinces] = useState<Province[]>([])
  const [countries, setCountries] = useState<Country[]>([])

  // --- Form State: Warehouse ---
  const [showWarehouseForm, setShowWarehouseForm] = useState(false)
  const [warehouseFormData, setWarehouseFormData] = useState({
    id: '',
    capacity: '',
    storeCondition: '',
    addressDetail: '',
    longitude: '',
    latitude: '',
    countryId: '', // Added for cascading logic
    provinceId: ''
  })
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null)

  // --- Form State: Stored In ---
  const [showStoredInForm, setShowStoredInForm] = useState(false)
  const [storedInFormData, setStoredInFormData] = useState({ batchId: '', warehouseId: '', quantity: '', startDate: '', endDate: '' })
  const [editingStoredIn, setEditingStoredIn] = useState<StoredIn | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // --- Load Data ---
  useEffect(() => {
    if (subTab === 'warehouses') { fetchWarehouses(); fetchLocations() }
    else { fetchStoredIn(); fetchBatches(); fetchWarehouses() }
  }, [subTab])

  const fetchWarehouses = async () => { setLoading(true); try { const res = await axios.get(`${baseUrl}/api/storage/warehouses`); setWarehouses(res.data); setError('') } catch (err: any) { setError(err.response?.data?.message || err.message) } finally { setLoading(false) } }
  const fetchStoredIn = async () => { setLoading(true); try { const res = await axios.get(`${baseUrl}/api/storage/stored-in`); setStoredInList(res.data); setError('') } catch (err: any) { setError(err.response?.data?.message || err.message) } finally { setLoading(false) } }
  const fetchBatches = async () => { try { const res = await axios.get(`${baseUrl}/api/products/batches`); setBatches(res.data) } catch (err) { console.error(err) } }
  
  const fetchLocations = async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        axios.get(`${baseUrl}/api/products/provinces`),
        axios.get(`${baseUrl}/api/products/countries`)
      ])
      setProvinces(pRes.data)
      setCountries(cRes.data)
    } catch (e) { console.error(e) }
  }

  // --- Handlers ---
  const handleEditClick = (wh: Warehouse) => {
    setEditingWarehouse(wh)
    
    // Auto-detect Country from Province ID
    const prov = provinces.find(p => p.id === wh.provinceId)
    const countryId = prov ? prov.countryId.toString() : ''

    setWarehouseFormData({
      id: wh.id.toString(),
      capacity: wh.capacity?.toString() || '',
      storeCondition: wh.storeCondition || '',
      addressDetail: wh.addressDetail,
      longitude: wh.longitude?.toString() || '',
      latitude: wh.latitude?.toString() || '',
      countryId: countryId,
      provinceId: wh.provinceId.toString()
    })
    setShowWarehouseForm(true)
  }

  const handleWarehouseSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try {
      const payload = {
        ...warehouseFormData,
        id: parseInt(warehouseFormData.id),
        capacity: warehouseFormData.capacity ? parseFloat(warehouseFormData.capacity) : undefined,
        longitude: warehouseFormData.longitude ? parseFloat(warehouseFormData.longitude) : undefined,
        latitude: warehouseFormData.latitude ? parseFloat(warehouseFormData.latitude) : undefined,
        provinceId: parseInt(warehouseFormData.provinceId)
      }
      if (editingWarehouse) await axios.patch(`${baseUrl}/api/storage/warehouses/${editingWarehouse.id}`, payload)
      else await axios.post(`${baseUrl}/api/storage/warehouses`, payload)
      
      setShowWarehouseForm(false); setEditingWarehouse(null);
      setWarehouseFormData({ id: '', capacity: '', storeCondition: '', addressDetail: '', longitude: '', latitude: '', countryId: '', provinceId: '' })
      fetchWarehouses()
    } catch (err: any) { setError(err.response?.data?.message || err.message) } finally { setLoading(false) }
  }

  const handleDeleteWarehouse = async (id: number) => {
    if (!confirm('Are you sure you want to delete this warehouse?')) return
    setLoading(true)
    try {
      await axios.delete(`${baseUrl}/api/storage/warehouses/${id}`)
      fetchWarehouses()
    } catch (err: any) { setError(err.response?.data?.message || err.message) } finally { setLoading(false) }
  }

  const handleStoredInSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try {
      const payload = { batchId: parseInt(storedInFormData.batchId), warehouseId: parseInt(storedInFormData.warehouseId), quantity: parseFloat(storedInFormData.quantity), startDate: storedInFormData.startDate || undefined, endDate: storedInFormData.endDate || undefined }
      if (editingStoredIn) await axios.patch(`${baseUrl}/api/storage/stored-in/${editingStoredIn.batchId}/${editingStoredIn.warehouseId}`, payload)
      else await axios.post(`${baseUrl}/api/storage/stored-in`, payload)
      
      setShowStoredInForm(false); setEditingStoredIn(null); setStoredInFormData({ batchId: '', warehouseId: '', quantity: '', startDate: '', endDate: '' }); fetchStoredIn()
    } catch (err: any) { setError(err.response?.data?.message || err.message) } finally { setLoading(false) }
  }

  const handleDeleteStoredIn = async (batchId: number, warehouseId: number) => {
    if (!confirm('Are you sure you want to delete this stored item?')) return
    setLoading(true)
    try {
      await axios.delete(`${baseUrl}/api/storage/stored-in/${batchId}/${warehouseId}`)
      fetchStoredIn()
    } catch (err: any) { setError(err.response?.data?.message || err.message) } finally { setLoading(false) }
  }

  const resetForms = () => { setShowWarehouseForm(false); setShowStoredInForm(false) }

  // Filter provinces by selected country
  const filteredProvinces = provinces.filter(p => p.countryId.toString() === warehouseFormData.countryId)

  return (
    <div>
      <div style={{ display: 'flex', marginBottom: 24, background: 'white', padding: '12px', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <button onClick={() => { setSubTab('warehouses'); resetForms() }} style={tabButtonStyle(subTab === 'warehouses')}>🏭 Warehouses</button>
        <button onClick={() => { setSubTab('storedIn'); resetForms() }} style={tabButtonStyle(subTab === 'storedIn')}>📦 Stored Items</button>
      </div>

      {error && <div style={{ padding: 16, marginBottom: 24, background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 8, color: '#b91c1c' }}>Error: {error}</div>}

      {subTab === 'warehouses' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
               <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#374151' }}>Warehouse List</h3>
               <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: 13 }}>Storage facilities management</p>
            </div>
            <button onClick={() => { setShowWarehouseForm(!showWarehouseForm); setEditingWarehouse(null); setWarehouseFormData({ id: '', capacity: '', storeCondition: '', addressDetail: '', longitude: '', latitude: '', countryId: '', provinceId: '' }) }}
              style={{ padding: '10px 20px', background: showWarehouseForm ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, boxShadow: '0 2px 4px rgba(102,126,234,0.35)' }}>
              {showWarehouseForm ? 'Cancel' : '+ Add Warehouse'}
            </button>
          </div>

          {showWarehouseForm && (
            <form onSubmit={handleWarehouseSubmit} style={{ background: 'white', padding: 24, borderRadius: 12, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div><label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>ID *</label><input type="number" style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8 }} value={warehouseFormData.id} onChange={e => setWarehouseFormData({ ...warehouseFormData, id: e.target.value })} disabled={!!editingWarehouse} required /></div>
                
                {/* COUNTRY SELECT */}
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Country</label>
                  <select style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8 }} value={warehouseFormData.countryId} onChange={e => setWarehouseFormData({ ...warehouseFormData, countryId: e.target.value, provinceId: '' })}>
                    <option value="">-- Select Country --</option>
                    {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                {/* PROVINCE SELECT (Dependent) */}
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Province *</label>
                  <select style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8, backgroundColor: !warehouseFormData.countryId ? '#f3f4f6' : 'white' }} value={warehouseFormData.provinceId} onChange={e => setWarehouseFormData({ ...warehouseFormData, provinceId: e.target.value })} disabled={!warehouseFormData.countryId} required>
                    <option value="">{warehouseFormData.countryId ? "-- Select Province --" : "-- Select Country First --"}</option>
                    {filteredProvinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                <div><label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Capacity (Tons)</label><input type="number" style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8 }} value={warehouseFormData.capacity} onChange={e => setWarehouseFormData({ ...warehouseFormData, capacity: e.target.value })} placeholder="e.g., 5000" /></div>
                <div style={{ gridColumn: '1 / -1' }}><label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Address Detail *</label><input style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8 }} value={warehouseFormData.addressDetail} onChange={e => setWarehouseFormData({ ...warehouseFormData, addressDetail: e.target.value })} required /></div>
                
                <div><label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Store Condition</label><input style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8 }} value={warehouseFormData.storeCondition} onChange={e => setWarehouseFormData({ ...warehouseFormData, storeCondition: e.target.value })} placeholder="e.g., Cold Storage (-5C)" /></div>
              </div>
              <button type="submit" style={{ marginTop: 16, padding: '12px 24px', background: '#667eea', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
                {editingWarehouse ? 'Update' : 'Create'}
              </button>
            </form>
          )}

          <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: 16, textAlign: 'left', color: '#374151', fontWeight: 600, fontSize: 14 }}>ID</th>
                <th style={{ padding: 16, textAlign: 'left', color: '#374151', fontWeight: 600, fontSize: 14 }}>Address</th>
                <th style={{ padding: 16, textAlign: 'left', color: '#374151', fontWeight: 600, fontSize: 14 }}>Location</th>
                <th style={{ padding: 16, textAlign: 'left', color: '#374151', fontWeight: 600, fontSize: 14 }}>Capacity</th>
                <th style={{ padding: 16, textAlign: 'left', color: '#374151', fontWeight: 600, fontSize: 14 }}>Condition</th>
                <th style={{ padding: 16, textAlign: 'right', color: '#374151', fontWeight: 600, fontSize: 14 }}>Actions</th>
              </tr></thead>
              <tbody>
                {warehouses.map(w => (
                  <tr key={w.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: 16, fontWeight: 600, fontSize: 14 }}>#{w.id}</td>
                    <td style={{ padding: 16, color: '#374151', fontSize: 14 }}>{w.addressDetail}</td>
                    <td style={{ padding: 16, color: '#6b7280', fontSize: 14 }}>{w.provinceName || '-'}</td>
                    <td style={{ padding: 16, color: '#6b7280', fontSize: 14 }}>{w.capacity ? `${w.capacity} Tons` : '-'}</td>
                    <td style={{ padding: 16, color: '#6b7280', fontSize: 14 }}>{w.storeCondition || '-'}</td>
                    <td style={{ padding: 16, textAlign: 'right' }}>
                      <button onClick={() => handleEditClick(w)}
                        style={{ marginRight: 8, padding: '6px 12px', border: '1px solid #667eea', color: '#667eea', borderRadius: 6, background: 'white', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Edit</button>
                      <button onClick={() => handleDeleteWarehouse(w.id)}
                        style={{ padding: '6px 12px', border: '1px solid #ef4444', color: '#ef4444', borderRadius: 6, background: 'white', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {subTab === 'storedIn' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
               <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#374151' }}>Stored Inventory</h3>
               <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: 13 }}>Current stock in warehouses</p>
            </div>
            <button onClick={() => { setShowStoredInForm(!showStoredInForm); setEditingStoredIn(null); setStoredInFormData({ batchId: '', warehouseId: '', quantity: '', startDate: '', endDate: '' }) }}
              style={{ padding: '10px 20px', background: showStoredInForm ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, boxShadow: '0 2px 4px rgba(102,126,234,0.35)' }}>
              {showStoredInForm ? 'Cancel' : '+ Add Record'}
            </button>
          </div>

          {showStoredInForm && (
            <form onSubmit={handleStoredInSubmit} style={{ background: 'white', padding: 24, borderRadius: 12, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div><label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Batch *</label><select style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8 }} value={storedInFormData.batchId} onChange={e => setStoredInFormData({ ...storedInFormData, batchId: e.target.value })} disabled={!!editingStoredIn} required><option value="">Select Batch</option>{batches.map(b => <option key={b.id} value={b.id}>{b.productName || `Batch #${b.id}`}</option>)}</select></div>
                <div><label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Warehouse *</label><select style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8 }} value={storedInFormData.warehouseId} onChange={e => setStoredInFormData({ ...storedInFormData, warehouseId: e.target.value })} disabled={!!editingStoredIn} required><option value="">Select Warehouse</option>{warehouses.map(w => <option key={w.id} value={w.id}>{w.addressDetail}</option>)}</select></div>
                <div><label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Quantity *</label><input type="number" style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8 }} value={storedInFormData.quantity} onChange={e => setStoredInFormData({ ...storedInFormData, quantity: e.target.value })} required /></div>
                <div><label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Start Date</label><input type="date" style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8 }} value={storedInFormData.startDate} onChange={e => setStoredInFormData({ ...storedInFormData, startDate: e.target.value })} /></div>
              </div>
              <button type="submit" style={{ marginTop: 16, padding: '12px 24px', background: '#667eea', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
                {editingStoredIn ? 'Update' : 'Create'}
              </button>
            </form>
          )}

          <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: 16, textAlign: 'left', color: '#374151', fontWeight: 600, fontSize: 14 }}>Product</th>
                <th style={{ padding: 16, textAlign: 'left', color: '#374151', fontWeight: 600, fontSize: 14 }}>Warehouse</th>
                <th style={{ padding: 16, textAlign: 'left', color: '#374151', fontWeight: 600, fontSize: 14 }}>Quantity</th>
                <th style={{ padding: 16, textAlign: 'left', color: '#374151', fontWeight: 600, fontSize: 14 }}>Date In</th>
                <th style={{ padding: 16, textAlign: 'right', color: '#374151', fontWeight: 600, fontSize: 14 }}>Actions</th>
              </tr></thead>
              <tbody>
                {storedInList.map(s => (
                  <tr key={`${s.batchId}-${s.warehouseId}`} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: 16, color: '#374151', fontSize: 14 }}>{s.productName || `Batch #${s.batchId}`}</td>
                    <td style={{ padding: 16, color: '#6b7280', fontSize: 14 }}>{s.warehouseAddress || `Warehouse #${s.warehouseId}`}</td>
                    <td style={{ padding: 16 }}>
                      <span style={{ padding: '4px 12px', background: '#dbeafe', color: '#1e40af', borderRadius: 999, fontSize: 14, fontWeight: 600 }}>{s.quantity}</span>
                    </td>
                    <td style={{ padding: 16, color: '#6b7280', fontSize: 14 }}>{s.startDate ? new Date(s.startDate).toLocaleDateString() : '-'}</td>
                    <td style={{ padding: 16, textAlign: 'right' }}>
                      <button onClick={() => { setEditingStoredIn(s); setStoredInFormData({ batchId: s.batchId.toString(), warehouseId: s.warehouseId.toString(), quantity: s.quantity.toString(), startDate: s.startDate ? new Date(s.startDate).toISOString().slice(0, 10) : '', endDate: s.endDate ? new Date(s.endDate).toISOString().slice(0, 10) : '' }); setShowStoredInForm(true) }}
                        style={{ marginRight: 8, padding: '6px 12px', border: '1px solid #667eea', color: '#667eea', borderRadius: 6, background: 'white', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Edit</button>
                      <button onClick={() => handleDeleteStoredIn(s.batchId, s.warehouseId)}
                        style={{ padding: '6px 12px', border: '1px solid #ef4444', color: '#ef4444', borderRadius: 6, background: 'white', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}