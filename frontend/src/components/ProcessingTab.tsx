import React, { useState, useEffect } from 'react'
import axios from 'axios'

const baseUrl = 'http://localhost:5000'

// --- Interfaces ---
interface Country { id: number; name: string }
interface Province { id: number; name: string; countryId: number }
interface ProcessingFacility { 
  id: number; name: string; addressDetail: string; contactInfo?: string; licenseNumber: string; 
  longitude?: number; latitude?: number; 
  provinceId?: number; provinceName?: string; countryName?: string; 
  processingCount?: number 
}
interface ProcessStep { processingId: number; step: string; facilityName?: string; batchId?: number }
interface ProcessingOperation { id: number; packagingDate: string; weightPerUnit: number; processedBy?: string; packagingType?: string; processingDate?: string; facilityId: number; facilityName?: string; batchId: number; productName?: string }
interface Batch { id: number; qrCodeUrl?: string; productName?: string; grade?: string }

export default function ProcessingTab() {
  const [subTab, setSubTab] = useState<'facilities' | 'steps' | 'operations'>('facilities')
  
  // Data State
  const [facilities, setFacilities] = useState<ProcessingFacility[]>([])
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>([])
  const [operations, setOperations] = useState<ProcessingOperation[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  
  // Location Data
  const [countries, setCountries] = useState<Country[]>([])
  const [provinces, setProvinces] = useState<Province[]>([])
  
  // Forms State
  const [showFacilityForm, setShowFacilityForm] = useState(false)
  const [facilityFormData, setFacilityFormData] = useState({ 
    name: '', addressDetail: '', contactInfo: '', licenseNumber: '', 
    longitude: '', latitude: '', countryId: '', provinceId: '' 
  })
  const [editingFacility, setEditingFacility] = useState<ProcessingFacility | null>(null)

  const [showStepForm, setShowStepForm] = useState(false)
  const [stepFormData, setStepFormData] = useState({ processingId: '', step: '' })

  const [showOperationForm, setShowOperationForm] = useState(false)
  const [operationFormData, setOperationFormData] = useState({ 
    packagingDate: '', weightPerUnit: '', processedBy: '', packagingType: '', processingDate: '', 
    facilityId: '', batchId: '' 
  })
  const [editingOperation, setEditingOperation] = useState<ProcessingOperation | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Initial Data Load
  useEffect(() => {
    if (subTab === 'facilities') { fetchFacilities(); fetchCountries(); fetchProvinces() }
    else if (subTab === 'steps') { fetchProcessSteps(); fetchOperations() }
    else { fetchOperations(); fetchFacilities(); fetchBatches() }
  }, [subTab])

  // --- API Calls ---
  const fetchCountries = async () => { try { const res = await axios.get(`${baseUrl}/api/products/countries`); setCountries(res.data) } catch (err) { console.error(err) } }
  const fetchProvinces = async () => { try { const res = await axios.get(`${baseUrl}/api/products/provinces`); setProvinces(res.data) } catch (err) { console.error(err) } }
  const fetchFacilities = async () => { setLoading(true); try { const res = await axios.get(`${baseUrl}/api/processing/facilities`); setFacilities(res.data); setError('') } catch (err: any) { setError(err.message) } finally { setLoading(false) } }
  const fetchProcessSteps = async () => { try { const res = await axios.get(`${baseUrl}/api/processing/process-steps`); setProcessSteps(res.data) } catch (err) { console.error(err) } }
  const fetchOperations = async () => { setLoading(true); try { const res = await axios.get(`${baseUrl}/api/processing/operations`); setOperations(res.data); setError('') } catch (err: any) { setError(err.message) } finally { setLoading(false) } }
  const fetchBatches = async () => { try { const res = await axios.get(`${baseUrl}/api/products/batches`); setBatches(res.data) } catch (err) { console.error(err) } }

  // --- Handlers ---
  const handleFacilityEdit = (f: ProcessingFacility) => {
    setEditingFacility(f)
    // Logic tìm country dựa trên province
    const prov = provinces.find(p => p.id === f.provinceId)
    setFacilityFormData({
      name: f.name,
      addressDetail: f.addressDetail,
      contactInfo: f.contactInfo || '',
      licenseNumber: f.licenseNumber,
      longitude: f.longitude?.toString() || '',
      latitude: f.latitude?.toString() || '',
      countryId: prov ? prov.countryId.toString() : '',
      provinceId: f.provinceId?.toString() || ''
    })
    setShowFacilityForm(true)
  }

  const handleFacilitySubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try {
      const payload = { 
        ...facilityFormData, 
        longitude: facilityFormData.longitude ? parseFloat(facilityFormData.longitude) : null, 
        latitude: facilityFormData.latitude ? parseFloat(facilityFormData.latitude) : null, 
        provinceId: facilityFormData.provinceId ? parseInt(facilityFormData.provinceId) : null 
      }
      if (editingFacility) await axios.patch(`${baseUrl}/api/processing/facilities/${editingFacility.id}`, payload)
      else await axios.post(`${baseUrl}/api/processing/facilities`, payload)
      
      setShowFacilityForm(false); setEditingFacility(null)
      setFacilityFormData({ name: '', addressDetail: '', contactInfo: '', licenseNumber: '', longitude: '', latitude: '', countryId: '', provinceId: '' })
      fetchFacilities()
    } catch (err: any) { setError(err.response?.data?.message || err.message) } finally { setLoading(false) }
  }
  
  const handleDeleteFacility = async (id: number) => { if (!confirm('Delete?')) return; setLoading(true); try { await axios.delete(`${baseUrl}/api/processing/facilities/${id}`); fetchFacilities() } catch (err: any) { setError(err.message) } finally { setLoading(false) } }

  const handleStepSubmit = async (e: React.FormEvent) => { e.preventDefault(); setLoading(true); try { await axios.post(`${baseUrl}/api/processing/process-steps`, { processingId: parseInt(stepFormData.processingId), step: stepFormData.step }); setShowStepForm(false); setStepFormData({ processingId: '', step: '' }); fetchProcessSteps() } catch (err: any) { setError(err.message) } finally { setLoading(false) } }
  const handleDeleteStep = async (processingId: number, step: string) => { if (!confirm('Delete?')) return; setLoading(true); try { await axios.delete(`${baseUrl}/api/processing/process-steps/${processingId}/${encodeURIComponent(step)}`); fetchProcessSteps() } catch (err: any) { setError(err.message) } finally { setLoading(false) } }

  const handleOperationSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try {
      const payload = { 
        ...operationFormData, 
        weightPerUnit: parseFloat(operationFormData.weightPerUnit), 
        processingDate: operationFormData.processingDate ? new Date(operationFormData.processingDate) : undefined, 
        facilityId: parseInt(operationFormData.facilityId), 
        batchId: parseInt(operationFormData.batchId) 
      }
      if (editingOperation) await axios.patch(`${baseUrl}/api/processing/operations/${editingOperation.id}`, payload)
      else await axios.post(`${baseUrl}/api/processing/operations`, payload)
      
      setShowOperationForm(false); setEditingOperation(null)
      setOperationFormData({ packagingDate: '', weightPerUnit: '', processedBy: '', packagingType: '', processingDate: '', facilityId: '', batchId: '' })
      fetchOperations()
    } catch (err: any) { setError(err.message) } finally { setLoading(false) }
  }
  const handleDeleteOperation = async (id: number) => { if (!confirm('Delete?')) return; setLoading(true); try { await axios.delete(`${baseUrl}/api/processing/operations/${id}`); fetchOperations() } catch (err: any) { setError(err.message) } finally { setLoading(false) } }

  // Logic lọc tỉnh theo quốc gia
  const filteredProvinces = provinces.filter(p => p.countryId.toString() === facilityFormData.countryId)

  // Style button chuẩn
  const tabButtonStyle = (active: boolean) => ({
    padding: '8px 16px', borderRadius: 8, border: active ? '2px solid #667eea' : '1px solid #e5e7eb',
    background: active ? '#eef2ff' : 'white', color: active ? '#667eea' : '#6b7280',
    fontSize: 14, fontWeight: active ? 600 : 500, cursor: 'pointer', transition: 'all 0.2s', marginRight: 8
  })

  return (
    <div>
      {/* Sub-Tab Switcher - Có thêm Icon */}
      <div style={{ display: 'flex', marginBottom: 24, background: 'white', padding: '12px', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <button onClick={() => setSubTab('facilities')} style={tabButtonStyle(subTab === 'facilities')}>🏭 Facilities</button>
        <button onClick={() => setSubTab('steps')} style={tabButtonStyle(subTab === 'steps')}>👣 Process Steps</button>
        <button onClick={() => setSubTab('operations')} style={tabButtonStyle(subTab === 'operations')}>⚙️ Operations</button>
      </div>

      {error && <div style={{ padding: 16, marginBottom: 24, background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 8, color: '#b91c1c' }}>Error: {error}</div>}

      {/* FACILITIES CONTENT */}
      {subTab === 'facilities' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#374151' }}>Facilities List</h2>
              <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: 13 }}>Manage processing centers</p>
            </div>
            <button onClick={() => { setShowFacilityForm(!showFacilityForm); setEditingFacility(null); setFacilityFormData({ name: '', addressDetail: '', contactInfo: '', licenseNumber: '', longitude: '', latitude: '', countryId: '', provinceId: '' }) }}
              style={{ padding: '10px 20px', background: showFacilityForm ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, boxShadow: '0 2px 4px rgba(102,126,234,0.3)' }}>
              {showFacilityForm ? 'Cancel' : '+ Add Facility'}
            </button>
          </div>

          {showFacilityForm && (
            <form onSubmit={handleFacilitySubmit} style={{ background: 'white', padding: 24, borderRadius: 12, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Facility Name *</label>
                    <input type="text" style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8 }} value={facilityFormData.name} onChange={e => setFacilityFormData({ ...facilityFormData, name: e.target.value })} placeholder="e.g. Center A" required />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>License # *</label>
                    <input type="text" style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8 }} value={facilityFormData.licenseNumber} onChange={e => setFacilityFormData({ ...facilityFormData, licenseNumber: e.target.value })} placeholder="e.g. LIC-2024-001" required />
                </div>
                
                {/* Logic chọn Country -> Province giống FarmsTab */}
                <div>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Country</label>
                    <select style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8 }} value={facilityFormData.countryId} onChange={e => setFacilityFormData({ ...facilityFormData, countryId: e.target.value, provinceId: '' })}>
                        <option value="">-- Select Country First --</option>
                        {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Province</label>
                    <select style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8, background: !facilityFormData.countryId ? '#f3f4f6' : 'white' }} value={facilityFormData.provinceId} onChange={e => setFacilityFormData({ ...facilityFormData, provinceId: e.target.value })} disabled={!facilityFormData.countryId}>
                        <option value="">{facilityFormData.countryId ? "-- Select Province --" : "-- Waiting for Country --"}</option>
                        {filteredProvinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>

                <div style={{ gridColumn: '1/-1' }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Address Detail *</label>
                    <input type="text" style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8 }} value={facilityFormData.addressDetail} onChange={e => setFacilityFormData({ ...facilityFormData, addressDetail: e.target.value })} placeholder="e.g. 123 Industrial Park" required />
                </div>
                
                <div>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Latitude (Number)</label>
                    <input type="number" step="0.000001" style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8 }} value={facilityFormData.latitude} onChange={e => setFacilityFormData({ ...facilityFormData, latitude: e.target.value })} placeholder="-90 to 90" />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Longitude (Number)</label>
                    <input type="number" step="0.000001" style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8 }} value={facilityFormData.longitude} onChange={e => setFacilityFormData({ ...facilityFormData, longitude: e.target.value })} placeholder="-180 to 180" />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Contact Info</label>
                    <input type="text" style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8 }} value={facilityFormData.contactInfo} onChange={e => setFacilityFormData({ ...facilityFormData, contactInfo: e.target.value })} placeholder="Phone or Email" />
                </div>
              </div>
              <button type="submit" style={{ marginTop: 16, padding: '12px 24px', background: '#667eea', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>{editingFacility ? 'Update' : 'Create'}</button>
            </form>
          )}

          <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Name</th>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>License</th>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Location</th>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Coordinates</th>
                <th style={{ padding: 16, textAlign: 'right', fontWeight: 600, color: '#374151' }}>Actions</th>
              </tr></thead>
              <tbody>
                {facilities.map(f => (
                  <tr key={f.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: 16, fontWeight: 600 }}>{f.name}</td>
                    <td style={{ padding: 16, color: '#6b7280' }}>{f.licenseNumber}</td>
                    <td style={{ padding: 16, color: '#6b7280' }}>{f.provinceName || '-'} {f.countryName ? `(${f.countryName})` : ''}</td>
                    <td style={{ padding: 16, color: '#6b7280', fontFamily: 'monospace' }}>{f.latitude ? `${f.latitude.toFixed(4)}, ${f.longitude?.toFixed(4)}` : '-'}</td>
                    <td style={{ padding: 16, textAlign: 'right' }}>
                      <button onClick={() => handleFacilityEdit(f)} style={{ marginRight: 8, padding: '6px 12px', border: '1px solid #667eea', color: '#667eea', borderRadius: 6, background: 'white', cursor: 'pointer' }}>Edit</button>
                      <button onClick={() => handleDeleteFacility(f.id)} style={{ padding: '6px 12px', border: '1px solid #dc2626', color: '#dc2626', borderRadius: 6, background: 'white', cursor: 'pointer' }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* PROCESS STEPS CONTENT */}
      {subTab === 'steps' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#374151' }}>Process Steps</h2>
              <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: 13 }}>Define steps for processing operations</p>
            </div>
            <button onClick={() => { setShowStepForm(!showStepForm); setStepFormData({ processingId: '', step: '' }) }}
              style={{ padding: '10px 20px', background: showStepForm ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, boxShadow: '0 2px 4px rgba(102,126,234,0.3)' }}>
              {showStepForm ? 'Cancel' : '+ Add Step'}
            </button>
          </div>

          {showStepForm && (
            <form onSubmit={handleStepSubmit} style={{ background: 'white', padding: 24, borderRadius: 12, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div><label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Processing Operation *</label><select style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8 }} value={stepFormData.processingId} onChange={e => setStepFormData({ ...stepFormData, processingId: e.target.value })} required><option value="">Select Operation</option>{operations.map(op => <option key={op.id} value={op.id}>#{op.id} - {op.facilityName} ({op.productName || `Batch ${op.batchId}`})</option>)}</select></div>
                <div><label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Step Description *</label><input type="text" style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8 }} value={stepFormData.step} onChange={e => setStepFormData({ ...stepFormData, step: e.target.value })} placeholder="e.g., Washing, Cutting, Packaging" required /></div>
              </div>
              <button type="submit" style={{ marginTop: 16, padding: '12px 24px', background: '#667eea', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Add Step</button>
            </form>
          )}

          <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Op ID</th>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Facility</th>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Batch</th>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Step</th>
                <th style={{ padding: 16, textAlign: 'right', fontWeight: 600, color: '#374151' }}>Actions</th>
              </tr></thead>
              <tbody>
                {processSteps.map((s, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: 16, fontWeight: 600 }}>#{s.processingId}</td>
                    <td style={{ padding: 16 }}>{s.facilityName || '-'}</td>
                    <td style={{ padding: 16, color: '#6b7280' }}>Batch {s.batchId || '-'}</td>
                    <td style={{ padding: 16 }}>{s.step}</td>
                    <td style={{ padding: 16, textAlign: 'right' }}>
                      <button onClick={() => handleDeleteStep(s.processingId, s.step)} style={{ padding: '6px 12px', border: '1px solid #dc2626', color: '#dc2626', borderRadius: 6, background: 'white', cursor: 'pointer' }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* OPERATIONS CONTENT */}
      {subTab === 'operations' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#374151' }}>Processing Operations</h2>
              <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: 13 }}>Track batch processing activities</p>
            </div>
            <button onClick={() => { setShowOperationForm(!showOperationForm); setEditingOperation(null); setOperationFormData({ packagingDate: '', weightPerUnit: '', processedBy: '', packagingType: '', processingDate: '', facilityId: '', batchId: '' }) }}
              style={{ padding: '10px 20px', background: showOperationForm ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, boxShadow: '0 2px 4px rgba(102,126,234,0.3)' }}>
              {showOperationForm ? 'Cancel' : '+ Add Operation'}
            </button>
          </div>

          {showOperationForm && (
            <form onSubmit={handleOperationSubmit} style={{ background: 'white', padding: 24, borderRadius: 12, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div><label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Facility *</label><select style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8 }} value={operationFormData.facilityId} onChange={e => setOperationFormData({ ...operationFormData, facilityId: e.target.value })} required><option value="">Select Facility</option>{facilities.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></div>
                <div><label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Batch *</label><select style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8 }} value={operationFormData.batchId} onChange={e => setOperationFormData({ ...operationFormData, batchId: e.target.value })} required><option value="">Select Batch</option>{batches.map(b => <option key={b.id} value={b.id}>{b.productName || `Batch ${b.id}`}</option>)}</select></div>
                <div><label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Packaging Date *</label><input type="date" style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8 }} value={operationFormData.packagingDate} onChange={e => setOperationFormData({ ...operationFormData, packagingDate: e.target.value })} required /></div>
                <div><label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Weight (kg) *</label><input type="number" step="0.01" style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8 }} value={operationFormData.weightPerUnit} onChange={e => setOperationFormData({ ...operationFormData, weightPerUnit: e.target.value })} required /></div>
                <div><label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Packaging Type</label><input type="text" style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8 }} value={operationFormData.packagingType} onChange={e => setOperationFormData({ ...operationFormData, packagingType: e.target.value })} placeholder="e.g. Box, Crate" /></div>
                <div><label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Processed By</label><input type="text" style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8 }} value={operationFormData.processedBy} onChange={e => setOperationFormData({ ...operationFormData, processedBy: e.target.value })} placeholder="Operator name" /></div>
                <div style={{ gridColumn: '1/-1' }}><label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Processing Date</label><input type="date" style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8 }} value={operationFormData.processingDate} onChange={e => setOperationFormData({ ...operationFormData, processingDate: e.target.value })} /></div>
              </div>
              <button type="submit" style={{ marginTop: 16, padding: '12px 24px', background: '#667eea', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>{editingOperation ? 'Update' : 'Create'}</button>
            </form>
          )}

          <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>ID</th>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Facility</th>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Batch</th>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Date</th>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Weight</th>
                <th style={{ padding: 16, textAlign: 'right', fontWeight: 600, color: '#374151' }}>Actions</th>
              </tr></thead>
              <tbody>
                {operations.map(op => (
                  <tr key={op.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: 16, fontWeight: 600 }}>#{op.id}</td>
                    <td style={{ padding: 16 }}>{op.facilityName || op.facilityId}</td>
                    <td style={{ padding: 16 }}>{op.productName || `Batch ${op.batchId}`}</td>
                    <td style={{ padding: 16, color: '#6b7280' }}>{op.packagingDate ? new Date(op.packagingDate).toLocaleDateString('vi-VN') : '-'}</td>
                    <td style={{ padding: 16 }}>{op.weightPerUnit} kg</td>
                    <td style={{ padding: 16, textAlign: 'right' }}>
                      <button onClick={() => { setEditingOperation(op); setOperationFormData({ packagingDate: op.packagingDate ? new Date(op.packagingDate).toISOString().slice(0, 10) : '', weightPerUnit: op.weightPerUnit.toString(), processedBy: op.processedBy || '', packagingType: op.packagingType || '', processingDate: op.processingDate ? new Date(op.processingDate).toISOString().slice(0, 10) : '', facilityId: op.facilityId.toString(), batchId: op.batchId.toString() }); setShowOperationForm(true) }} style={{ marginRight: 8, padding: '6px 12px', border: '1px solid #667eea', color: '#667eea', borderRadius: 6, background: 'white', cursor: 'pointer' }}>Edit</button>
                      <button onClick={() => handleDeleteOperation(op.id)} style={{ padding: '6px 12px', border: '1px solid #dc2626', color: '#dc2626', borderRadius: 6, background: 'white', cursor: 'pointer' }}>Delete</button>
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