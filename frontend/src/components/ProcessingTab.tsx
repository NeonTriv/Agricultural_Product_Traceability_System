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
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; type: 'facility' | 'step' | 'operation'; id: number | null; stepName: string }>({ show: false, type: 'facility', id: null, stepName: '' })
  const [errorModal, setErrorModal] = useState<{ show: boolean; title: string; message: string }>({ show: false, title: '', message: '' })

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
  
  const handleDeleteFacility = async (id: number) => { setDeleteConfirm({ show: true, type: 'facility', id, stepName: '' }) }
  const confirmDeleteFacility = async () => { if (!deleteConfirm.id) return; setLoading(true); try { await axios.delete(`${baseUrl}/api/processing/facilities/${deleteConfirm.id}`); fetchFacilities(); setDeleteConfirm({ show: false, type: 'facility', id: null, stepName: '' }) } catch (err: any) { const msg = err.response?.data?.message || err.message; setErrorModal({ show: true, title: '⚠️ Cannot Delete Facility', message: msg }); setDeleteConfirm({ show: false, type: 'facility', id: null, stepName: '' }) } finally { setLoading(false) } }

  const handleStepSubmit = async (e: React.FormEvent) => { e.preventDefault(); setLoading(true); try { await axios.post(`${baseUrl}/api/processing/process-steps`, { processingId: parseInt(stepFormData.processingId), step: stepFormData.step }); setShowStepForm(false); setStepFormData({ processingId: '', step: '' }); fetchProcessSteps() } catch (err: any) { setError(err.message) } finally { setLoading(false) } }
  const handleDeleteStep = async (processingId: number, step: string) => { setDeleteConfirm({ show: true, type: 'step', id: processingId, stepName: step }) }
  const confirmDeleteStep = async () => { if (!deleteConfirm.id) return; setLoading(true); try { await axios.delete(`${baseUrl}/api/processing/process-steps/${deleteConfirm.id}/${encodeURIComponent(deleteConfirm.stepName)}`); fetchProcessSteps(); setDeleteConfirm({ show: false, type: 'facility', id: null, stepName: '' }) } catch (err: any) { const msg = err.response?.data?.message || err.message; setErrorModal({ show: true, title: '⚠️ Cannot Delete Step', message: msg }); setDeleteConfirm({ show: false, type: 'facility', id: null, stepName: '' }) } finally { setLoading(false) } }

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
  const handleDeleteOperation = async (id: number) => { setDeleteConfirm({ show: true, type: 'operation', id, stepName: '' }) }
  const confirmDeleteOperation = async () => { if (!deleteConfirm.id) return; setLoading(true); try { await axios.delete(`${baseUrl}/api/processing/operations/${deleteConfirm.id}`); fetchOperations(); setDeleteConfirm({ show: false, type: 'facility', id: null, stepName: '' }) } catch (err: any) { const msg = err.response?.data?.message || err.message; setErrorModal({ show: true, title: '⚠️ Cannot Delete Operation', message: msg }); setDeleteConfirm({ show: false, type: 'facility', id: null, stepName: '' }) } finally { setLoading(false) } }
  const filteredProvinces = provinces.filter(p => p.countryId.toString() === facilityFormData.countryId)

  // Style button chuẩn
  const tabBtn = (active: boolean) => ({
    padding: '10px 20px', borderRadius: 8, border: 'none',
    background: active ? '#eef2ff' : 'transparent', color: active ? '#667eea' : '#6b7280',
    fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
  })

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 40, fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Processing Management</h2>
      </div>

      {/* Sub-Tab Switcher - Có thêm Icon */}
      <div style={{ display: 'flex', padding: 6, gap: 4, borderRadius: 12, width: 'fit-content', background: 'white' }}>
        <button onClick={() => setSubTab('facilities')} style={tabBtn(subTab === 'facilities')}>🏭 Facilities</button>
        <button onClick={() => setSubTab('steps')} style={tabBtn(subTab === 'steps')}>👣 Process Steps</button>
        <button onClick={() => setSubTab('operations')} style={tabBtn(subTab === 'operations')}>⚙️ Operations</button>
      </div>

      {error && <div style={{ padding: 16, marginBottom: 24, background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 8, color: '#b91c1c' }}>Error: {error}</div>}

      {/* FACILITIES CONTENT */}
      {subTab === 'facilities' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Facilities</h2>
              <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: 13 }}>Manage processing centers</p>
            </div>
            <button onClick={() => { setShowFacilityForm(!showFacilityForm); setEditingFacility(null); setFacilityFormData({ name: '', addressDetail: '', contactInfo: '', licenseNumber: '', longitude: '', latitude: '', countryId: '', provinceId: '' }) }}
              style={{ padding: '10px 20px', background: showFacilityForm ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 12px rgba(102,126,234,0.3)' }}>
              {showFacilityForm ? 'Close Form' : '+ Add Facility'}
            </button>
          </div>

          {showFacilityForm && (
            <form onSubmit={handleFacilitySubmit} style={{ background: 'white', padding: 24, borderRadius: 16, marginBottom: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                    <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#6b7280' }}>Facility Name *</label>
                    <input type="text" style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} value={facilityFormData.name} onChange={e => setFacilityFormData({ ...facilityFormData, name: e.target.value })} placeholder="e.g. Center A" required />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#6b7280' }}>License # *</label>
                    <input type="text" style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} value={facilityFormData.licenseNumber} onChange={e => setFacilityFormData({ ...facilityFormData, licenseNumber: e.target.value })} placeholder="e.g. LIC-2024-001" required />
                </div>
                
                {/* Logic chọn Country -> Province giống FarmsTab */}
                <div>
                    <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#6b7280' }}>Country</label>
                    <select style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} value={facilityFormData.countryId} onChange={e => setFacilityFormData({ ...facilityFormData, countryId: e.target.value, provinceId: '' })}>
                        <option value="">-- Select Country First --</option>
                        {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#6b7280' }}>Province</label>
                    <select style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, background: !facilityFormData.countryId ? '#f3f4f6' : 'white' }} value={facilityFormData.provinceId} onChange={e => setFacilityFormData({ ...facilityFormData, provinceId: e.target.value })} disabled={!facilityFormData.countryId}>
                        <option value="">{facilityFormData.countryId ? "-- Select Province --" : "-- Waiting for Country --"}</option>
                        {filteredProvinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>

                <div style={{ gridColumn: '1/-1' }}>
                    <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#6b7280' }}>Address Detail *</label>
                    <input type="text" style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} value={facilityFormData.addressDetail} onChange={e => setFacilityFormData({ ...facilityFormData, addressDetail: e.target.value })} placeholder="e.g. 123 Industrial Park" required />
                </div>
                
                <div>
                    <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#6b7280' }}>Latitude (Number)</label>
                    <input type="number" step="0.000001" style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} value={facilityFormData.latitude} onChange={e => setFacilityFormData({ ...facilityFormData, latitude: e.target.value })} placeholder="-90 to 90" />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#6b7280' }}>Longitude (Number)</label>
                    <input type="number" step="0.000001" style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} value={facilityFormData.longitude} onChange={e => setFacilityFormData({ ...facilityFormData, longitude: e.target.value })} placeholder="-180 to 180" />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                    <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#6b7280' }}>Contact Info</label>
                    <input type="text" style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} value={facilityFormData.contactInfo} onChange={e => setFacilityFormData({ ...facilityFormData, contactInfo: e.target.value })} placeholder="Phone or Email" />
                </div>
              </div>
              <button type="submit" style={{ marginTop: 20, padding: '12px 24px', background: '#667eea', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>{editingFacility ? 'Update' : 'Create'}</button>
            </form>
          )}

          <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Name</th>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>License</th>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Location</th>
                <th style={{ padding: 16, textAlign: 'right', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Actions</th>
              </tr></thead>
              <tbody>
                {facilities.map(f => (
                  <tr key={f.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: 16, fontWeight: 600 }}>{f.name}</td>
                    <td style={{ padding: 16, color: '#6b7280', fontSize: 13 }}>{f.licenseNumber}</td>
                    <td style={{ padding: 16, color: '#6b7280', fontSize: 13 }}>
                      <div>{f.provinceName || '-'}, {f.countryName || '-'}</div>
                      {f.longitude && f.latitude && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>📍 {f.latitude.toFixed(2)}, {f.longitude.toFixed(2)}</div>}
                    </td>
                    <td style={{ padding: 16, textAlign: 'right' }}>
                      <button onClick={() => handleFacilityEdit(f)} style={{ marginRight: 8, padding: '6px 12px', background: '#dbeafe', color: '#1e40af', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Edit</button>
                      <button onClick={() => handleDeleteFacility(f.id)} style={{ padding: '6px 12px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Delete</button>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Process Steps</h2>
              <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: 13 }}>Define steps for processing operations</p>
            </div>
            <button onClick={() => { setShowStepForm(!showStepForm); setStepFormData({ processingId: '', step: '' }) }}
              style={{ padding: '10px 20px', background: showStepForm ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 12px rgba(102,126,234,0.3)' }}>
              {showStepForm ? 'Cancel' : '+ Add Step'}
            </button>
          </div>

          {showStepForm && (
            <form onSubmit={handleStepSubmit} style={{ background: 'white', padding: 24, borderRadius: 16, marginBottom: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#6b7280' }}>Processing Operation *</label><select style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} value={stepFormData.processingId} onChange={e => setStepFormData({ ...stepFormData, processingId: e.target.value })} required><option value="">Select Operation</option>{[...operations].sort((a, b) => a.id - b.id).map(op => <option key={op.id} value={op.id}>#{op.id} - {op.facilityName} ({op.productName || `Batch ${op.batchId}`})</option>)}</select></div>
                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#6b7280' }}>Step Description *</label><input type="text" style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} value={stepFormData.step} onChange={e => setStepFormData({ ...stepFormData, step: e.target.value })} placeholder="e.g., Washing, Cutting, Packaging" required /></div>
              </div>
              <button type="submit" style={{ marginTop: 20, padding: '12px 24px', background: '#10b981', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Add Step</button>
            </form>
          )}

          <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Op ID</th>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Facility</th>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Batch</th>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Step</th>
                <th style={{ padding: 16, textAlign: 'right', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Actions</th>
              </tr></thead>
              <tbody>
                {[...processSteps].sort((a, b) => a.processingId - b.processingId).map((s, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: 16, fontWeight: 600 }}>#{s.processingId}</td>
                    <td style={{ padding: 16, fontSize: 13 }}>{s.facilityName || '-'}</td>
                    <td style={{ padding: 16, color: '#6b7280', fontSize: 13 }}>Batch {s.batchId || '-'}</td>
                    <td style={{ padding: 16, fontSize: 13 }}>{s.step}</td>
                    <td style={{ padding: 16, textAlign: 'right' }}>
                      <button onClick={() => handleDeleteStep(s.processingId, s.step)} style={{ padding: '6px 12px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Delete</button>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Processing Operations</h2>
              <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: 13 }}>Track batch processing activities</p>
            </div>
            <button onClick={() => { setShowOperationForm(!showOperationForm); setEditingOperation(null); setOperationFormData({ packagingDate: '', weightPerUnit: '', processedBy: '', packagingType: '', processingDate: '', facilityId: '', batchId: '' }) }}
              style={{ padding: '10px 20px', background: showOperationForm ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 12px rgba(102,126,234,0.3)' }}>
              {showOperationForm ? 'Cancel' : '+ Add Operation'}
            </button>
          </div>

          {showOperationForm && (
            <form onSubmit={handleOperationSubmit} style={{ background: 'white', padding: 24, borderRadius: 16, marginBottom: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#6b7280' }}>Facility *</label><select style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} value={operationFormData.facilityId} onChange={e => setOperationFormData({ ...operationFormData, facilityId: e.target.value })} required><option value="">Select Facility</option>{facilities.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></div>
                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#6b7280' }}>Batch *</label><select style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} value={operationFormData.batchId} onChange={e => setOperationFormData({ ...operationFormData, batchId: e.target.value })} required><option value="">Select Batch</option>{batches.map(b => <option key={b.id} value={b.id}>{b.productName || `Batch ${b.id}`}</option>)}</select></div>
                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#6b7280' }}>Packaging Date *</label><input type="date" style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} value={operationFormData.packagingDate} onChange={e => setOperationFormData({ ...operationFormData, packagingDate: e.target.value })} required /></div>
                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#6b7280' }}>Weight (kg) *</label><input type="number" step="0.01" style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} value={operationFormData.weightPerUnit} onChange={e => setOperationFormData({ ...operationFormData, weightPerUnit: e.target.value })} required /></div>
                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#6b7280' }}>Packaging Type</label><input type="text" style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} value={operationFormData.packagingType} onChange={e => setOperationFormData({ ...operationFormData, packagingType: e.target.value })} placeholder="e.g. Box, Crate" /></div>
                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#6b7280' }}>Processed By</label><input type="text" style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} value={operationFormData.processedBy} onChange={e => setOperationFormData({ ...operationFormData, processedBy: e.target.value })} placeholder="Operator name" /></div>
                <div style={{ gridColumn: '1/-1' }}><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#6b7280' }}>Processing Date</label><input type="date" style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} value={operationFormData.processingDate} onChange={e => setOperationFormData({ ...operationFormData, processingDate: e.target.value })} /></div>
              </div>
              <button type="submit" style={{ marginTop: 20, padding: '12px 24px', background: '#667eea', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>{editingOperation ? 'Update' : 'Create'}</button>
            </form>
          )}

          <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>ID</th>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Facility</th>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Batch</th>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Date</th>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Weight</th>
                <th style={{ padding: 16, textAlign: 'right', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Actions</th>
              </tr></thead>
              <tbody>
                {[...operations].sort((a, b) => a.id - b.id).map(op => (
                  <tr key={op.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: 16, fontWeight: 600 }}>#{op.id}</td>
                    <td style={{ padding: 16, fontSize: 13 }}>{op.facilityName || op.facilityId}</td>
                    <td style={{ padding: 16, fontSize: 13 }}>{op.productName || `Batch ${op.batchId}`}</td>
                    <td style={{ padding: 16, color: '#6b7280', fontSize: 13 }}>{op.packagingDate ? new Date(op.packagingDate).toLocaleDateString('vi-VN') : '-'}</td>
                    <td style={{ padding: 16, fontSize: 13 }}>{op.weightPerUnit} kg</td>
                    <td style={{ padding: 16, textAlign: 'right' }}>
                      <button onClick={() => { setEditingOperation(op); setOperationFormData({ packagingDate: op.packagingDate ? new Date(op.packagingDate).toISOString().slice(0, 10) : '', weightPerUnit: op.weightPerUnit.toString(), processedBy: op.processedBy || '', packagingType: op.packagingType || '', processingDate: op.processingDate ? new Date(op.processingDate).toISOString().slice(0, 10) : '', facilityId: op.facilityId.toString(), batchId: op.batchId.toString() }); setShowOperationForm(true) }} style={{ marginRight: 8, padding: '6px 12px', background: '#dbeafe', color: '#1e40af', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Edit</button>
                      <button onClick={() => handleDeleteOperation(op.id)} style={{ padding: '6px 12px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Delete</button>
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
              <button onClick={() => setDeleteConfirm({ show: false, type: 'facility', id: null, stepName: '' })} style={{ padding: '10px 20px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button onClick={deleteConfirm.type === 'facility' ? confirmDeleteFacility : deleteConfirm.type === 'step' ? confirmDeleteStep : confirmDeleteOperation} style={{ padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Delete</button>
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