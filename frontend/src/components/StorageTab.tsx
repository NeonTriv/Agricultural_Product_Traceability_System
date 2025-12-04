import React, { useState, useEffect } from 'react'
import axios from 'axios'

const baseUrl = 'http://localhost:5000'

interface Warehouse {
  id: number
  capacity?: number
  storeCondition?: string
  addressDetail: string
  longitude?: number
  latitude?: number
  provinceId?: number
  provinceName?: string
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

export default function StorageTab() {
  const [subTab, setSubTab] = useState<'warehouses' | 'storedIn'>('warehouses')

  // Warehouses state
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [showWarehouseForm, setShowWarehouseForm] = useState(false)
  const [warehouseFormData, setWarehouseFormData] = useState({
    id: '',
    capacity: '',
    storeCondition: '',
    addressDetail: '',
    longitude: '',
    latitude: '',
    provinceId: ''
  })
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null)

  // StoredIn state
  const [storedInList, setStoredInList] = useState<StoredIn[]>([])
  const [showStoredInForm, setShowStoredInForm] = useState(false)
  const [storedInFormData, setStoredInFormData] = useState({
    batchId: '',
    warehouseId: '',
    quantity: '',
    startDate: '',
    endDate: ''
  })
  const [editingStoredIn, setEditingStoredIn] = useState<StoredIn | null>(null)

  // Common state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [storedInFormErrors, setStoredInFormErrors] = useState<{[key: string]: boolean}>({})

