import React, { useState, useEffect } from 'react'
import axios from 'axios'

const baseUrl = 'http://localhost:5000'

interface ProcessingFacility {
  id: number
  name: string
  address: string
  contactInfo: string
  licenseNumber: string
  processingCount?: number
}

interface ProcessingOperation {
  id: number
  packagingDate: string
  weightPerUnit: number
  processedBy?: string
  packagingType?: string
  processingDate?: string
  facilityId: number
  facilityName?: string
  batchId: number
  productName?: string
}

export default function ProcessingTab() {
  const [subTab, setSubTab] = useState<'facilities' | 'operations'>('facilities')

  // Facilities state
  const [facilities, setFacilities] = useState<ProcessingFacility[]>([])
  const [showFacilityForm, setShowFacilityForm] = useState(false)
  const [facilityFormData, setFacilityFormData] = useState({
    id: '',
    name: '',
    address: '',
    contactInfo: '',
    licenseNumber: ''
  })
  const [editingFacility, setEditingFacility] = useState<ProcessingFacility | null>(null)

  // Operations state
  const [operations, setOperations] = useState<ProcessingOperation[]>([])
  const [showOperationForm, setShowOperationForm] = useState(false)
  const [operationFormData, setOperationFormData] = useState({
    id: '',
    packagingDate: '',
    weightPerUnit: '',
    processedBy: '',
    packagingType: '',
    processingDate: '',
    facilityId: '',
    batchId: ''
  })
  const [editingOperation, setEditingOperation] = useState<ProcessingOperation | null>(null)

  // Common state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Fetch facilities
  const fetchFacilities = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${baseUrl}/api/processing/facilities`)
      setFacilities(res.data)
      setError('')
    } catch (err: any) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  // Fetch operations
  const fetchOperations = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${baseUrl}/api/processing/operations`)
      setOperations(res.data)
      setError('')
    } catch (err: any) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (subTab === 'facilities') {
      fetchFacilities()
    } else {
      fetchOperations()
    }
  }, [subTab])

  // Facility handlers
  const handleFacilitySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingFacility) {
        await axios.patch(`${baseUrl}/api/processing/facilities/${editingFacility.id}`, {
          name: facilityFormData.name,
          address: facilityFormData.address,
          contactInfo: facilityFormData.contactInfo,
          licenseNumber: facilityFormData.licenseNumber
        })
      } else {
        await axios.post(`${baseUrl}/api/processing/facilities`, {
          ...facilityFormData,
          id: parseInt(facilityFormData.id)
        })
      }
      setShowFacilityForm(false)
      setEditingFacility(null)
      setFacilityFormData({ id: '', name: '', address: '', contactInfo: '', licenseNumber: '' })
      fetchFacilities()
    } catch (err: any) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEditFacility = (facility: ProcessingFacility) => {
    setEditingFacility(facility)
    setFacilityFormData({
      id: facility.id.toString(),
      name: facility.name,
      address: facility.address,
      contactInfo: facility.contactInfo || '',
      licenseNumber: facility.licenseNumber
    })
    setShowFacilityForm(true)
  }

  const handleDeleteFacility = async (id: number) => {
    if (!confirm('Are you sure you want to delete this facility?')) return
    setLoading(true)
    try {
      await axios.delete(`${baseUrl}/api/processing/facilities/${id}`)
      fetchFacilities()
    } catch (err: any) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  // Operation handlers
  const handleOperationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingOperation) {
        await axios.patch(`${baseUrl}/api/processing/operations/${editingOperation.id}`, {
          packagingDate: operationFormData.packagingDate,
          weightPerUnit: parseFloat(operationFormData.weightPerUnit),
          processedBy: operationFormData.processedBy,
          packagingType: operationFormData.packagingType,
          processingDate: operationFormData.processingDate || undefined,
          facilityId: parseInt(operationFormData.facilityId),
          batchId: parseInt(operationFormData.batchId)
        })
      } else {
        await axios.post(`${baseUrl}/api/processing/operations`, {
          id: parseInt(operationFormData.id),
          packagingDate: operationFormData.packagingDate,
          weightPerUnit: parseFloat(operationFormData.weightPerUnit),
          processedBy: operationFormData.processedBy,
          packagingType: operationFormData.packagingType,
          processingDate: operationFormData.processingDate || undefined,
          facilityId: parseInt(operationFormData.facilityId),
          batchId: parseInt(operationFormData.batchId)
        })
      }
      setShowOperationForm(false)
      setEditingOperation(null)
      setOperationFormData({
        id: '', packagingDate: '', weightPerUnit: '', processedBy: '',
        packagingType: '', processingDate: '', facilityId: '', batchId: ''
      })
      fetchOperations()
    } catch (err: any) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEditOperation = (operation: ProcessingOperation) => {
    setEditingOperation(operation)
    setOperationFormData({
      id: operation.id.toString(),
      packagingDate: operation.packagingDate ? new Date(operation.packagingDate).toISOString().split('T')[0] : '',
      weightPerUnit: operation.weightPerUnit.toString(),
      processedBy: operation.processedBy || '',
      packagingType: operation.packagingType || '',
      processingDate: operation.processingDate ? new Date(operation.processingDate).toISOString().split('T')[0] : '',
      facilityId: operation.facilityId.toString(),
      batchId: operation.batchId.toString()
    })
    setShowOperationForm(true)
  }

  const handleDeleteOperation = async (id: number) => {
    if (!confirm('Are you sure you want to delete this operation?')) return
    setLoading(true)
    try {
      await axios.delete(`${baseUrl}/api/processing/operations/${id}`)
      fetchOperations()
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
            setSubTab('facilities')
            setShowFacilityForm(false)
            setShowOperationForm(false)
            setEditingFacility(null)
            setEditingOperation(null)
          }}
          style={{
            padding: '12px 24px',
            background: subTab === 'facilities' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
            color: subTab === 'facilities' ? 'white' : '#667eea',
            border: '2px solid #667eea',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Processing Facilities
        </button>
        <button
          onClick={() => {
            setSubTab('operations')
            setShowFacilityForm(false)
            setShowOperationForm(false)
            setEditingFacility(null)
            setEditingOperation(null)
          }}
          style={{
            padding: '12px 24px',
            background: subTab === 'operations' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
            color: subTab === 'operations' ? 'white' : '#667eea',
            border: '2px solid #667eea',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Processing Operations
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

      {/* FACILITIES TAB */}
      {subTab === 'facilities' && (
        <>
          {/* Facility Form */}
          {showFacilityForm && (
            <div style={{
              background: 'white',
              padding: 24,
              borderRadius: 12,
              marginBottom: 24,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ marginTop: 0, color: '#374151' }}>
                {editingFacility ? 'Edit Processing Facility' : 'Add New Processing Facility'}
              </h2>
              <form onSubmit={handleFacilitySubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {/* ID */}
                  {!editingFacility && (
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                        Facility ID *
                      </label>
                      <input
                        type="number"
                        value={facilityFormData.id}
                        onChange={e => setFacilityFormData({ ...facilityFormData, id: e.target.value })}
                        required
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '2px solid #e5e7eb',
                          borderRadius: 8,
                          fontSize: 16
                        }}
                      />
                    </div>
                  )}

                  {/* Name */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                      Facility Name *
                    </label>
                    <input
                      type="text"
                      value={facilityFormData.name}
                      onChange={e => setFacilityFormData({ ...facilityFormData, name: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: 8,
                        fontSize: 16
                      }}
                    />
                  </div>

                  {/* Address */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                      Address *
                    </label>
                    <input
                      type="text"
                      value={facilityFormData.address}
                      onChange={e => setFacilityFormData({ ...facilityFormData, address: e.target.value })}
                      required
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
                      Contact Info
                    </label>
                    <input
                      type="text"
                      value={facilityFormData.contactInfo}
                      onChange={e => setFacilityFormData({ ...facilityFormData, contactInfo: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: 8,
                        fontSize: 16
                      }}
                    />
                  </div>

                  {/* License Number */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                      License Number *
                    </label>
                    <input
                      type="text"
                      value={facilityFormData.licenseNumber}
                      onChange={e => setFacilityFormData({ ...facilityFormData, licenseNumber: e.target.value })}
                      required
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
                    {loading ? 'Saving...' : (editingFacility ? 'Update' : 'Create')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowFacilityForm(false)
                      setEditingFacility(null)
                      setFacilityFormData({ id: '', name: '', address: '', contactInfo: '', licenseNumber: '' })
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

          {/* Add Button */}
          {!showFacilityForm && (
            <button
              onClick={() => setShowFacilityForm(true)}
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
              + Add New Facility
            </button>
          )}

          {/* Facilities Table */}
          <div style={{
            background: 'white',
            borderRadius: 12,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>ID</th>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Name</th>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Address</th>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Contact</th>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>License #</th>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Operations</th>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>
                      Loading...
                    </td>
                  </tr>
                ) : facilities.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>
                      No facilities found. Add your first facility!
                    </td>
                  </tr>
                ) : (
                  facilities.map((facility, index) => (
                    <tr
                      key={facility.id}
                      style={{
                        borderBottom: index < facilities.length - 1 ? '1px solid #e5e7eb' : 'none'
                      }}
                    >
                      <td style={{ padding: 16, fontWeight: 600 }}>{facility.id}</td>
                      <td style={{ padding: 16 }}>{facility.name}</td>
                      <td style={{ padding: 16, color: '#6b7280' }}>{facility.address}</td>
                      <td style={{ padding: 16, color: '#6b7280' }}>{facility.contactInfo || '-'}</td>
                      <td style={{ padding: 16, color: '#6b7280' }}>{facility.licenseNumber}</td>
                      <td style={{ padding: 16, color: '#6b7280' }}>{facility.processingCount || 0}</td>
                      <td style={{ padding: 16 }}>
                        <button
                          onClick={() => handleEditFacility(facility)}
                          style={{
                            padding: '6px 12px',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: 4,
                            fontSize: 14,
                            cursor: 'pointer',
                            marginRight: 8
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteFacility(facility.id)}
                          style={{
                            padding: '6px 12px',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: 4,
                            fontSize: 14,
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
        </>
      )}

      {/* OPERATIONS TAB */}
      {subTab === 'operations' && (
        <>
          {/* Operation Form */}
          {showOperationForm && (
            <div style={{
              background: 'white',
              padding: 24,
              borderRadius: 12,
              marginBottom: 24,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ marginTop: 0, color: '#374151' }}>
                {editingOperation ? 'Edit Processing Operation' : 'Add New Processing Operation'}
              </h2>
              <form onSubmit={handleOperationSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {/* ID */}
                  {!editingOperation && (
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                        Operation ID *
                      </label>
                      <input
                        type="number"
                        value={operationFormData.id}
                        onChange={e => setOperationFormData({ ...operationFormData, id: e.target.value })}
                        required
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '2px solid #e5e7eb',
                          borderRadius: 8,
                          fontSize: 16
                        }}
                      />
                    </div>
                  )}

                  {/* Facility ID */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                      Facility ID *
                    </label>
                    <select
                      value={operationFormData.facilityId}
                      onChange={e => setOperationFormData({ ...operationFormData, facilityId: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: 8,
                        fontSize: 16
                      }}
                    >
                      <option value="">Select Facility</option>
                      {facilities.map(f => (
                        <option key={f.id} value={f.id}>{f.id} - {f.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Batch ID */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                      Batch ID *
                    </label>
                    <input
                      type="number"
                      value={operationFormData.batchId}
                      onChange={e => setOperationFormData({ ...operationFormData, batchId: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: 8,
                        fontSize: 16
                      }}
                    />
                  </div>

                  {/* Packaging Date */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                      Packaging Date *
                    </label>
                    <input
                      type="date"
                      value={operationFormData.packagingDate}
                      onChange={e => setOperationFormData({ ...operationFormData, packagingDate: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: 8,
                        fontSize: 16
                      }}
                    />
                  </div>

                  {/* Processing Date */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                      Processing Date
                    </label>
                    <input
                      type="date"
                      value={operationFormData.processingDate}
                      onChange={e => setOperationFormData({ ...operationFormData, processingDate: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: 8,
                        fontSize: 16
                      }}
                    />
                  </div>

                  {/* Weight Per Unit */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                      Weight Per Unit (kg) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={operationFormData.weightPerUnit}
                      onChange={e => setOperationFormData({ ...operationFormData, weightPerUnit: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: 8,
                        fontSize: 16
                      }}
                    />
                  </div>

                  {/* Packaging Type */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                      Packaging Type
                    </label>
                    <input
                      type="text"
                      value={operationFormData.packagingType}
                      onChange={e => setOperationFormData({ ...operationFormData, packagingType: e.target.value })}
                      placeholder="e.g., Vacuum sealed, Plastic bag"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: 8,
                        fontSize: 16
                      }}
                    />
                  </div>

                  {/* Processed By */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                      Processed By
                    </label>
                    <input
                      type="text"
                      value={operationFormData.processedBy}
                      onChange={e => setOperationFormData({ ...operationFormData, processedBy: e.target.value })}
                      placeholder="Name of processor"
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
                    {loading ? 'Saving...' : (editingOperation ? 'Update' : 'Create')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowOperationForm(false)
                      setEditingOperation(null)
                      setOperationFormData({
                        id: '', packagingDate: '', weightPerUnit: '', processedBy: '',
                        packagingType: '', processingDate: '', facilityId: '', batchId: ''
                      })
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

          {/* Add Button */}
          {!showOperationForm && (
            <button
              onClick={() => setShowOperationForm(true)}
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
              + Add New Operation
            </button>
          )}

          {/* Operations Table */}
          <div style={{
            background: 'white',
            borderRadius: 12,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>ID</th>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Facility</th>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Batch/Product</th>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Processing Date</th>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Packaging Date</th>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Weight/Unit</th>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>
                      Loading...
                    </td>
                  </tr>
                ) : operations.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>
                      No operations found. Add your first operation!
                    </td>
                  </tr>
                ) : (
                  operations.map((operation, index) => (
                    <tr
                      key={operation.id}
                      style={{
                        borderBottom: index < operations.length - 1 ? '1px solid #e5e7eb' : 'none'
                      }}
                    >
                      <td style={{ padding: 16, fontWeight: 600 }}>{operation.id}</td>
                      <td style={{ padding: 16, color: '#6b7280' }}>{operation.facilityName || `Facility #${operation.facilityId}`}</td>
                      <td style={{ padding: 16, color: '#6b7280' }}>{operation.productName || `Batch #${operation.batchId}`}</td>
                      <td style={{ padding: 16, color: '#6b7280' }}>
                        {operation.processingDate ? new Date(operation.processingDate).toLocaleDateString() : '-'}
                      </td>
                      <td style={{ padding: 16, color: '#6b7280' }}>
                        {new Date(operation.packagingDate).toLocaleDateString()}
                      </td>
                      <td style={{ padding: 16, color: '#6b7280' }}>{operation.weightPerUnit} kg</td>
                      <td style={{ padding: 16 }}>
                        <button
                          onClick={() => handleEditOperation(operation)}
                          style={{
                            padding: '6px 12px',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: 4,
                            fontSize: 14,
                            cursor: 'pointer',
                            marginRight: 8
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteOperation(operation.id)}
                          style={{
                            padding: '6px 12px',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: 4,
                            fontSize: 14,
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
        </>
      )}
    </div>
  )
}
