import React, { useState, useEffect } from 'react'
import axios from 'axios'

const baseUrl = 'http://localhost:5000'

// --- Interfaces ---
interface CarrierCompany {
  vTin: string
  name: string
  addressDetail?: string
  longitude?: number
  latitude?: number
  contactInfo?: string
  provinceId?: number
  provinceName?: string
  countryName?: string
  transportLegCount?: number
}

interface Province { id: number; name: string; countryId: number }
interface Country { id: number; name: string }

interface Shipment {
  id: number
  status: string
  destination?: string
  startLocation?: string
  distributorTin: string
  distributorName?: string
  transportLegCount?: number
}

interface TransportLeg {
  id: number
  shipmentId: number
  driverName?: string
  regNo?: string
  temperatureProfile?: string
  startLocation: string
  toLocation: string
  departureTime?: string
  arrivalTime?: string
  carrierCompanyTin: string
  carrierCompanyName?: string
  shipmentDestination?: string
}

interface Distributor {
  vTin: string
  name: string
}

export default function LogisticsTab() {
  const [subTab, setSubTab] = useState<'carriers' | 'shipments' | 'transportLegs'>('carriers')

  // --- State ---
  const [carriers, setCarriers] = useState<CarrierCompany[]>([])
  const [distributors, setDistributors] = useState<Distributor[]>([])
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [transportLegs, setTransportLegs] = useState<TransportLeg[]>([])
  const [provinces, setProvinces] = useState<Province[]>([])
  const [countries, setCountries] = useState<Country[]>([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; type: 'carrier' | 'shipment' | 'leg'; id: string | number | null }>({ show: false, type: 'carrier', id: null })
  const [errorModal, setErrorModal] = useState<{ show: boolean; title: string; message: string }>({ show: false, title: '', message: '' })

  // Forms State
  const [showCarrierForm, setShowCarrierForm] = useState(false)
  const [carrierFormData, setCarrierFormData] = useState({ vTin: '', name: '', addressDetail: '', contactInfo: '', countryId: '', provinceId: '' })
  const [editingCarrier, setEditingCarrier] = useState<CarrierCompany | null>(null)

  const [showShipmentForm, setShowShipmentForm] = useState(false)
  const [shipmentFormData, setShipmentFormData] = useState({ status: '', destination: '', startLocation: '', distributorTin: '' })
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null)

  const [showTransportLegForm, setShowTransportLegForm] = useState(false)
  const [transportLegFormData, setTransportLegFormData] = useState({ shipmentId: '', driverName: '', regNo: '', temperatureProfile: '', startLocation: '', toLocation: '', departureTime: '', arrivalTime: '', carrierCompanyTin: '' })
  const [editingTransportLeg, setEditingTransportLeg] = useState<TransportLeg | null>(null)

  // --- Helpers ---
  const resetForms = () => {
    setShowCarrierForm(false)
    setShowShipmentForm(false)
    setShowTransportLegForm(false)
    setEditingCarrier(null)
    setEditingShipment(null)
    setEditingTransportLeg(null)
    setError('')
  }

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

  const statusBadge = (status: string) => {
    let bg = '#f3f4f6', color = '#374151'
    if (status === 'Delivered') { bg = '#dcfce7'; color = '#166534' }
    else if (status === 'In Transit') { bg = '#dbeafe'; color = '#1e40af' }
    else if (status === 'Pending') { bg = '#fef3c7'; color = '#92400e' }
    else if (status === 'Cancelled') { bg = '#fee2e2'; color = '#991b1b' }
    return <span style={{ padding: '4px 12px', background: bg, color, borderRadius: 999, fontSize: 12, fontWeight: 600 }}>{status}</span>
  }

  // --- Fetch Data ---
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

  const fetchCarriers = async () => {
    setLoading(true); try { const res = await axios.get(`${baseUrl}/api/logistics/carriers`); setCarriers(res.data); setError('') } catch (err: any) { setError(err.response?.data?.message || err.message) } finally { setLoading(false) }
  }
  const fetchShipments = async () => {
    setLoading(true); try { const res = await axios.get(`${baseUrl}/api/logistics/shipments`); setShipments(res.data); setError('') } catch (err: any) { setError(err.response?.data?.message || err.message) } finally { setLoading(false) }
  }
  const fetchTransportLegs = async () => {
    setLoading(true); try { const res = await axios.get(`${baseUrl}/api/logistics/transport-legs`); setTransportLegs(res.data); setError('') } catch (err: any) { setError(err.response?.data?.message || err.message) } finally { setLoading(false) }
  }
  const fetchDistributors = async () => { try { const res = await axios.get(`${baseUrl}/api/logistics/distributors`); setDistributors(res.data) } catch (err) { console.error(err) } }

  useEffect(() => {
    if (subTab === 'carriers') { fetchCarriers(); fetchLocations() }
    else if (subTab === 'shipments') { fetchShipments(); fetchDistributors() }
    else { fetchTransportLegs(); fetchCarriers(); fetchShipments() }
  }, [subTab])

  // --- Handlers ---
  const handleCarrierEditClick = (carrier: CarrierCompany) => {
    setEditingCarrier(carrier)
    
    // Auto-detect Country from Province ID
    const prov = provinces.find(p => p.id === carrier.provinceId)
    const countryId = prov ? prov.countryId.toString() : ''

    setCarrierFormData({
      vTin: carrier.vTin,
      name: carrier.name,
      addressDetail: carrier.addressDetail || '',
      contactInfo: carrier.contactInfo || '',
      countryId: countryId,
      provinceId: carrier.provinceId ? carrier.provinceId.toString() : ''
    })
    setShowCarrierForm(true)
  }

  const handleCarrierSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try {
      const payload = {
        vTin: carrierFormData.vTin,
        name: carrierFormData.name,
        addressDetail: carrierFormData.addressDetail,
        contactInfo: carrierFormData.contactInfo,
        provinceId: carrierFormData.provinceId ? parseInt(carrierFormData.provinceId) : undefined
      }
      if (editingCarrier) await axios.patch(`${baseUrl}/api/logistics/carriers/${editingCarrier.vTin}`, payload)
      else await axios.post(`${baseUrl}/api/logistics/carriers`, payload)
      resetForms(); setCarrierFormData({ vTin: '', name: '', addressDetail: '', contactInfo: '', countryId: '', provinceId: '' }); fetchCarriers()
    } catch (err: any) { setError(err.response?.data?.message || err.message) } finally { setLoading(false) }
  }

  const handleDeleteCarrier = async (tin: string) => {
    setDeleteConfirm({ show: true, type: 'carrier', id: tin })
  }
  const confirmDeleteCarrier = async () => {
    if (!deleteConfirm.id) return; setLoading(true)
    try { await axios.delete(`${baseUrl}/api/logistics/carriers/${deleteConfirm.id}`); fetchCarriers(); setDeleteConfirm({ show: false, type: 'carrier', id: null }) } catch (err: any) { const msg = err.response?.data?.message || err.message; setErrorModal({ show: true, title: '⚠️ Cannot Delete Carrier', message: msg }); setDeleteConfirm({ show: false, type: 'carrier', id: null }) } finally { setLoading(false) }
  }

  const handleShipmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try {
      const payload = { status: shipmentFormData.status, destination: shipmentFormData.destination, startLocation: shipmentFormData.startLocation, distributorTin: shipmentFormData.distributorTin }
      if (editingShipment) await axios.patch(`${baseUrl}/api/logistics/shipments/${editingShipment.id}`, payload)
      else await axios.post(`${baseUrl}/api/logistics/shipments`, payload)
      resetForms(); setShipmentFormData({ status: '', destination: '', startLocation: '', distributorTin: '' }); fetchShipments()
    } catch (err: any) { setError(err.response?.data?.message || err.message) } finally { setLoading(false) }
  }

  const handleDeleteShipment = async (id: number) => {
    setDeleteConfirm({ show: true, type: 'shipment', id })
  }
  const confirmDeleteShipment = async () => {
    if (!deleteConfirm.id) return; setLoading(true)
    try { await axios.delete(`${baseUrl}/api/logistics/shipments/${deleteConfirm.id}`); fetchShipments(); setDeleteConfirm({ show: false, type: 'carrier', id: null }) } catch (err: any) { const msg = err.response?.data?.message || err.message; setErrorModal({ show: true, title: '⚠️ Cannot Delete Shipment', message: msg }); setDeleteConfirm({ show: false, type: 'carrier', id: null }) } finally { setLoading(false) }
  }

  const handleTransportLegSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try {
      const payload = { shipmentId: parseInt(transportLegFormData.shipmentId), driverName: transportLegFormData.driverName, regNo: transportLegFormData.regNo, temperatureProfile: transportLegFormData.temperatureProfile, startLocation: transportLegFormData.startLocation, toLocation: transportLegFormData.toLocation, departureTime: transportLegFormData.departureTime || undefined, arrivalTime: transportLegFormData.arrivalTime || undefined, carrierCompanyTin: transportLegFormData.carrierCompanyTin }
      if (editingTransportLeg) await axios.patch(`${baseUrl}/api/logistics/transport-legs/${editingTransportLeg.id}`, payload)
      else await axios.post(`${baseUrl}/api/logistics/transport-legs`, payload)
      resetForms(); setTransportLegFormData({ shipmentId: '', driverName: '', regNo: '', temperatureProfile: '', startLocation: '', toLocation: '', departureTime: '', arrivalTime: '', carrierCompanyTin: '' }); fetchTransportLegs()
    } catch (err: any) { setError(err.response?.data?.message || err.message) } finally { setLoading(false) }
  }

  const handleDeleteTransportLeg = async (id: number) => {
    setDeleteConfirm({ show: true, type: 'leg', id })
  }
  const confirmDeleteTransportLeg = async () => {
    if (!deleteConfirm.id) return; setLoading(true)
    try { await axios.delete(`${baseUrl}/api/logistics/transport-legs/${deleteConfirm.id}`); fetchTransportLegs(); setDeleteConfirm({ show: false, type: 'carrier', id: null }) } catch (err: any) { const msg = err.response?.data?.message || err.message; setErrorModal({ show: true, title: '⚠️ Cannot Delete Transport Leg', message: msg }); setDeleteConfirm({ show: false, type: 'carrier', id: null }) } finally { setLoading(false) }
  }

  // --- RENDER ---
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 40, fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Logistics Management</h2>
      </div>

      {/* Sub-Tab Switcher */}
      <div style={{ display: 'flex', marginBottom: 24, background: 'white', padding: 6, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', width: 'fit-content', gap: 4 }}>
        <button onClick={() => { setSubTab('carriers'); resetForms() }} style={tabBtn(subTab === 'carriers')}>🚚 Carriers</button>
        <button onClick={() => { setSubTab('shipments'); resetForms() }} style={tabBtn(subTab === 'shipments')}>📦 Shipments</button>
        <button onClick={() => { setSubTab('transportLegs'); resetForms() }} style={tabBtn(subTab === 'transportLegs')}>🛣️ Transport Legs</button>
      </div>

      {error && <div style={{ padding: 16, marginBottom: 24, background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 8, color: '#b91c1c' }}>Error: {error}</div>}

      {/* CARRIERS TAB */}
      {subTab === 'carriers' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Carrier Management</h2>
              <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: 14 }}>Manage shipping partners</p>
            </div>
            <button onClick={() => { setShowCarrierForm(!showCarrierForm); setEditingCarrier(null); setCarrierFormData({ vTin: '', name: '', addressDetail: '', contactInfo: '', countryId: '', provinceId: '' }) }}
              style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 12px rgba(102,126,234,0.3)' }}>
              {showCarrierForm ? 'Close Form' : '+ Add Carrier'}
            </button>
          </div>

          {showCarrierForm && (
            <form onSubmit={handleCarrierSubmit} style={{ background: 'white', padding: 24, borderRadius: 16, marginBottom: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>TIN *</label><input style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8 }} value={carrierFormData.vTin} onChange={e => setCarrierFormData({ ...carrierFormData, vTin: e.target.value })} disabled={!!editingCarrier} required /></div>
                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>Name *</label><input style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8 }} value={carrierFormData.name} onChange={e => setCarrierFormData({ ...carrierFormData, name: e.target.value })} required /></div>
                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>Country</label><select style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8 }} value={carrierFormData.countryId} onChange={e => setCarrierFormData({ ...carrierFormData, countryId: e.target.value, provinceId: '' })}><option value="">-- Select Country --</option>{countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>Province</label><select style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8 }} value={carrierFormData.provinceId} onChange={e => setCarrierFormData({ ...carrierFormData, provinceId: e.target.value })} disabled={!carrierFormData.countryId}><option value="">-- Select Province --</option>{provinces.filter(p => p.countryId.toString() === carrierFormData.countryId).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                <div style={{ gridColumn: '1 / -1' }}><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>Address Detail</label><input style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8 }} value={carrierFormData.addressDetail} onChange={e => setCarrierFormData({ ...carrierFormData, addressDetail: e.target.value })} /></div>
                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>Contact</label><input style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8 }} value={carrierFormData.contactInfo} onChange={e => setCarrierFormData({ ...carrierFormData, contactInfo: e.target.value })} /></div>
              </div>
              <button type="submit" style={{ marginTop: 20, padding: '12px 24px', background: '#667eea', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>{editingCarrier ? 'Update Carrier' : 'Create Carrier'}</button>
            </form>
          )}

          <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: 16, textAlign: 'left', color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>TIN</th>
                <th style={{ padding: 16, textAlign: 'left', color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Name</th>
                <th style={{ padding: 16, textAlign: 'left', color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Address</th>
                <th style={{ padding: 16, textAlign: 'left', color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Location</th>
                <th style={{ padding: 16, textAlign: 'left', color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Contact</th>
                <th style={{ padding: 16, textAlign: 'right', color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Actions</th>
              </tr></thead>
              <tbody>
                {carriers.map(c => (
                  <tr key={c.vTin} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: 16, fontFamily: 'monospace', fontWeight: 600 }}>{c.vTin}</td>
                    <td style={{ padding: 16, fontWeight: 500 }}>{c.name}</td>
                    <td style={{ padding: 16, color: '#6b7280', fontSize: 13 }}>{c.addressDetail || '-'}</td>
                    <td style={{ padding: 16, color: '#6b7280', fontSize: 13 }}>
                      <div>{c.provinceName && c.countryName ? `${c.provinceName}, ${c.countryName}` : '-'}</div>
                      {c.longitude && c.latitude && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>📍 {c.latitude.toFixed(2)}, {c.longitude.toFixed(2)}</div>}
                    </td>
                    <td style={{ padding: 16, color: '#6b7280', fontSize: 13 }}>{c.contactInfo || '-'}</td>
                    <td style={{ padding: 16, textAlign: 'right' }}>
                      <button onClick={() => handleCarrierEditClick(c)} style={{ marginRight: 8, padding: '6px 12px', background: '#dbeafe', color: '#1e40af', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Edit</button>
                      <button onClick={() => handleDeleteCarrier(c.vTin)} style={{ padding: '6px 12px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* SHIPMENTS TAB */}
      {subTab === 'shipments' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Shipment Management</h2>
              <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: 14 }}>Track and manage deliveries</p>
            </div>
            <button onClick={() => { setShowShipmentForm(!showShipmentForm); setEditingShipment(null); setShipmentFormData({ status: '', destination: '', startLocation: '', distributorTin: '' }) }}
              style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 12px rgba(102,126,234,0.3)' }}>
              {showShipmentForm ? 'Close Form' : '+ Add Shipment'}
            </button>
          </div>

          {showShipmentForm && (
            <form onSubmit={handleShipmentSubmit} style={{ background: 'white', padding: 24, borderRadius: 16, marginBottom: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>Status *</label>
                  <select style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8 }} value={shipmentFormData.status} onChange={e => setShipmentFormData({ ...shipmentFormData, status: e.target.value })} required>
                    <option value="">-- Select Status --</option>
                    <option value="Pending">Pending</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>Destination</label><input style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8 }} value={shipmentFormData.destination} onChange={e => setShipmentFormData({ ...shipmentFormData, destination: e.target.value })} /></div>
                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>Start Location</label><input style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8 }} value={shipmentFormData.startLocation} onChange={e => setShipmentFormData({ ...shipmentFormData, startLocation: e.target.value })} /></div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>Distributor *</label>
                  <select style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8 }} value={shipmentFormData.distributorTin} onChange={e => setShipmentFormData({ ...shipmentFormData, distributorTin: e.target.value })} required>
                    <option value="">-- Select Distributor --</option>
                    {distributors.map(d => <option key={d.vTin} value={d.vTin}>{d.name}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" style={{ marginTop: 20, padding: '12px 24px', background: '#667eea', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>{editingShipment ? 'Update Shipment' : 'Create Shipment'}</button>
            </form>
          )}

          <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: 16, textAlign: 'left', color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>ID</th>
                <th style={{ padding: 16, textAlign: 'left', color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: 16, textAlign: 'left', color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Destination</th>
                <th style={{ padding: 16, textAlign: 'left', color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Start Location</th>
                <th style={{ padding: 16, textAlign: 'left', color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Distributor</th>
                <th style={{ padding: 16, textAlign: 'right', color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Actions</th>
              </tr></thead>
              <tbody>
                {shipments.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: 16, fontWeight: 600 }}>#{s.id}</td>
                    <td style={{ padding: 16 }}>{statusBadge(s.status)}</td>
                    <td style={{ padding: 16, color: '#374151', fontSize: 14 }}>{s.destination || '-'}</td>
                    <td style={{ padding: 16, color: '#374151', fontSize: 14 }}>{s.startLocation || '-'}</td>
                    <td style={{ padding: 16, color: '#6b7280', fontSize: 13 }}>{s.distributorName || s.distributorTin}</td>
                    <td style={{ padding: 16, textAlign: 'right' }}>
                      <button onClick={() => { setEditingShipment(s); setShipmentFormData({ status: s.status, destination: s.destination || '', startLocation: s.startLocation || '', distributorTin: s.distributorTin }); setShowShipmentForm(true) }} style={{ marginRight: 8, padding: '6px 12px', background: '#dbeafe', color: '#1e40af', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Edit</button>
                      <button onClick={() => handleDeleteShipment(s.id)} style={{ padding: '6px 12px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* TRANSPORT LEGS TAB */}
      {subTab === 'transportLegs' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Transport Legs</h2>
              <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: 14 }}>Manage transport routes and drivers</p>
            </div>
            <button onClick={() => { setShowTransportLegForm(!showTransportLegForm); setEditingTransportLeg(null); setTransportLegFormData({ shipmentId: '', driverName: '', regNo: '', temperatureProfile: '', startLocation: '', toLocation: '', departureTime: '', arrivalTime: '', carrierCompanyTin: '' }) }}
              style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 12px rgba(102,126,234,0.3)' }}>
              {showTransportLegForm ? 'Close Form' : '+ Add Leg'}
            </button>
          </div>

          {showTransportLegForm && (
            <form onSubmit={handleTransportLegSubmit} style={{ background: 'white', padding: 24, borderRadius: 16, marginBottom: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>Shipment ID *</label><select style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8 }} value={transportLegFormData.shipmentId} onChange={e => setTransportLegFormData({ ...transportLegFormData, shipmentId: e.target.value })} required><option value="">-- Select Shipment --</option>{shipments.map(s => <option key={s.id} value={s.id}>Shipment #{s.id} - {s.destination}</option>)}</select></div>
                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>Carrier Company *</label><select style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8 }} value={transportLegFormData.carrierCompanyTin} onChange={e => setTransportLegFormData({ ...transportLegFormData, carrierCompanyTin: e.target.value })} required><option value="">-- Select Carrier --</option>{carriers.map(c => <option key={c.vTin} value={c.vTin}>{c.name}</option>)}</select></div>
                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>Driver</label><input style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8 }} value={transportLegFormData.driverName} onChange={e => setTransportLegFormData({ ...transportLegFormData, driverName: e.target.value })} placeholder="Driver name" /></div>
                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>Vehicle Registration Number</label><input style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8 }} value={transportLegFormData.regNo} onChange={e => setTransportLegFormData({ ...transportLegFormData, regNo: e.target.value })} placeholder="e.g., 51A-12345" /></div>
                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>Temperature Profile</label><input style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8 }} value={transportLegFormData.temperatureProfile} onChange={e => setTransportLegFormData({ ...transportLegFormData, temperatureProfile: e.target.value })} placeholder="e.g., 2-8°C" /></div>
                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>From (Start Location) *</label><input style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8 }} value={transportLegFormData.startLocation} onChange={e => setTransportLegFormData({ ...transportLegFormData, startLocation: e.target.value })} required /></div>
                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>To (End Location) *</label><input style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8 }} value={transportLegFormData.toLocation} onChange={e => setTransportLegFormData({ ...transportLegFormData, toLocation: e.target.value })} required /></div>
                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>Departure Time</label><input type="datetime-local" style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8 }} value={transportLegFormData.departureTime} onChange={e => setTransportLegFormData({ ...transportLegFormData, departureTime: e.target.value })} /></div>
                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>Arrival Time</label><input type="datetime-local" style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8 }} value={transportLegFormData.arrivalTime} onChange={e => setTransportLegFormData({ ...transportLegFormData, arrivalTime: e.target.value })} /></div>
              </div>
              <button type="submit" style={{ marginTop: 20, padding: '12px 24px', background: '#667eea', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>{editingTransportLeg ? 'Update Leg' : 'Create Leg'}</button>
            </form>
          )}

          <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: 16, textAlign: 'left', color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Leg ID</th>
                <th style={{ padding: 16, textAlign: 'left', color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Shipment</th>
                <th style={{ padding: 16, textAlign: 'left', color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Route</th>
                <th style={{ padding: 16, textAlign: 'left', color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Schedule</th>
                <th style={{ padding: 16, textAlign: 'left', color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Carrier</th>
                <th style={{ padding: 16, textAlign: 'left', color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Driver</th>
                <th style={{ padding: 16, textAlign: 'left', color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Vehicle</th>
                <th style={{ padding: 16, textAlign: 'right', color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Actions</th>
              </tr></thead>
              <tbody>
                {transportLegs.map(t => (
                  <tr key={t.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: 16, fontWeight: 600, fontSize: 14 }}>#{t.id}</td>
                    <td style={{ padding: 16, color: '#6b7280', fontSize: 13 }}>Shipment #{t.shipmentId}</td>
                    <td style={{ padding: 16, color: '#374151', fontSize: 13 }}>{t.startLocation} → {t.toLocation}</td>
                    <td style={{ padding: 16, fontSize: 12, color: '#6b7280' }}>{t.departureTime || t.arrivalTime ? (<><div>{t.departureTime ? (<><strong>FROM</strong> {new Date(t.departureTime).toLocaleString('vi-VN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</>) : '-'}</div><div style={{ marginTop: 2 }}>{t.arrivalTime ? (<><strong>TO</strong> {new Date(t.arrivalTime).toLocaleString('vi-VN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</>) : '-'}</div></>) : '-'}</td>
                    <td style={{ padding: 16, color: '#6b7280', fontSize: 13 }}>{carriers.find(c => c.vTin === t.carrierCompanyTin)?.name || '-'}</td>
                    <td style={{ padding: 16, color: '#6b7280', fontSize: 13 }}>{t.driverName || '-'}</td>
                    <td style={{ padding: 16, color: '#6b7280', fontSize: 13, fontFamily: 'monospace', fontWeight: 600 }}>{t.regNo || '-'}</td>
                    <td style={{ padding: 16, textAlign: 'right' }}>
                      <button onClick={() => { setEditingTransportLeg(t); setTransportLegFormData({ shipmentId: t.shipmentId.toString(), driverName: t.driverName || '', regNo: t.regNo || '', temperatureProfile: t.temperatureProfile || '', startLocation: t.startLocation, toLocation: t.toLocation, departureTime: t.departureTime ? new Date(t.departureTime).toISOString().slice(0, 16) : '', arrivalTime: t.arrivalTime ? new Date(t.arrivalTime).toISOString().slice(0, 16) : '', carrierCompanyTin: t.carrierCompanyTin }); setShowTransportLegForm(true) }} style={{ marginRight: 8, padding: '6px 12px', background: '#dbeafe', color: '#1e40af', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Edit</button>
                      <button onClick={() => handleDeleteTransportLeg(t.id)} style={{ padding: '6px 12px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Delete</button>
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
            <p style={{ margin: '0 0 24px 0', color: '#6b7280', fontSize: 15 }}>Are you sure you want to delete this {deleteConfirm.type}? This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => setDeleteConfirm({ show: false, type: 'carrier', id: null })} style={{ padding: '10px 20px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button onClick={deleteConfirm.type === 'carrier' ? confirmDeleteCarrier : deleteConfirm.type === 'shipment' ? confirmDeleteShipment : confirmDeleteTransportLeg} style={{ padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Delete</button>
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