  // Fetch functions
  const fetchWarehouses = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${baseUrl}/api/storage/warehouses`)
      setWarehouses(res.data)
      setError('')
    } catch (err: any) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchStoredIn = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${baseUrl}/api/storage/stored-in`)
      setStoredInList(res.data)
      setError('')
    } catch (err: any) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchBatches = async () => {
    try {
      const res = await axios.get(`${baseUrl}/api/products/batches`)
      setBatches(res.data)
    } catch (err: any) {
      console.error('Failed to fetch batches:', err)
    }
  }

  useEffect(() => {
    if (subTab === 'warehouses') {
      fetchWarehouses()
    } else {
      fetchStoredIn()
      fetchBatches()
      fetchWarehouses() // Need warehouses for dropdown
    }
  }, [subTab])

  // Warehouse handlers
  const handleWarehouseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingWarehouse) {
        await axios.patch(`${baseUrl}/api/storage/warehouses/${editingWarehouse.id}`, {
          capacity: warehouseFormData.capacity ? parseFloat(warehouseFormData.capacity) : undefined,
          storeCondition: warehouseFormData.storeCondition || undefined,
          addressDetail: warehouseFormData.addressDetail,
          longitude: warehouseFormData.longitude ? parseFloat(warehouseFormData.longitude) : undefined,
          latitude: warehouseFormData.latitude ? parseFloat(warehouseFormData.latitude) : undefined,
          provinceId: warehouseFormData.provinceId ? parseInt(warehouseFormData.provinceId) : undefined
        })
      } else {
        await axios.post(`${baseUrl}/api/storage/warehouses`, {
          id: parseInt(warehouseFormData.id),
          capacity: warehouseFormData.capacity ? parseFloat(warehouseFormData.capacity) : undefined,
          storeCondition: warehouseFormData.storeCondition || undefined,
          addressDetail: warehouseFormData.addressDetail,
          longitude: warehouseFormData.longitude ? parseFloat(warehouseFormData.longitude) : undefined,
          latitude: warehouseFormData.latitude ? parseFloat(warehouseFormData.latitude) : undefined,
          provinceId: warehouseFormData.provinceId ? parseInt(warehouseFormData.provinceId) : undefined
        })
      }
      setShowWarehouseForm(false)
      setEditingWarehouse(null)
      setWarehouseFormData({ id: '', capacity: '', storeCondition: '', addressDetail: '', longitude: '', latitude: '', provinceId: '' })
      fetchWarehouses()
    } catch (err: any) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEditWarehouse = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse)
    setWarehouseFormData({
      id: warehouse.id.toString(),
      capacity: warehouse.capacity?.toString() || '',
      storeCondition: warehouse.storeCondition || '',
      addressDetail: warehouse.addressDetail,
      longitude: warehouse.longitude?.toString() || '',
      latitude: warehouse.latitude?.toString() || '',
      provinceId: warehouse.provinceId?.toString() || ''
    })
    setShowWarehouseForm(true)
  }

  const handleDeleteWarehouse = async (id: number) => {
    if (!confirm('Are you sure you want to delete this warehouse?')) return
    setLoading(true)
    try {
      await axios.delete(`${baseUrl}/api/storage/warehouses/${id}`)
      fetchWarehouses()
    } catch (err: any) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  // StoredIn handlers
  const handleStoredInSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    const errors: {[key: string]: boolean} = {}
    if (!editingStoredIn && !storedInFormData.batchId) errors.batchId = true
    if (!editingStoredIn && !storedInFormData.warehouseId) errors.warehouseId = true
    if (!storedInFormData.quantity) errors.quantity = true
    
    if (Object.keys(errors).length > 0) {
      setStoredInFormErrors(errors)
      return
    }
    setStoredInFormErrors({})
    
    setLoading(true)
    try {
      if (editingStoredIn) {
        await axios.patch(
          `${baseUrl}/api/storage/stored-in/${editingStoredIn.batchId}/${editingStoredIn.warehouseId}`,
          {
            quantity: parseFloat(storedInFormData.quantity),
            startDate: storedInFormData.startDate || undefined,
            endDate: storedInFormData.endDate || undefined
          }
        )
      } else {
        await axios.post(`${baseUrl}/api/storage/stored-in`, {
          batchId: parseInt(storedInFormData.batchId),
          warehouseId: parseInt(storedInFormData.warehouseId),
          quantity: parseFloat(storedInFormData.quantity),
          startDate: storedInFormData.startDate || undefined,
          endDate: storedInFormData.endDate || undefined
        })
      }
      setShowStoredInForm(false)
      setEditingStoredIn(null)
      setStoredInFormErrors({})
      setStoredInFormData({ batchId: '', warehouseId: '', quantity: '', startDate: '', endDate: '' })
      fetchStoredIn()
    } catch (err: any) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEditStoredIn = (storedIn: StoredIn) => {
    setEditingStoredIn(storedIn)
    setStoredInFormData({
      batchId: storedIn.batchId.toString(),
      warehouseId: storedIn.warehouseId.toString(),
      quantity: storedIn.quantity.toString(),
      startDate: storedIn.startDate ? new Date(storedIn.startDate).toISOString().split('T')[0] : '',
      endDate: storedIn.endDate ? new Date(storedIn.endDate).toISOString().split('T')[0] : ''
    })
    setShowStoredInForm(true)
  }

  const handleDeleteStoredIn = async (batchId: number, warehouseId: number) => {
    if (!confirm('Are you sure you want to delete this storage record?')) return
    setLoading(true)
    try {
      await axios.delete(`${baseUrl}/api/storage/stored-in/${batchId}/${warehouseId}`)
      fetchStoredIn()
    } catch (err: any) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Sub-Tab Switcher */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <button
          onClick={() => {
            setSubTab('warehouses')
            setShowWarehouseForm(false)
            setShowStoredInForm(false)
          }}
          style={{
            padding: '12px 24px',
            background: subTab === 'warehouses' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
            color: subTab === 'warehouses' ? 'white' : '#667eea',
            border: '2px solid #667eea',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Warehouses
        </button>
        <button
          onClick={() => {
            setSubTab('storedIn')
            setShowWarehouseForm(false)
            setShowStoredInForm(false)
          }}
          style={{
            padding: '12px 24px',
            background: subTab === 'storedIn' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
            color: subTab === 'storedIn' ? 'white' : '#667eea',
            border: '2px solid #667eea',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Stored Items
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

      {/* WAREHOUSES TAB */}
      {subTab === 'warehouses' && (
        <>
          {showWarehouseForm && (
            <div style={{ background: 'white', padding: 24, borderRadius: 12, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ marginTop: 0, color: '#374151' }}>
                {editingWarehouse ? 'Edit Warehouse' : 'Add New Warehouse'}
              </h2>
              <form onSubmit={handleWarehouseSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {!editingWarehouse && (
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                        Warehouse ID *
                      </label>
                      <input
                        type="number"
                        value={warehouseFormData.id}
                        onChange={e => setWarehouseFormData({ ...warehouseFormData, id: e.target.value })}
                        required
                        style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: 8, fontSize: 16 }}
                      />
                    </div>
                  )}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                      Address Detail *
                    </label>
                    <input
                      type="text"
                      value={warehouseFormData.addressDetail}
                      onChange={e => setWarehouseFormData({ ...warehouseFormData, addressDetail: e.target.value })}
                      required
                      placeholder="Full warehouse address"
                      style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: 8, fontSize: 16 }}
                    />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                      Capacity
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={warehouseFormData.capacity}
                      onChange={e => setWarehouseFormData({ ...warehouseFormData, capacity: e.target.value })}
                      placeholder="Warehouse capacity"
                      style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: 8, fontSize: 16 }}
                    />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                      Storage Condition
                    </label>
                    <input
                      type="text"
                      value={warehouseFormData.storeCondition}
                      onChange={e => setWarehouseFormData({ ...warehouseFormData, storeCondition: e.target.value })}
                      placeholder="e.g., Cool & Dry, -18°C"
                      style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: 8, fontSize: 16 }}
                    />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      value={warehouseFormData.longitude}
                      onChange={e => setWarehouseFormData({ ...warehouseFormData, longitude: e.target.value })}
                      placeholder="e.g., 105.123456"
                      style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: 8, fontSize: 16 }}
                    />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      value={warehouseFormData.latitude}
                      onChange={e => setWarehouseFormData({ ...warehouseFormData, latitude: e.target.value })}
                      placeholder="e.g., 21.123456"
                      style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: 8, fontSize: 16 }}
                    />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                      Province ID
                    </label>
                    <input
                      type="number"
                      value={warehouseFormData.provinceId}
                      onChange={e => setWarehouseFormData({ ...warehouseFormData, provinceId: e.target.value })}
                      placeholder="Province ID"
                      style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: 8, fontSize: 16 }}
                    />
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
                    {loading ? 'Saving...' : (editingWarehouse ? 'Update' : 'Create')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowWarehouseForm(false)
                      setEditingWarehouse(null)
                      setWarehouseFormData({ id: '', capacity: '', storeCondition: '', addressDetail: '', longitude: '', latitude: '', provinceId: '' })
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

          {!showWarehouseForm && (
            <button
              onClick={() => setShowWarehouseForm(true)}
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
              + Add New Warehouse
            </button>
          )}

          <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>ID</th>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Address</th>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Capacity</th>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Condition</th>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Province</th>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Items</th>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>Loading...</td></tr>
                ) : warehouses.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>No warehouses found.</td></tr>
                ) : (
                  warehouses.map((warehouse, index) => (
                    <tr key={warehouse.id} style={{ borderBottom: index < warehouses.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                      <td style={{ padding: 16, fontWeight: 600 }}>{warehouse.id}</td>
                      <td style={{ padding: 16 }}>{warehouse.addressDetail}</td>
                      <td style={{ padding: 16, color: '#6b7280' }}>{warehouse.capacity || '-'}</td>
                      <td style={{ padding: 16, color: '#6b7280' }}>{warehouse.storeCondition || '-'}</td>
                      <td style={{ padding: 16, color: '#6b7280' }}>{warehouse.provinceName || warehouse.provinceId || '-'}</td>
                      <td style={{ padding: 16, color: '#6b7280' }}>{warehouse.storedInCount || 0}</td>
                      <td style={{ padding: 16 }}>
                        <button onClick={() => handleEditWarehouse(warehouse)} style={{ padding: '6px 12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 4, fontSize: 14, cursor: 'pointer', marginRight: 8 }}>Edit</button>
                        <button onClick={() => handleDeleteWarehouse(warehouse.id)} style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 4, fontSize: 14, cursor: 'pointer' }}>Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* STORED IN TAB */}
      {subTab === 'storedIn' && (
        <>
          {showStoredInForm && (
            <div style={{ background: 'white', padding: 24, borderRadius: 12, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ marginTop: 0, color: '#374151' }}>
                {editingStoredIn ? 'Edit Storage Record' : 'Add New Storage Record'}
              </h2>
              <form onSubmit={handleStoredInSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {/* Batch */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                      Batch <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <select
                      value={storedInFormData.batchId}
                      onChange={e => { setStoredInFormData({ ...storedInFormData, batchId: e.target.value }); setStoredInFormErrors({ ...storedInFormErrors, batchId: false }) }}
                      disabled={!!editingStoredIn}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: storedInFormErrors.batchId ? '2px solid #dc2626' : '2px solid #e5e7eb',
                        borderRadius: 8,
                        fontSize: 16,
                        background: editingStoredIn ? '#f3f4f6' : 'white'
                      }}
                    >
                      <option value="">-- Chọn lô hàng --</option>
                      {batches.map(b => (
                        <option key={b.id} value={b.id}>{b.productName || 'Unknown Product'}</option>
                      ))}
                    </select>
                    {storedInFormErrors.batchId && <span style={{ color: '#dc2626', fontSize: 12 }}>Vui lòng chọn Batch</span>}
                  </div>

                  {/* Warehouse */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                      Warehouse <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <select
                      value={storedInFormData.warehouseId}
                      onChange={e => { setStoredInFormData({ ...storedInFormData, warehouseId: e.target.value }); setStoredInFormErrors({ ...storedInFormErrors, warehouseId: false }) }}
                      disabled={!!editingStoredIn}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: storedInFormErrors.warehouseId ? '2px solid #dc2626' : '2px solid #e5e7eb',
                        borderRadius: 8,
                        fontSize: 16,
                        background: editingStoredIn ? '#f3f4f6' : 'white'
                      }}
                    >
                      <option value="">-- Chọn kho --</option>
                      {warehouses.map(w => (
                        <option key={w.id} value={w.id}>{w.addressDetail || `Warehouse ${w.id}`}</option>
                      ))}
                    </select>
                    {storedInFormErrors.warehouseId && <span style={{ color: '#dc2626', fontSize: 12 }}>Vui lòng chọn Warehouse</span>}
                  </div>

                  {/* Quantity */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                      Quantity <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={storedInFormData.quantity}
                      onChange={e => { setStoredInFormData({ ...storedInFormData, quantity: e.target.value }); setStoredInFormErrors({ ...storedInFormErrors, quantity: false }) }}
                      min="0"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: storedInFormErrors.quantity ? '2px solid #dc2626' : '2px solid #e5e7eb',
                        borderRadius: 8,
                        fontSize: 16
                      }}
                    />
                    {storedInFormErrors.quantity && <span style={{ color: '#dc2626', fontSize: 12 }}>Vui lòng nhập số lượng</span>}
                  </div>

                  {/* Start Date */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={storedInFormData.startDate}
                      onChange={e => setStoredInFormData({ ...storedInFormData, startDate: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: 8,
                        fontSize: 16
                      }}
                    />
                  </div>

                  {/* End Date */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                      End Date
                    </label>
                    <input
                      type="date"
                      value={storedInFormData.endDate}
                      onChange={e => setStoredInFormData({ ...storedInFormData, endDate: e.target.value })}
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

                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
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
                    {loading ? 'Saving...' : (editingStoredIn ? 'Update' : 'Create')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowStoredInForm(false)
                      setEditingStoredIn(null)
                      setStoredInFormErrors({})
                      setStoredInFormData({ batchId: '', warehouseId: '', quantity: '', startDate: '', endDate: '' })
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

          {!showStoredInForm && (
            <button
              onClick={() => setShowStoredInForm(true)}
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
              + Add New Storage Record
            </button>
          )}

          <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Batch ID</th>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Product</th>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>QR Code</th>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Warehouse</th>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Address</th>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Quantity</th>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Dates</th>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>Loading...</td></tr>
                ) : storedInList.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>No storage records found.</td></tr>
                ) : (
                  storedInList.map((item, index) => (
                    <tr key={`${item.batchId}-${item.warehouseId}`} style={{ borderBottom: index < storedInList.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                      <td style={{ padding: 16, fontWeight: 600 }}>{item.batchId}</td>
                      <td style={{ padding: 16, color: '#6b7280' }}>{item.productName || '-'}</td>
                      <td style={{ padding: 16, color: '#6b7280', fontSize: 12, fontFamily: 'monospace' }}>
                        {item.batchQrCode ? item.batchQrCode.substring(0, 20) + '...' : '-'}
                      </td>
                      <td style={{ padding: 16, color: '#6b7280' }}>#{item.warehouseId}</td>
                      <td style={{ padding: 16, color: '#6b7280' }}>{item.warehouseAddress || '-'}</td>
                      <td style={{ padding: 16, color: '#6b7280' }}>
                        <span style={{
                          padding: '4px 12px',
                          background: '#dbeafe',
                          color: '#1e40af',
                          borderRadius: 999,
                          fontSize: 14,
                          fontWeight: 600
                        }}>
                          {item.quantity}
                        </span>
                      </td>
                      <td style={{ padding: 16, color: '#6b7280', fontSize: 14 }}>
                        {item.startDate && <div>From: {new Date(item.startDate).toLocaleDateString()}</div>}
                        {item.endDate && <div>To: {new Date(item.endDate).toLocaleDateString()}</div>}
                        {!item.startDate && !item.endDate && '-'}
                      </td>
                      <td style={{ padding: 16 }}>
                        <button onClick={() => handleEditStoredIn(item)} style={{ padding: '6px 12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 4, fontSize: 14, cursor: 'pointer', marginRight: 8 }}>Edit</button>
                        <button onClick={() => handleDeleteStoredIn(item.batchId, item.warehouseId)} style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 4, fontSize: 14, cursor: 'pointer' }}>Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
