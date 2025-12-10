import React, { useState, useEffect } from 'react'
import axios from 'axios'

const baseUrl = 'http://localhost:5000'

// --- Interfaces ---
interface CarrierCompany {
  vTin: string
  name: string
  addressDetail?: string
  contactInfo?: string
  transportLegCount?: number
}

interface Shipment {
  id: number
  status: string
  departuredTime?: string
  arrivalTime?: string
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
  temperatureProfile?: string
  startLocation: string
  toLocation: string
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

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Forms State
  const [showCarrierForm, setShowCarrierForm] = useState(false)
  const [carrierFormData, setCarrierFormData] = useState({ vTin: '', name: '', addressDetail: '', contactInfo: '' })
  const [editingCarrier, setEditingCarrier] = useState<CarrierCompany | null>(null)

  const [showShipmentForm, setShowShipmentForm] = useState(false)
  const [shipmentFormData, setShipmentFormData] = useState({ status: '', destination: '', startLocation: '', distributorTin: '' })
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null)

  const [showTransportLegForm, setShowTransportLegForm] = useState(false)
  const [transportLegFormData, setTransportLegFormData] = useState({ shipmentId: '', driverName: '', temperatureProfile: '', startLocation: '', toLocation: '', carrierCompanyTin: '' })
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

  const tabButtonStyle = (active: boolean) => ({
    padding: '8px 16px',
    borderRadius: 8,
    border: active ? '2px solid #667eea' : '1px solid #e5e7eb',
    background: active ? '#eef2ff' : 'white',
    color: active ? '#667eea' : '#6b7280',
    fontSize: 14,
    fontWeight: active ? 600 : 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginRight: 8
  })

  const statusBadge = (status: string) => {
    let bg = '#f3f4f6'; let color = '#374151';
    if (status === 'Delivered') { bg = '#dcfce7'; color = '#166534'; }
    else if (status === 'In Transit') { bg = '#dbeafe'; color = '#1e40af'; }
    else if (status === 'Pending') { bg = '#fef3c7'; color = '#92400e'; }
    else if (status === 'Cancelled') { bg = '#fee2e2'; color = '#991b1b'; }

    return (
      <span style={{ padding: '4px 12px', background: bg, color: color, borderRadius: 999, fontSize: 12, fontWeight: 600 }}>
        {status}
      </span>
    )
  }

  // --- Fetch Data ---
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
    if (subTab === 'carriers') fetchCarriers()
    else if (subTab === 'shipments') { fetchShipments(); fetchDistributors() }
    else { fetchTransportLegs(); fetchCarriers(); fetchShipments() }
  }, [subTab])

  // --- Handlers ---
  const handleCarrierSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try {
      if (editingCarrier) await axios.patch(`${baseUrl}/api/logistics/carriers/${editingCarrier.vTin}`, carrierFormData)
      else await axios.post(`${baseUrl}/api/logistics/carriers`, carrierFormData)
      resetForms(); setCarrierFormData({ vTin: '', name: '', addressDetail: '', contactInfo: '' }); fetchCarriers()
    } catch (err: any) { setError(err.response?.data?.message || err.message) } finally { setLoading(false) }
  }

  const handleDeleteCarrier = async (tin: string) => {
    if (!confirm('Delete this carrier?')) return; setLoading(true)
    try { await axios.delete(`${baseUrl}/api/logistics/carriers/${tin}`); fetchCarriers() } catch (err: any) { setError(err.response?.data?.message || err.message) } finally { setLoading(false) }
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
    if (!confirm('Delete this shipment?')) return; setLoading(true)
    try { await axios.delete(`${baseUrl}/api/logistics/shipments/${id}`); fetchShipments() } catch (err: any) { setError(err.response?.data?.message || err.message) } finally { setLoading(false) }
  }

  const handleTransportLegSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try {
      const payload = { shipmentId: parseInt(transportLegFormData.shipmentId), driverName: transportLegFormData.driverName, temperatureProfile: transportLegFormData.temperatureProfile, startLocation: transportLegFormData.startLocation, toLocation: transportLegFormData.toLocation, carrierCompanyTin: transportLegFormData.carrierCompanyTin }
      if (editingTransportLeg) await axios.patch(`${baseUrl}/api/logistics/transport-legs/${editingTransportLeg.id}`, payload)
      else await axios.post(`${baseUrl}/api/logistics/transport-legs`, payload)
      resetForms(); setTransportLegFormData({ shipmentId: '', driverName: '', temperatureProfile: '', startLocation: '', toLocation: '', carrierCompanyTin: '' }); fetchTransportLegs()
    } catch (err: any) { setError(err.response?.data?.message || err.message) } finally { setLoading(false) }
  }

  const handleDeleteTransportLeg = async (id: number) => {
    if (!confirm('Delete this transport leg?')) return; setLoading(true)
    try { await axios.delete(`${baseUrl}/api/logistics/transport-legs/${id}`); fetchTransportLegs() } catch (err: any) { setError(err.response?.data?.message || err.message) } finally { setLoading(false) }
  }

  // --- RENDER ---
  return (
    <div>
      {/* Sub-Tab Switcher */}
      <div style={{ display: 'flex', marginBottom: 24, background: 'white', padding: '12px', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <button onClick={() => { setSubTab('carriers'); resetForms() }} style={tabButtonStyle(subTab === 'carriers')}>🚚 Carriers</button>
        <button onClick={() => { setSubTab('shipments'); resetForms() }} style={tabButtonStyle(subTab === 'shipments')}>📦 Shipments</button>
        <button onClick={() => { setSubTab('transportLegs'); resetForms() }} style={tabButtonStyle(subTab === 'transportLegs')}>🛣️ Transport Legs</button>
      </div>

      {error && <div style={{ padding: 16, marginBottom: 24, background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 8, color: '#b91c1c' }}>Error: {error}</div>}

      {/* CARRIERS TAB */}
      {subTab === 'carriers' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0, color: '#374151' }}>Carrier Management</h2>
            <button onClick={() => { setShowCarrierForm(!showCarrierForm); setEditingCarrier(null); setCarrierFormData({ vTin: '', name: '', addressDetail: '', contactInfo: '' }) }}
              style={{ padding: '10px 20px', background: showCarrierForm ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, boxShadow: '0 2px 4px rgba(102,126,234,0.35)' }}>
              {showCarrierForm ? 'Cancel' : '+ Add Carrier'}
            </button>
          </div>

          {showCarrierForm && (
            <form onSubmit={handleCarrierSubmit} style={{ background: 'white', padding: 24, borderRadius: 12, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div><label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>TIN *</label><input style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8 }} value={carrierFormData.vTin} onChange={e => setCarrierFormData({ ...carrierFormData, vTin: e.target.value })} disabled={!!editingCarrier} required /></div>
                <div><label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Name *</label><input style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8 }} value={carrierFormData.name} onChange={e => setCarrierFormData({ ...carrierFormData, name: e.target.value })} required /></div>
                <div><label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Address Detail</label><input style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8 }} value={carrierFormData.addressDetail} onChange={e => setCarrierFormData({ ...carrierFormData, addressDetail: e.target.value })} /></div>
                <div><label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Contact</label><input style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8 }} value={carrierFormData.contactInfo} onChange={e => setCarrierFormData({ ...carrierFormData, contactInfo: e.target.value })} /></div>
              </div>
              <button type="submit" style={{ marginTop: 16, padding: '12px 24px', background: '#667eea', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
                {editingCarrier ? 'Update' : 'Create'}
              </button>
            </form>
          )}

          <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: 16, textAlign: 'left', color: '#374151', fontWeight: 600, fontSize: 14 }}>TIN</th>
                <th style={{ padding: 16, textAlign: 'left', color: '#374151', fontWeight: 600, fontSize: 14 }}>Name</th>
                <th style={{ padding: 16, textAlign: 'left', color: '#374151', fontWeight: 600, fontSize: 14 }}>Address</th>
                <th style={{ padding: 16, textAlign: 'left', color: '#374151', fontWeight: 600, fontSize: 14 }}>Contact</th>
                <th style={{ padding: 16, textAlign: 'right', color: '#374151', fontWeight: 600, fontSize: 14 }}>Actions</th>
              </tr></thead>
              <tbody>
                {carriers.map(c => (
                  <tr key={c.vTin} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: 16, fontFamily: 'monospace', fontWeight: 600, fontSize: 14 }}>{c.vTin}</td>
                    <td style={{ padding: 16, color: '#374151', fontSize: 14 }}>{c.name}</td>
                    <td style={{ padding: 16, color: '#6b7280', fontSize: 14 }}>{c.addressDetail || '-'}</td>
                    <td style={{ padding: 16, color: '#6b7280', fontSize: 14 }}>{c.contactInfo || '-'}</td>
                    <td style={{ padding: 16, textAlign: 'right' }}>
                      <button onClick={() => { setEditingCarrier(c); setCarrierFormData({ vTin: c.vTin, name: c.name, addressDetail: c.addressDetail || '', contactInfo: c.contactInfo || '' }); setShowCarrierForm(true) }}
                        style={{ marginRight: 8, padding: '6px 12px', border: '1px solid #667eea', color: '#667eea', borderRadius: 6, background: 'white', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Edit</button>
                      <button onClick={() => handleDeleteCarrier(c.vTin)}
                        style={{ padding: '6px 12px', border: '1px solid #dc2626', color: '#dc2626', borderRadius: 6, background: 'white', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Delete</button>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0, color: '#374151' }}>Shipment Management</h2>
            <button onClick={() => { setShowShipmentForm(!showShipmentForm); setEditingShipment(null); setShipmentFormData({ status: '', destination: '', startLocation: '', distributorTin: '' }) }}
              style={{ padding: '10px 20px', background: showShipmentForm ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, boxShadow: '0 2px 4px rgba(102,126,234,0.35)' }}>
              {showShipmentForm ? 'Cancel' : '+ Add Shipment'}
            </button>
          </div>

          {showShipmentForm && (
            <form onSubmit={handleShipmentSubmit} style={{ background: 'white', padding: 24, borderRadius: 12, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Status *</label>
                  <select style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8 }} value={shipmentFormData.status} onChange={e => setShipmentFormData({ ...shipmentFormData, status: e.target.value })} required>
                    <option value="">Select Status</option>
                    <option value="Pending">Pending</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div><label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Destination</label><input style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8 }} value={shipmentFormData.destination} onChange={e => setShipmentFormData({ ...shipmentFormData, destination: e.target.value })} /></div>
                <div><label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Start Location</label><input style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8 }} value={shipmentFormData.startLocation} onChange={e => setShipmentFormData({ ...shipmentFormData, startLocation: e.target.value })} /></div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Distributor *</label>
                  <select style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8 }} value={shipmentFormData.distributorTin} onChange={e => setShipmentFormData({ ...shipmentFormData, distributorTin: e.target.value })} required>
                    <option value="">Select Distributor</option>
                    {distributors.map(d => <option key={d.vTin} value={d.vTin}>{d.name}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" style={{ marginTop: 16, padding: '12px 24px', background: '#667eea', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
                {editingShipment ? 'Update' : 'Create'}
              </button>
            </form>
          )}

          <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: 16, textAlign: 'left', color: '#374151', fontWeight: 600, fontSize: 14 }}>ID</th>
                <th style={{ padding: 16, textAlign: 'left', color: '#374151', fontWeight: 600, fontSize: 14 }}>Status</th>
                <th style={{ padding: 16, textAlign: 'left', color: '#374151', fontWeight: 600, fontSize: 14 }}>Destination</th>
                <th style={{ padding: 16, textAlign: 'left', color: '#374151', fontWeight: 600, fontSize: 14 }}>Start Location</th>
                <th style={{ padding: 16, textAlign: 'left', color: '#374151', fontWeight: 600, fontSize: 14 }}>Distributor</th>
                <th style={{ padding: 16, textAlign: 'left', color: '#374151', fontWeight: 600, fontSize: 14 }}>Times</th>
                <th style={{ padding: 16, textAlign: 'right', color: '#374151', fontWeight: 600, fontSize: 14 }}>Actions</th>
              </tr></thead>
              <tbody>
                {shipments.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: 16, fontWeight: 600, fontSize: 14 }}>#{s.id}</td>
                    <td style={{ padding: 16 }}>{statusBadge(s.status)}</td>
                    <td style={{ padding: 16, color: '#374151', fontSize: 14 }}>{s.destination || '-'}</td>
                    <td style={{ padding: 16, color: '#374151', fontSize: 14 }}>{s.startLocation || '-'}</td>
                    <td style={{ padding: 16, color: '#6b7280', fontSize: 14 }}>{s.distributorName || s.distributorTin}</td>
                    <td style={{ padding: 16, fontSize: 13, color: '#6b7280' }}>
                      {s.departuredTime && <div>Dep: {new Date(s.departuredTime).toLocaleString('vi-VN')}</div>}
                      {s.arrivalTime && <div>Arr: {new Date(s.arrivalTime).toLocaleString('vi-VN')}</div>}
                    </td>
                    <td style={{ padding: 16, textAlign: 'right' }}>
                      <button onClick={() => { setEditingShipment(s); setShipmentFormData({ status: s.status, destination: s.destination || '', startLocation: s.startLocation || '', distributorTin: s.distributorTin }); setShowShipmentForm(true) }}
                        style={{ marginRight: 8, padding: '6px 12px', border: '1px solid #667eea', color: '#667eea', borderRadius: 6, background: 'white', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Edit</button>
                      <button onClick={() => handleDeleteShipment(s.id)}
                        style={{ padding: '6px 12px', border: '1px solid #dc2626', color: '#dc2626', borderRadius: 6, background: 'white', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Delete</button>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0, color: '#374151' }}>Transport Legs</h2>
            <button onClick={() => { setShowTransportLegForm(!showTransportLegForm); setEditingTransportLeg(null); setTransportLegFormData({ shipmentId: '', driverName: '', temperatureProfile: '', startLocation: '', toLocation: '', carrierCompanyTin: '' }) }}
              style={{ padding: '10px 20px', background: showTransportLegForm ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, boxShadow: '0 2px 4px rgba(102,126,234,0.35)' }}>
              {showTransportLegForm ? 'Cancel' : '+ Add Leg'}
            </button>
          </div>

          {showTransportLegForm && (
            <form onSubmit={handleTransportLegSubmit} style={{ background: 'white', padding: 24, borderRadius: 12, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div><label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Shipment ID *</label><select style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8 }} value={transportLegFormData.shipmentId} onChange={e => setTransportLegFormData({ ...transportLegFormData, shipmentId: e.target.value })} required><option value="">Select Shipment</option>{shipments.map(s => <option key={s.id} value={s.id}>Shipment #{s.id} - {s.destination}</option>)}</select></div>
                <div><label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Carrier Company *</label><select style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8 }} value={transportLegFormData.carrierCompanyTin} onChange={e => setTransportLegFormData({ ...transportLegFormData, carrierCompanyTin: e.target.value })} required><option value="">Select Carrier</option>{carriers.map(c => <option key={c.vTin} value={c.vTin}>{c.name}</option>)}</select></div>
                <div><label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Driver</label><input style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8 }} value={transportLegFormData.driverName} onChange={e => setTransportLegFormData({ ...transportLegFormData, driverName: e.target.value })} placeholder="Driver name" /></div>
                <div><label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Temperature Profile</label><input style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8 }} value={transportLegFormData.temperatureProfile} onChange={e => setTransportLegFormData({ ...transportLegFormData, temperatureProfile: e.target.value })} placeholder="e.g., 2-8°C" /></div>
                <div><label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>From (Start Location) *</label><input style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8 }} value={transportLegFormData.startLocation} onChange={e => setTransportLegFormData({ ...transportLegFormData, startLocation: e.target.value })} required /></div>
                <div><label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>To (End Location) *</label><input style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8 }} value={transportLegFormData.toLocation} onChange={e => setTransportLegFormData({ ...transportLegFormData, toLocation: e.target.value })} required /></div>
              </div>
              <button type="submit" style={{ marginTop: 16, padding: '12px 24px', background: '#667eea', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
                {editingTransportLeg ? 'Update' : 'Create'}
              </button>
            </form>
          )}

          <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: 16, textAlign: 'left', color: '#374151', fontWeight: 600, fontSize: 14 }}>Leg ID</th>
                <th style={{ padding: 16, textAlign: 'left', color: '#374151', fontWeight: 600, fontSize: 14 }}>Shipment</th>
                <th style={{ padding: 16, textAlign: 'left', color: '#374151', fontWeight: 600, fontSize: 14 }}>Route</th>
                <th style={{ padding: 16, textAlign: 'left', color: '#374151', fontWeight: 600, fontSize: 14 }}>Driver</th>
                <th style={{ padding: 16, textAlign: 'right', color: '#374151', fontWeight: 600, fontSize: 14 }}>Actions</th>
              </tr></thead>
              <tbody>
                {transportLegs.map(t => (
                  <tr key={t.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: 16, fontWeight: 600, fontSize: 14 }}>#{t.id}</td>
                    <td style={{ padding: 16, color: '#6b7280', fontSize: 14 }}>Shipment #{t.shipmentId}</td>
                    <td style={{ padding: 16, color: '#374151', fontSize: 14 }}>{t.startLocation} → {t.toLocation}</td>
                    <td style={{ padding: 16, color: '#6b7280', fontSize: 14 }}>{t.driverName || '-'}</td>
                    <td style={{ padding: 16, textAlign: 'right' }}>
                      <button onClick={() => { setEditingTransportLeg(t); setTransportLegFormData({ shipmentId: t.shipmentId.toString(), driverName: t.driverName || '', temperatureProfile: t.temperatureProfile || '', startLocation: t.startLocation, toLocation: t.toLocation, carrierCompanyTin: t.carrierCompanyTin }); setShowTransportLegForm(true) }}
                        style={{ marginRight: 8, padding: '6px 12px', border: '1px solid #667eea', color: '#667eea', borderRadius: 6, background: 'white', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Edit</button>
                      <button onClick={() => handleDeleteTransportLeg(t.id)}
                        style={{ padding: '6px 12px', border: '1px solid #dc2626', color: '#dc2626', borderRadius: 6, background: 'white', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Delete</button>
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