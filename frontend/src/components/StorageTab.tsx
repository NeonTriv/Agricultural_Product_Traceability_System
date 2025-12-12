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
  countryId?: number
  storedInCount?: number
}

interface StoredIn {
  batchId: number
  warehouseId: number
  quantity: number
  startDate?: string
  endDate?: string
  batchQrCode?: string
  productName?: string     // Tên sản phẩm từ API
  warehouseAddress?: string // Tên/Địa chỉ kho từ API
  warehouseName?: string    // Bổ sung
}

interface Batch {
  id: number
  qrCodeUrl?: string
  productName?: string
  grade?: string
}

interface Province { id: number; name: string; countryId: number }
interface Country { id: number; name: string }

const tabBtn = (active: boolean) => ({
  padding: '10px 20px',
  borderRadius: 8,
  background: active ? '#eef2ff' : 'transparent',
  color: active ? '#667eea' : '#6b7280',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  border: 'none',
  transition: 'all 0.2s'
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
    id: '', capacity: '', storeCondition: '', addressDetail: '',
    longitude: '', latitude: '', countryId: '', provinceId: ''
  })
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null)

  // --- Form State: Stored In ---
  const [showStoredInForm, setShowStoredInForm] = useState(false)
  const [storedInFormData, setStoredInFormData] = useState({ 
    batchId: '', warehouseId: '', quantity: '', startDate: '', endDate: '' 
  })
  const [editingStoredIn, setEditingStoredIn] = useState<StoredIn | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; type: 'warehouse' | 'stored'; id: number | null; batchId?: number | null; warehouseId?: number | null }>({ show: false, type: 'warehouse', id: null })
  const [errorModal, setErrorModal] = useState<{ show: boolean; title: string; message: string }>({ show: false, title: '', message: '' })

  // --- Load Data ---
  useEffect(() => {
    // Luôn load location và warehouses vì tab nào cũng cần
    fetchLocations()
    fetchWarehouses()
    
    if (subTab === 'storedIn') {
      fetchBatches()
      fetchStoredIn()
    }
  }, [subTab])

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

  const fetchWarehouses = async () => { 
    try { 
      const res = await axios.get(`${baseUrl}/api/storage/warehouses`)
      console.log('📦 Warehouse API Response:', res.data)
      setWarehouses(res.data)
    } catch (err: any) { console.error(err) } 
  }

  const fetchBatches = async () => { 
    try { 
      const res = await axios.get(`${baseUrl}/api/products/batches`)
      setBatches(res.data)
    } catch (err) { console.error(err) } 
  }

  const fetchStoredIn = async () => { 
    setLoading(true)
    try { 
      const res = await axios.get(`${baseUrl}/api/storage/stored-in`)
      console.log('📦 StoredIn API Response:', res.data)
      setStoredInList(res.data)
      setError('')
    } catch (err: any) { setError(err.response?.data?.message || err.message) } 
    finally { setLoading(false) } 
  }

  // --- Handlers: Warehouse ---
  const handleEditWarehouse = (wh: Warehouse) => {
    setEditingWarehouse(wh)
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
        id: parseInt(warehouseFormData.id), // ID có thể nhập tay nếu tạo mới (tùy logic DB identity)
        capacity: warehouseFormData.capacity ? parseFloat(warehouseFormData.capacity) : undefined,
        longitude: warehouseFormData.longitude ? parseFloat(warehouseFormData.longitude) : undefined,
        latitude: warehouseFormData.latitude ? parseFloat(warehouseFormData.latitude) : undefined,
        provinceId: parseInt(warehouseFormData.provinceId)
      }
      
      if (editingWarehouse) await axios.patch(`${baseUrl}/api/storage/warehouses/${editingWarehouse.id}`, payload)
      else await axios.post(`${baseUrl}/api/storage/warehouses`, payload)
      
      setShowWarehouseForm(false); setEditingWarehouse(null);
      setWarehouseFormData({ id: '', name: '', capacity: '', storeCondition: '', addressDetail: '', longitude: '', latitude: '', countryId: '', provinceId: '' })
      fetchWarehouses()
    } catch (err: any) { setError(err.response?.data?.message || err.message) } finally { setLoading(false) }
  }

  const handleDeleteWarehouse = async (id: number) => {
    setDeleteConfirm({ show: true, type: 'warehouse', id })
  }
  const confirmDeleteWarehouse = async () => {
    if (!deleteConfirm.id) return; setLoading(true)
    try { await axios.delete(`${baseUrl}/api/storage/warehouses/${deleteConfirm.id}`); fetchWarehouses(); setDeleteConfirm({ show: false, type: 'warehouse', id: null }) } 
    catch (err: any) { const msg = err.response?.data?.message || err.message; setErrorModal({ show: true, title: '⚠️ Cannot Delete Warehouse', message: msg }); setDeleteConfirm({ show: false, type: 'warehouse', id: null }) } finally { setLoading(false) }
  }

  // --- Handlers: Stored In ---
  const handleStoredInSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try {
      const payload = {
        batchId: parseInt(storedInFormData.batchId),
        warehouseId: parseInt(storedInFormData.warehouseId),
        quantity: parseFloat(storedInFormData.quantity),
        startDate: storedInFormData.startDate || undefined,
        endDate: storedInFormData.endDate || undefined
      }

      if (editingStoredIn) {
        // Edit mode: Chỉ update quantity/date, không đổi batch/warehouse (PK)
        await axios.patch(`${baseUrl}/api/storage/stored-in/${editingStoredIn.batchId}/${editingStoredIn.warehouseId}`, payload)
      } else {
        // Create mode
        await axios.post(`${baseUrl}/api/storage/stored-in`, payload)
      }
      
      setShowStoredInForm(false); setEditingStoredIn(null); 
      setStoredInFormData({ batchId: '', warehouseId: '', quantity: '', startDate: '', endDate: '' }); 
      fetchStoredIn()
    } catch (err: any) { setError(err.response?.data?.message || err.message) } finally { setLoading(false) }
  }

  const handleDeleteStoredIn = async (batchId: number, warehouseId: number) => {
    setDeleteConfirm({ show: true, type: 'stored', id: null, batchId, warehouseId })
  }
  const confirmDeleteStoredIn = async () => {
    if (!deleteConfirm.batchId || !deleteConfirm.warehouseId) return; setLoading(true)
    try { await axios.delete(`${baseUrl}/api/storage/stored-in/${deleteConfirm.batchId}/${deleteConfirm.warehouseId}`); fetchStoredIn(); setDeleteConfirm({ show: false, type: 'warehouse', id: null }) } 
    catch (err: any) { const msg = err.response?.data?.message || err.message; setErrorModal({ show: true, title: '⚠️ Cannot Remove Item', message: msg }); setDeleteConfirm({ show: false, type: 'warehouse', id: null }) } finally { setLoading(false) }
  }

  const resetForms = () => { setShowWarehouseForm(false); setShowStoredInForm(false); setError('') }
  const filteredProvinces = provinces.filter(p => p.countryId.toString() === warehouseFormData.countryId)

  // --- Helper để lấy tên hiển thị (tránh bảng bị trống) ---
  const getBatchName = (id: number) => {
    const b = batches.find(x => x.id === id)
    return b ? b.productName : `Batch #${id}`
  }
  const getWarehouseName = (id: number) => {
    const w = warehouses.find(x => x.id === id)
    return w ? w.addressDetail : `Warehouse #${id}`
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 40, fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Storage Management</h2>
      </div>

      <div style={{ display: 'flex', marginBottom: 24, background: 'white', padding: 6, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', width: 'fit-content', gap: 4 }}>
        <button onClick={() => { setSubTab('warehouses'); resetForms() }} style={tabBtn(subTab === 'warehouses')}>🏭 Warehouses</button>
        <button onClick={() => { setSubTab('storedIn'); resetForms() }} style={tabBtn(subTab === 'storedIn')}>📦 Stored Items</button>
      </div>

      {error && <div style={{ padding: 16, marginBottom: 24, background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 8, color: '#b91c1c' }}>Error: {error}</div>}

      {/* === WAREHOUSES TAB === */}
      {subTab === 'warehouses' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Warehouse List</h2>
              <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: 14 }}>Storage facilities management</p>
            </div>
            <button onClick={() => { setShowWarehouseForm(!showWarehouseForm); setEditingWarehouse(null); setWarehouseFormData({ id: '', capacity: '', storeCondition: '', addressDetail: '', longitude: '', latitude: '', countryId: '', provinceId: '' }) }}
              style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 12px rgba(102,126,234,0.3)' }}>
              {showWarehouseForm ? 'Close Form' : '+ Add Warehouse'}
            </button>
          </div>

          {showWarehouseForm && (
            <form onSubmit={handleWarehouseSubmit} style={{ background: 'white', padding: 24, borderRadius: 16, marginBottom: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>Warehouse ID (Manual) *</label><input type="number" style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8 }} value={warehouseFormData.id} onChange={e => setWarehouseFormData({ ...warehouseFormData, id: e.target.value })} disabled={!!editingWarehouse} required placeholder="Auto if empty (depending on DB)" /></div>
                
                {/* Location Selectors */}
                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>Country</label><select style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8 }} value={warehouseFormData.countryId} onChange={e => setWarehouseFormData({ ...warehouseFormData, countryId: e.target.value, provinceId: '' })}><option value="">-- Select Country --</option>{countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div><label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Province *</label><select style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8, background: !warehouseFormData.countryId ? '#f3f4f6' : 'white' }} value={warehouseFormData.provinceId} onChange={e => setWarehouseFormData({ ...warehouseFormData, provinceId: e.target.value })} disabled={!warehouseFormData.countryId} required><option value="">{warehouseFormData.countryId ? "-- Select Province --" : "-- Select Country First --"}</option>{filteredProvinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>

                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>Capacity (Tons)</label><input type="number" style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8 }} value={warehouseFormData.capacity} onChange={e => setWarehouseFormData({ ...warehouseFormData, capacity: e.target.value })} /></div>
                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>Condition</label><input type="text" style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8 }} value={warehouseFormData.storeCondition} onChange={e => setWarehouseFormData({ ...warehouseFormData, storeCondition: e.target.value })} placeholder="e.g. Frozen -20C" /></div>
                <div style={{ gridColumn: '1 / -1' }}><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>Address Detail *</label><input type="text" style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8 }} value={warehouseFormData.addressDetail} onChange={e => setWarehouseFormData({ ...warehouseFormData, addressDetail: e.target.value })} required /></div>
              </div>
              <button type="submit" style={{ marginTop: 20, padding: '12px 24px', background: '#667eea', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>{editingWarehouse ? 'Update Warehouse' : 'Create Warehouse'}</button>
            </form>
          )}

          <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}><th style={{ padding: 16, textAlign: 'left', color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>ID</th><th style={{ padding: 16, textAlign: 'left', color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Address</th><th style={{ padding: 16, textAlign: 'left', color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Location</th><th style={{ padding: 16, textAlign: 'left', color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Capacity</th><th style={{ padding: 16, textAlign: 'left', color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Condition</th><th style={{ padding: 16, textAlign: 'right', color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Actions</th></tr></thead>
              <tbody>
                {warehouses.map(w => (
                  <tr key={w.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: 16, fontWeight: 600 }}>#{w.id}</td>
                    <td style={{ padding: 16 }}>
                      <div style={{ fontWeight: 600, color: '#374151' }}>{w.addressDetail}</div>
                    </td>
                    <td style={{ padding: 16, color: '#6b7280', fontSize: 13 }}>
                      <div>{w.provinceName}, {w.countryName}</div>
                      {w.longitude && w.latitude && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>📍 {w.latitude.toFixed(4)}, {w.longitude.toFixed(4)}</div>}
                    </td>
                    <td style={{ padding: 16, fontSize: 13 }}>
                      {w.capacity ? <span style={{ padding: '4px 10px', background: '#dbeafe', color: '#1e40af', borderRadius: 999, fontWeight: 600 }}>{w.capacity} tons</span> : <span style={{ color: '#9ca3af' }}>-</span>}
                    </td>
                    <td style={{ padding: 16, color: '#6b7280', fontSize: 13 }}>{w.storeCondition || '-'}</td>
                    <td style={{ padding: 16, textAlign: 'right' }}>
                      <button onClick={() => handleEditWarehouse(w)} style={{ marginRight: 8, padding: '6px 12px', background: '#dbeafe', color: '#1e40af', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Edit</button>
                      <button onClick={() => handleDeleteWarehouse(w.id)} style={{ padding: '6px 12px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* === STORED IN TAB === */}
      {subTab === 'storedIn' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Stored Inventory</h2>
              <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: 14 }}>Manage inventory in warehouses</p>
            </div>
            <button onClick={() => { setShowStoredInForm(!showStoredInForm); setEditingStoredIn(null); setStoredInFormData({ batchId: '', warehouseId: '', quantity: '', startDate: '', endDate: '' }) }}
              style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 12px rgba(102,126,234,0.3)' }}>
              {showStoredInForm ? 'Close Form' : '+ Add Record'}
            </button>
          </div>

          {showStoredInForm && (
            <form onSubmit={handleStoredInSubmit} style={{ background: 'white', padding: 24, borderRadius: 16, marginBottom: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                
                {/* BATCH SELECTOR */}
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>Batch (Lot) *</label>
                  <select 
                    style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8, background: editingStoredIn ? '#f3f4f6' : 'white' }} 
                    value={storedInFormData.batchId} 
                    onChange={e => setStoredInFormData({ ...storedInFormData, batchId: e.target.value })} 
                    disabled={!!editingStoredIn} 
                    required
                  >
                    <option value="">-- Select Batch --</option>
                    {batches.map(b => <option key={b.id} value={b.id}>#{b.id} - {b.productName}</option>)}
                  </select>
                </div>

                {/* WAREHOUSE SELECTOR - HIỂN THỊ RÕ RÀNG */}
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>Warehouse *</label>
                  <select 
                    style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8, background: editingStoredIn ? '#f3f4f6' : 'white' }} 
                    value={storedInFormData.warehouseId} 
                    onChange={e => setStoredInFormData({ ...storedInFormData, warehouseId: e.target.value })} 
                    disabled={!!editingStoredIn} 
                    required
                  >
                    <option value="">-- Select Warehouse --</option>
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>
                        {w.addressDetail} (ID: {w.id})
                      </option>
                    ))}
                  </select>
                  {/* Gợi ý cho người dùng nếu đang Edit */}
                  {editingStoredIn && <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>* Cannot change Batch/Warehouse while editing. Please create new record to move stock.</div>}
                </div>

                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>Quantity *</label><input type="number" style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8 }} value={storedInFormData.quantity} onChange={e => setStoredInFormData({ ...storedInFormData, quantity: e.target.value })} required /></div>
                <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>Start Date</label><input type="date" style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8 }} value={storedInFormData.startDate} onChange={e => setStoredInFormData({ ...storedInFormData, startDate: e.target.value })} /></div>
                  <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>End Date</label><input type="date" style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8 }} value={storedInFormData.endDate} onChange={e => setStoredInFormData({ ...storedInFormData, endDate: e.target.value })} /></div>
                </div>
              </div>
              <button type="submit" style={{ marginTop: 20, padding: '12px 24px', background: '#667eea', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>{editingStoredIn ? 'Update Stock' : 'Add Stock'}</button>
            </form>
          )}

          <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}><th style={{ padding: 16, textAlign: 'left', color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Product / Batch</th><th style={{ padding: 16, textAlign: 'left', color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Warehouse Location</th><th style={{ padding: 16, textAlign: 'left', color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Quantity</th><th style={{ padding: 16, textAlign: 'left', color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Storage Period</th><th style={{ padding: 16, textAlign: 'right', color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Actions</th></tr></thead>
              <tbody>
                {storedInList.map(s => (
                  <tr key={`${s.batchId}-${s.warehouseId}`} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: 16 }}>
                      {/* Tra cứu tên batch nếu API trả về null */}
                      <div style={{ fontWeight: 600, color: '#374151' }}>{s.productName || getBatchName(s.batchId)}</div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>Batch ID: {s.batchId}</div>
                    </td>
                    <td style={{ padding: 16, color: '#6b7280', fontSize: 13 }}>
                      {/* Tra cứu tên kho nếu API trả về null */}
                      {s.warehouseAddress || getWarehouseName(s.warehouseId)}
                    </td>
                    <td style={{ padding: 16 }}>
                      <span style={{ padding: '4px 12px', background: '#dbeafe', color: '#1e40af', borderRadius: 999, fontSize: 13, fontWeight: 600 }}>{s.quantity}</span>
                    </td>
                    <td style={{ padding: 16, color: '#6b7280', fontSize: 13 }}>
                      {s.startDate ? new Date(s.startDate).toLocaleDateString('vi-VN') : '-'}
                      {s.endDate && ` → ${new Date(s.endDate).toLocaleDateString('vi-VN')}`}
                    </td>
                    <td style={{ padding: 16, textAlign: 'right' }}>
                      <button onClick={() => { setEditingStoredIn(s); setStoredInFormData({ batchId: s.batchId.toString(), warehouseId: s.warehouseId.toString(), quantity: s.quantity.toString(), startDate: s.startDate ? new Date(s.startDate).toISOString().slice(0, 10) : '', endDate: s.endDate ? new Date(s.endDate).toISOString().slice(0, 10) : '' }); setShowStoredInForm(true) }} style={{ marginRight: 8, padding: '6px 12px', background: '#dbeafe', color: '#1e40af', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Edit</button>
                      <button onClick={() => handleDeleteStoredIn(s.batchId, s.warehouseId)} style={{ padding: '6px 12px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirm.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 32, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', maxWidth: 400, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>❓</div>
            <h3 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: 20, fontWeight: 700 }}>Confirm Delete</h3>
            <p style={{ margin: '0 0 24px 0', color: '#6b7280', fontSize: 15 }}>Are you sure you want to {deleteConfirm.type === 'warehouse' ? 'delete this warehouse' : 'remove this item from storage'}? This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => setDeleteConfirm({ show: false, type: 'warehouse', id: null })} style={{ padding: '10px 20px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button onClick={deleteConfirm.type === 'warehouse' ? confirmDeleteWarehouse : confirmDeleteStoredIn} style={{ padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ERROR MODAL */}
      {errorModal.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 32, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', maxWidth: 400 }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: 20, fontWeight: 700 }}>{errorModal.title}</h3>
            <p style={{ margin: '0 0 24px 0', color: '#6b7280', fontSize: 15 }}>{errorModal.message}</p>
            <button onClick={() => setErrorModal({ show: false, title: '', message: '' })} style={{ width: '100%', padding: '10px 24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>OK</button>
          </div>
        </div>
      )}
    </div>
  )
}