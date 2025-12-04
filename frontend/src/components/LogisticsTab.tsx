import React, { useState, useEffect } from 'react'
import axios from 'axios'

const baseUrl = 'http://localhost:5000'

interface CarrierCompany {
  vTin: string
  name: string
  address?: string
  contactInfo?: string
  transportLegCount?: number
}

interface Shipment {
  id: number
  status: string
  departuredTime?: string
  arrivalTime?: string
  destination?: string
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

  // Carriers state
  const [carriers, setCarriers] = useState<CarrierCompany[]>([])
  const [distributors, setDistributors] = useState<Distributor[]>([])
  const [showCarrierForm, setShowCarrierForm] = useState(false)
  const [carrierFormData, setCarrierFormData] = useState({
    vTin: '',
    name: '',
    address: '',
    contactInfo: ''
  })
  const [editingCarrier, setEditingCarrier] = useState<CarrierCompany | null>(null)

  // Shipments state
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [showShipmentForm, setShowShipmentForm] = useState(false)
  const [shipmentFormData, setShipmentFormData] = useState({
    id: '',
    status: '',
    departuredTime: '',
    arrivalTime: '',
    destination: '',
    distributorTin: ''
  })
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null)

  // Transport Legs state
  const [transportLegs, setTransportLegs] = useState<TransportLeg[]>([])
  const [showTransportLegForm, setShowTransportLegForm] = useState(false)
  const [transportLegFormData, setTransportLegFormData] = useState({
    id: '',
    shipmentId: '',
    driverName: '',
    temperatureProfile: '',
    startLocation: '',
    toLocation: '',
    carrierCompanyTin: ''
  })
  const [editingTransportLeg, setEditingTransportLeg] = useState<TransportLeg | null>(null)

  // Common state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Fetch functions
  const fetchCarriers = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${baseUrl}/api/logistics/carriers`)
      setCarriers(res.data)
      setError('')
    } catch (err: any) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchShipments = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${baseUrl}/api/logistics/shipments`)
      setShipments(res.data)
      setError('')
    } catch (err: any) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchTransportLegs = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${baseUrl}/api/logistics/transport-legs`)
      setTransportLegs(res.data)
      setError('')
    } catch (err: any) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchDistributors = async () => {
    try {
      const res = await axios.get(`${baseUrl}/api/logistics/distributors`)
      setDistributors(res.data)
    } catch (err: any) {
      console.error('Failed to fetch distributors:', err)
    }
  }

  useEffect(() => {
    if (subTab === 'carriers') {
      fetchCarriers()
    } else if (subTab === 'shipments') {
      fetchShipments()
      fetchDistributors() // Need distributors for dropdown
    } else {
      fetchTransportLegs()
      fetchCarriers() // Need carriers for dropdown
      fetchShipments() // Need shipments for dropdown
    }
  }, [subTab])

  // Carrier handlers
  const handleCarrierSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingCarrier) {
        await axios.patch(`${baseUrl}/api/logistics/carriers/${editingCarrier.vTin}`, {
          name: carrierFormData.name,
          address: carrierFormData.address,
          contactInfo: carrierFormData.contactInfo
        })
      } else {
        await axios.post(`${baseUrl}/api/logistics/carriers`, carrierFormData)
      }
      setShowCarrierForm(false)
      setEditingCarrier(null)
      setCarrierFormData({ vTin: '', name: '', address: '', contactInfo: '' })
      fetchCarriers()
    } catch (err: any) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEditCarrier = (carrier: CarrierCompany) => {
    setEditingCarrier(carrier)
    setCarrierFormData({
      vTin: carrier.vTin,
      name: carrier.name,
      address: carrier.address || '',
      contactInfo: carrier.contactInfo || ''
    })
    setShowCarrierForm(true)
  }

  const handleDeleteCarrier = async (tin: string) => {
    if (!confirm('Are you sure you want to delete this carrier?')) return
    setLoading(true)
    try {
      await axios.delete(`${baseUrl}/api/logistics/carriers/${tin}`)
      fetchCarriers()
    } catch (err: any) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  // Shipment handlers
  const handleShipmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingShipment) {
        await axios.patch(`${baseUrl}/api/logistics/shipments/${editingShipment.id}`, {
          status: shipmentFormData.status,
          departuredTime: shipmentFormData.departuredTime || undefined,
          arrivalTime: shipmentFormData.arrivalTime || undefined,
          destination: shipmentFormData.destination,
          distributorTin: shipmentFormData.distributorTin
        })
      } else {
        await axios.post(`${baseUrl}/api/logistics/shipments`, {
          ...shipmentFormData,
          id: parseInt(shipmentFormData.id),
          departuredTime: shipmentFormData.departuredTime || undefined,
          arrivalTime: shipmentFormData.arrivalTime || undefined
        })
      }
      setShowShipmentForm(false)
      setEditingShipment(null)
      setShipmentFormData({ id: '', status: '', departuredTime: '', arrivalTime: '', destination: '', distributorTin: '' })
      fetchShipments()
    } catch (err: any) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEditShipment = (shipment: Shipment) => {
    setEditingShipment(shipment)
    setShipmentFormData({
      id: shipment.id.toString(),
      status: shipment.status,
      departuredTime: shipment.departuredTime ? new Date(shipment.departuredTime).toISOString().slice(0, 16) : '',
      arrivalTime: shipment.arrivalTime ? new Date(shipment.arrivalTime).toISOString().slice(0, 16) : '',
      destination: shipment.destination || '',
      distributorTin: shipment.distributorTin
    })
    setShowShipmentForm(true)
  }

  const handleDeleteShipment = async (id: number) => {
    if (!confirm('Are you sure you want to delete this shipment?')) return
    setLoading(true)
    try {
      await axios.delete(`${baseUrl}/api/logistics/shipments/${id}`)
      fetchShipments()
    } catch (err: any) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  // Transport Leg handlers
  const handleTransportLegSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingTransportLeg) {
        await axios.patch(`${baseUrl}/api/logistics/transport-legs/${editingTransportLeg.id}`, {
          shipmentId: parseInt(transportLegFormData.shipmentId),
          driverName: transportLegFormData.driverName,
          temperatureProfile: transportLegFormData.temperatureProfile,
          startLocation: transportLegFormData.startLocation,
          toLocation: transportLegFormData.toLocation,
          carrierCompanyTin: transportLegFormData.carrierCompanyTin
        })
      } else {
        await axios.post(`${baseUrl}/api/logistics/transport-legs`, {
          ...transportLegFormData,
          id: parseInt(transportLegFormData.id),
          shipmentId: parseInt(transportLegFormData.shipmentId)
        })
      }
      setShowTransportLegForm(false)
      setEditingTransportLeg(null)
      setTransportLegFormData({ id: '', shipmentId: '', driverName: '', temperatureProfile: '', startLocation: '', toLocation: '', carrierCompanyTin: '' })
      fetchTransportLegs()
    } catch (err: any) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEditTransportLeg = (leg: TransportLeg) => {
    setEditingTransportLeg(leg)
    setTransportLegFormData({
      id: leg.id.toString(),
      shipmentId: leg.shipmentId.toString(),
      driverName: leg.driverName || '',
      temperatureProfile: leg.temperatureProfile || '',
      startLocation: leg.startLocation,
      toLocation: leg.toLocation,
      carrierCompanyTin: leg.carrierCompanyTin
    })
    setShowTransportLegForm(true)
  }

  const handleDeleteTransportLeg = async (id: number) => {
    if (!confirm('Are you sure you want to delete this transport leg?')) return
    setLoading(true)
    try {
      await axios.delete(`${baseUrl}/api/logistics/transport-legs/${id}`)
      fetchTransportLegs()
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
            setSubTab('carriers')
            setShowCarrierForm(false)
            setShowShipmentForm(false)
            setShowTransportLegForm(false)
          }}
          style={{
            padding: '12px 24px',
            background: subTab === 'carriers' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
            color: subTab === 'carriers' ? 'white' : '#667eea',
            border: '2px solid #667eea',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Carrier Companies
        </button>
        <button
          onClick={() => {
            setSubTab('shipments')
            setShowCarrierForm(false)
            setShowShipmentForm(false)
            setShowTransportLegForm(false)
          }}
          style={{
            padding: '12px 24px',
            background: subTab === 'shipments' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
            color: subTab === 'shipments' ? 'white' : '#667eea',
            border: '2px solid #667eea',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Shipments
        </button>
        <button
          onClick={() => {
            setSubTab('transportLegs')
            setShowCarrierForm(false)
            setShowShipmentForm(false)
            setShowTransportLegForm(false)
          }}
          style={{
            padding: '12px 24px',
            background: subTab === 'transportLegs' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
            color: subTab === 'transportLegs' ? 'white' : '#667eea',
            border: '2px solid #667eea',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Transport Legs
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

      {/* CARRIERS TAB */}
      {subTab === 'carriers' && (
        <>
          {showCarrierForm && (
            <div style={{ background: 'white', padding: 24, borderRadius: 12, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ marginTop: 0, color: '#374151' }}>
                {editingCarrier ? 'Edit Carrier Company' : 'Add New Carrier Company'}
              </h2>
              <form onSubmit={handleCarrierSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {!editingCarrier && (
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                        TIN *
                      </label>
                      <input
                        type="text"
                        value={carrierFormData.vTin}
                        onChange={e => setCarrierFormData({ ...carrierFormData, vTin: e.target.value })}
                        required
                        style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: 8, fontSize: 16 }}
                      />
                    </div>
                  )}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                      Company Name *
                    </label>
                    <input
                      type="text"
                      value={carrierFormData.name}
                      onChange={e => setCarrierFormData({ ...carrierFormData, name: e.target.value })}
                      required
                      style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: 8, fontSize: 16 }}
                    />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                      Address
                    </label>
                    <input
                      type="text"
                      value={carrierFormData.address}
                      onChange={e => setCarrierFormData({ ...carrierFormData, address: e.target.value })}
                      style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: 8, fontSize: 16 }}
                    />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                      Contact Info
                    </label>
                    <input
                      type="text"
                      value={carrierFormData.contactInfo}
                      onChange={e => setCarrierFormData({ ...carrierFormData, contactInfo: e.target.value })}
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
                    {loading ? 'Saving...' : (editingCarrier ? 'Update' : 'Create')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCarrierForm(false)
                      setEditingCarrier(null)
                      setCarrierFormData({ vTin: '', name: '', address: '', contactInfo: '' })
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

          {!showCarrierForm && (
            <button
              onClick={() => setShowCarrierForm(true)}
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
              + Add New Carrier
            </button>
          )}

          <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>TIN</th>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Company Name</th>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Address</th>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Contact</th>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Legs</th>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>Loading...</td></tr>
                ) : carriers.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>No carriers found.</td></tr>
                ) : (
                  carriers.map((carrier, index) => (
                    <tr key={carrier.vTin} style={{ borderBottom: index < carriers.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                      <td style={{ padding: 16, fontWeight: 600 }}>{carrier.vTin}</td>
                      <td style={{ padding: 16 }}>{carrier.name}</td>
                      <td style={{ padding: 16, color: '#6b7280' }}>{carrier.address || '-'}</td>
                      <td style={{ padding: 16, color: '#6b7280' }}>{carrier.contactInfo || '-'}</td>
                      <td style={{ padding: 16, color: '#6b7280' }}>{carrier.transportLegCount || 0}</td>
                      <td style={{ padding: 16 }}>
                        <button onClick={() => handleEditCarrier(carrier)} style={{ padding: '6px 12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 4, fontSize: 14, cursor: 'pointer', marginRight: 8 }}>Edit</button>
                        <button onClick={() => handleDeleteCarrier(carrier.vTin)} style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 4, fontSize: 14, cursor: 'pointer' }}>Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* SHIPMENTS TAB */}
      {subTab === 'shipments' && (
        <>
          {showShipmentForm && (
            <div style={{ background: 'white', padding: 24, borderRadius: 12, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ marginTop: 0, color: '#374151' }}>
                {editingShipment ? 'Edit Shipment' : 'Add New Shipment'}
              </h2>
              <form onSubmit={handleShipmentSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {!editingShipment && (
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                        Shipment ID *
                      </label>
                      <input
                        type="number"
                        value={shipmentFormData.id}
                        onChange={e => setShipmentFormData({ ...shipmentFormData, id: e.target.value })}
                        required
                        style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: 8, fontSize: 16 }}
                      />
                    </div>
                  )}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                      Status *
                    </label>
                    <select
                      value={shipmentFormData.status}
                      onChange={e => setShipmentFormData({ ...shipmentFormData, status: e.target.value })}
                      required
                      style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: 8, fontSize: 16 }}
                    >
                      <option value="">Select status...</option>
                      <option value="Pending">Pending</option>
                      <option value="In Transit">In Transit</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                      Departure Time
                    </label>
                    <input
                      type="datetime-local"
                      value={shipmentFormData.departuredTime}
                      onChange={e => setShipmentFormData({ ...shipmentFormData, departuredTime: e.target.value })}
                      style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: 8, fontSize: 16 }}
                    />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                      Arrival Time
                    </label>
                    <input
                      type="datetime-local"
                      value={shipmentFormData.arrivalTime}
                      onChange={e => setShipmentFormData({ ...shipmentFormData, arrivalTime: e.target.value })}
                      style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: 8, fontSize: 16 }}
                    />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                      Destination
                    </label>
                    <input
                      type="text"
                      value={shipmentFormData.destination}
                      onChange={e => setShipmentFormData({ ...shipmentFormData, destination: e.target.value })}
                      style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: 8, fontSize: 16 }}
                    />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                      Distributor TIN *
                    </label>
                    <select
                      value={shipmentFormData.distributorTin}
                      onChange={e => setShipmentFormData({ ...shipmentFormData, distributorTin: e.target.value })}
                      required
                      style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: 8, fontSize: 16 }}
                    >
                      <option value="">Select Distributor</option>
                      {distributors.map(d => (
                        <option key={d.vTin} value={d.vTin}>
                          {d.vTin} - {d.name}
                        </option>
                      ))}
                    </select>
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
                    {loading ? 'Saving...' : (editingShipment ? 'Update' : 'Create')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowShipmentForm(false)
                      setEditingShipment(null)
                      setShipmentFormData({ id: '', status: '', departuredTime: '', arrivalTime: '', destination: '', distributorTin: '' })
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

          {!showShipmentForm && (
            <button
              onClick={() => setShowShipmentForm(true)}
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
              + Add New Shipment
            </button>
          )}

          <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>ID</th>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Status</th>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Destination</th>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Distributor</th>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Departure</th>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Arrival</th>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Legs</th>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>Loading...</td></tr>
                ) : shipments.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>No shipments found.</td></tr>
                ) : (
                  shipments.map((shipment, index) => (
                    <tr key={shipment.id} style={{ borderBottom: index < shipments.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                      <td style={{ padding: 16, fontWeight: 600 }}>{shipment.id}</td>
                      <td style={{ padding: 16 }}>
                        <span style={{
                          padding: '4px 12px',
                          background: shipment.status === 'Delivered' ? '#dcfce7' : shipment.status === 'In Transit' ? '#dbeafe' : '#f3f4f6',
                          color: shipment.status === 'Delivered' ? '#166534' : shipment.status === 'In Transit' ? '#1e40af' : '#374151',
                          borderRadius: 999,
                          fontSize: 14,
                          fontWeight: 600
                        }}>
                          {shipment.status}
                        </span>
                      </td>
                      <td style={{ padding: 16, color: '#6b7280' }}>{shipment.destination || '-'}</td>
                      <td style={{ padding: 16, color: '#6b7280' }}>{shipment.distributorName || shipment.distributorTin}</td>
                      <td style={{ padding: 16, color: '#6b7280' }}>{shipment.departuredTime ? new Date(shipment.departuredTime).toLocaleString('vi-VN') : '-'}</td>
                      <td style={{ padding: 16, color: '#6b7280' }}>{shipment.arrivalTime ? new Date(shipment.arrivalTime).toLocaleString('vi-VN') : '-'}</td>
                      <td style={{ padding: 16, color: '#6b7280' }}>{shipment.transportLegCount || 0}</td>
                      <td style={{ padding: 16 }}>
                        <button onClick={() => handleEditShipment(shipment)} style={{ padding: '6px 12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 4, fontSize: 14, cursor: 'pointer', marginRight: 8 }}>Edit</button>
                        <button onClick={() => handleDeleteShipment(shipment.id)} style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 4, fontSize: 14, cursor: 'pointer' }}>Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* TRANSPORT LEGS TAB */}
      {subTab === 'transportLegs' && (
        <>
          {showTransportLegForm && (
            <div style={{ background: 'white', padding: 24, borderRadius: 12, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ marginTop: 0, color: '#374151' }}>
                {editingTransportLeg ? 'Edit Transport Leg' : 'Add New Transport Leg'}
              </h2>
              <form onSubmit={handleTransportLegSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {!editingTransportLeg && (
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                        Transport Leg ID *
                      </label>
                      <input
                        type="number"
                        value={transportLegFormData.id}
                        onChange={e => setTransportLegFormData({ ...transportLegFormData, id: e.target.value })}
                        required
                        style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: 8, fontSize: 16 }}
                      />
                    </div>
                  )}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                      Shipment ID *
                    </label>
                    <select
                      value={transportLegFormData.shipmentId}
                      onChange={e => setTransportLegFormData({ ...transportLegFormData, shipmentId: e.target.value })}
                      required
                      style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: 8, fontSize: 16 }}
                    >
                      <option value="">Select Shipment</option>
                      {shipments.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.id} - {s.destination || 'No destination'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                      Driver Name
                    </label>
                    <input
                      type="text"
                      value={transportLegFormData.driverName}
                      onChange={e => setTransportLegFormData({ ...transportLegFormData, driverName: e.target.value })}
                      style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: 8, fontSize: 16 }}
                    />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                      Temperature Profile
                    </label>
                    <input
                      type="text"
                      value={transportLegFormData.temperatureProfile}
                      onChange={e => setTransportLegFormData({ ...transportLegFormData, temperatureProfile: e.target.value })}
                      placeholder="e.g., 2-8°C"
                      style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: 8, fontSize: 16 }}
                    />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                      Start Location *
                    </label>
                    <input
                      type="text"
                      value={transportLegFormData.startLocation}
                      onChange={e => setTransportLegFormData({ ...transportLegFormData, startLocation: e.target.value })}
                      required
                      style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: 8, fontSize: 16 }}
                    />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                      To Location *
                    </label>
                    <input
                      type="text"
                      value={transportLegFormData.toLocation}
                      onChange={e => setTransportLegFormData({ ...transportLegFormData, toLocation: e.target.value })}
                      required
                      style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: 8, fontSize: 16 }}
                    />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                      Carrier Company TIN *
                    </label>
                    <select
                      value={transportLegFormData.carrierCompanyTin}
                      onChange={e => setTransportLegFormData({ ...transportLegFormData, carrierCompanyTin: e.target.value })}
                      required
                      style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: 8, fontSize: 16 }}
                    >
                      <option value="">Select Carrier</option>
                      {carriers.map(c => (
                        <option key={c.vTin} value={c.vTin}>
                          {c.vTin} - {c.name}
                        </option>
                      ))}
                    </select>
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
                    {loading ? 'Saving...' : (editingTransportLeg ? 'Update' : 'Create')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowTransportLegForm(false)
                      setEditingTransportLeg(null)
                      setTransportLegFormData({ id: '', shipmentId: '', driverName: '', temperatureProfile: '', startLocation: '', toLocation: '', carrierCompanyTin: '' })
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

          {!showTransportLegForm && (
            <button
              onClick={() => setShowTransportLegForm(true)}
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
              + Add New Transport Leg
            </button>
          )}

          <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>ID</th>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Shipment</th>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Driver</th>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Route</th>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Temperature</th>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Carrier</th>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>Loading...</td></tr>
                ) : transportLegs.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>No transport legs found.</td></tr>
                ) : (
                  transportLegs.map((leg, index) => (
                    <tr key={leg.id} style={{ borderBottom: index < transportLegs.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                      <td style={{ padding: 16, fontWeight: 600 }}>{leg.id}</td>
                      <td style={{ padding: 16, color: '#6b7280' }}>#{leg.shipmentId} → {leg.shipmentDestination || '-'}</td>
                      <td style={{ padding: 16, color: '#6b7280' }}>{leg.driverName || '-'}</td>
                      <td style={{ padding: 16, color: '#6b7280' }}>{leg.startLocation} → {leg.toLocation}</td>
                      <td style={{ padding: 16, color: '#6b7280' }}>{leg.temperatureProfile || '-'}</td>
                      <td style={{ padding: 16, color: '#6b7280' }}>{leg.carrierCompanyName || leg.carrierCompanyTin}</td>
                      <td style={{ padding: 16 }}>
                        <button onClick={() => handleEditTransportLeg(leg)} style={{ padding: '6px 12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 4, fontSize: 14, cursor: 'pointer', marginRight: 8 }}>Edit</button>
                        <button onClick={() => handleDeleteTransportLeg(leg.id)} style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 4, fontSize: 14, cursor: 'pointer' }}>Delete</button>
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
