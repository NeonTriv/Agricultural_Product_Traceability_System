import React, { useState, useEffect } from 'react'
import axios from 'axios'

const baseUrl = 'http://localhost:5000'

// --- Interfaces ---
interface Farm {
  id: number
  name: string
  ownerName?: string
  contactInfo?: string
  addressDetail?: string
  longitude?: number
  latitude?: number
  provinceId: number
  provinceName?: string
  countryName?: string
  countryId?: number // Optional: useful for frontend logic
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

interface FarmCertification {
  farmId: number
  farmName?: string
  certification: string
}

// Sub-component: Farm Certifications Tab
function FarmCertificationsSubTab({
  deleteConfirm,
  setDeleteConfirm,
  setErrorModal,
  confirmDelete,
  refreshTrigger,
}: {
  deleteConfirm: any
  setDeleteConfirm: any
  setErrorModal: any
  confirmDelete: () => Promise<void>
  refreshTrigger?: number
}) {
  const [farms, setFarms] = useState<Farm[]>([])
  const [selectedFarmId, setSelectedFarmId] = useState<number | null>(null)
  const [certifications, setCertifications] = useState<FarmCertification[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [newCertification, setNewCertification] = useState('')

  useEffect(() => { loadFarms() }, [])
  useEffect(() => { if (selectedFarmId) loadCertifications(selectedFarmId) }, [selectedFarmId, refreshTrigger])

  const loadFarms = async () => { try { const res = await axios.get(`${baseUrl}/api/farms`); setFarms(res.data); if (res.data.length > 0 && !selectedFarmId) setSelectedFarmId(res.data[0].id) } catch (e) { console.error(e) } }
  const loadCertifications = async (farmId: number) => { setLoading(true); try { const res = await axios.get(`${baseUrl}/api/farms/${farmId}/certifications`); setCertifications(res.data) } catch (e) { console.error(e) } finally { setLoading(false) } }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!selectedFarmId || !newCertification.trim()) return; setLoading(true)
    try { await axios.post(`${baseUrl}/api/farms/${selectedFarmId}/certifications`, { certification: newCertification.trim() }); setNewCertification(''); setShowForm(false); await loadCertifications(selectedFarmId) } catch (e: any) { alert(e.message) } finally { setLoading(false) }
  }
  const handleDelete = async (farmId: number, certification: string) => { setDeleteConfirm({ show: true, type: 'cert', farmId, certification }) }
  const selectedFarm = farms.find(f => f.id === selectedFarmId)

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div><h2 style={{ fontSize: 24, fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Certifications</h2><p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: 13 }}>Manage certificates for each farm</p></div>
        <button onClick={() => { setShowForm(!showForm); setNewCertification('') }} style={{ padding: '10px 20px', background: showForm ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 12px rgba(102,126,234,0.3)' }}>{showForm ? 'Cancel' : '+ Add Certification'}</button>
      </div>
      <div style={{ background: 'white', padding: 16, borderRadius: 12, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ flex: 1 }}><label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 13, color: '#6b7280' }}>SELECT FARM</label><select value={selectedFarmId || ''} onChange={e => setSelectedFarmId(parseInt(e.target.value))} style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8 }}><option value="">-- Select a farm --</option>{farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></div>
        {selectedFarm && (<div style={{ flex: 2, paddingLeft: 16, borderLeft: '2px solid #f3f4f6' }}><div style={{ fontSize: 14 }}><strong>Owner:</strong> {selectedFarm.ownerName || '-'}</div><div style={{ fontSize: 14, marginTop: 4 }}><strong>Location:</strong> {selectedFarm.provinceName}, {selectedFarm.countryName}</div></div>)}
      </div>
      {showForm && (<form onSubmit={handleSubmit} style={{ marginBottom: 24, padding: 24, background: 'white', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: 20 }}><div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#6b7280' }}>Certification Name *</label><input type="text" value={newCertification} onChange={e => setNewCertification(e.target.value)} style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} required /></div><button type="submit" disabled={loading} style={{ marginTop: 20, padding: '12px 24px', background: '#667eea', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>{loading ? 'Adding...' : 'Save Certification'}</button></form>)}
      {selectedFarm && (<div style={{ background: 'white', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', overflow: 'hidden' }}><table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}><th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Certification Name</th><th style={{ padding: 16, textAlign: 'right', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Actions</th></tr></thead><tbody>{certifications.map((cert, idx) => (<tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}><td style={{ padding: 16 }}><span style={{ padding: '6px 12px', background: '#dbeafe', color: '#1e40af', borderRadius: 999, fontSize: 13, fontWeight: 600 }}>{cert.certification}</span></td><td style={{ padding: 16, textAlign: 'right' }}><button onClick={() => handleDelete(cert.farmId, cert.certification)} style={{ padding: '6px 12px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Delete</button></td></tr>))}</tbody></table></div>)}
    </>
  )
}

// Main Component
export default function FarmsTab() {
  const [subTab, setSubTab] = useState<'farms' | 'certifications'>('farms')
  const [farms, setFarms] = useState<Farm[]>([])
  
  // Data lists
  const [provinces, setProvinces] = useState<Province[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [refreshKey, setRefreshKey] = useState(0)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null)
  const [errorModal, setErrorModal] = useState<{ show: boolean; title: string; message: string }>({ show: false, title: '', message: '' })
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; type: 'farm' | 'cert'; farmId: number | null; certification: string }>({ show: false, type: 'farm', farmId: null, certification: '' })
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    contactInfo: '',
    addressDetail: '',
    longitude: '',
    latitude: '',
    countryId: '', // Thêm countryId vào form
    provinceId: ''
  })

  // Load initial data
  useEffect(() => { 
    if (subTab === 'farms') { 
      loadFarms()
      loadLocationData()
    } 
  }, [subTab])

  const loadFarms = async () => { setLoading(true); try { const res = await axios.get(`${baseUrl}/api/farms`); setFarms(res.data); setError('') } catch (e: any) { setError(e.message) } finally { setLoading(false) } }
  
  const loadLocationData = async () => {
    try {
      const [provRes, countryRes] = await Promise.all([
        axios.get(`${baseUrl}/api/products/provinces`),
        axios.get(`${baseUrl}/api/products/countries`)
      ])
      setProvinces(provRes.data)
      setCountries(countryRes.data)
    } catch (e) { console.error(e) }
  }

  // Handle Edit Logic (Auto-fill country based on province)
  const handleEditClick = (farm: Farm) => {
    setEditingFarm(farm)
    
    // Tìm countryId dựa trên provinceId của farm
    const farmProvince = provinces.find(p => p.id === farm.provinceId)
    const derivedCountryId = farmProvince ? farmProvince.countryId.toString() : ''

    setFormData({
      name: farm.name,
      ownerName: farm.ownerName || '',
      contactInfo: farm.contactInfo || '',
      addressDetail: farm.addressDetail || '',
      longitude: farm.longitude?.toString() || '',
      latitude: farm.latitude?.toString() || '',
      countryId: derivedCountryId, // Tự động điền quốc gia
      provinceId: farm.provinceId.toString()
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try {
      const payload = { 
        ...formData, 
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined, 
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined, 
        provinceId: parseInt(formData.provinceId) 
        // Note: countryId không gửi lên server, server chỉ cần provinceId là đủ để suy ra country
      }
      
      if (editingFarm) await axios.put(`${baseUrl}/api/farms/${editingFarm.id}`, payload)
      else await axios.post(`${baseUrl}/api/farms`, payload)
      
      setFormData({ name: '', ownerName: '', contactInfo: '', addressDetail: '', longitude: '', latitude: '', countryId: '', provinceId: '' }); 
      setShowForm(false); setEditingFarm(null); await loadFarms()
    } catch (e: any) { setError(e.message) } finally { setLoading(false) }
  }

const handleDeleteFarm = async (id: number) => { 
    setDeleteConfirm({ show: true, type: 'farm', farmId: id, certification: '' })
  }
  
  const confirmDeleteFarm = async () => {
    if (!deleteConfirm.farmId) return
    setLoading(true)
    try { 
      await axios.delete(`${baseUrl}/api/farms/${deleteConfirm.farmId}`)
      await loadFarms()
      setDeleteConfirm({ show: false, type: 'farm', farmId: null, certification: '' })
    } catch (e: any) { 
      const msg = e.response?.data?.message || e.message
      setErrorModal({
        show: true,
        title: '⚠️ Cannot Delete Farm',
        message: msg
      })
      setDeleteConfirm({ show: false, type: 'farm', farmId: null, certification: '' })
    } finally { 
      setLoading(false) 
    } 
  }

  const confirmDelete = async () => {
    if (deleteConfirm.type === 'cert' && deleteConfirm.farmId && deleteConfirm.certification) {
      setLoading(true)
      try {
        // Format: DELETE /api/farms/{farmId}/certifications/{certification}
        const url = `${baseUrl}/api/farms/${deleteConfirm.farmId}/certifications/${encodeURIComponent(deleteConfirm.certification)}`
        await axios.delete(url)
        // Reload certifications list
        if (deleteConfirm.farmId) {
          const res = await axios.get(`${baseUrl}/api/farms/${deleteConfirm.farmId}/certifications`)
          // Dispatch to update certifications list in parent component
        }
        setDeleteConfirm({ show: false, type: 'farm', farmId: null, certification: '' })
        setRefreshKey(prev => prev + 1)  // Trigger refresh for cert list
      } catch (e: any) {
        const msg = e.response?.data?.message || e.message
        setErrorModal({
          show: true,
          title: '⚠️ Cannot Delete Certification',
          message: msg
        })
        setDeleteConfirm({ show: false, type: 'farm', farmId: null, certification: '' })
      } finally {
        setLoading(false)
      }
    }
  }

  // Filter provinces based on selected country
  const filteredProvinces = provinces.filter(p => p.countryId.toString() === formData.countryId)

  const btnStyle = (active: boolean) => ({
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

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 40, fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Farm Management</h2>
      </div>

      <div style={{ display: 'flex', marginBottom: 24, background: 'white', padding: 6, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', width: 'fit-content', gap: 4 }}>
        <button onClick={() => setSubTab('farms')} style={btnStyle(subTab === 'farms')}>🌾 Farms</button>
        <button onClick={() => setSubTab('certifications')} style={btnStyle(subTab === 'certifications')}>📜 Farm Certifications</button>
      </div>

      {error && <div style={{ padding: 16, marginBottom: 24, background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 8, color: '#b91c1c' }}>Error: {error}</div>}

      {subTab === 'farms' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
               <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Farms List</h2>
               <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: 14 }}>Registered production units</p>
            </div>
            <button onClick={() => { setShowForm(!showForm); setEditingFarm(null); setFormData({ name: '', ownerName: '', contactInfo: '', addressDetail: '', longitude: '', latitude: '', countryId: '', provinceId: '' }) }}
              style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 12px rgba(102,126,234,0.3)' }}>
              {showForm ? 'Close Form' : '+ Add Farm'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} style={{ marginBottom: 24, padding: 24, background: 'white', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>Farm Name *</label><input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8 }} required /></div>
                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>Owner Name</label><input type="text" value={formData.ownerName} onChange={e => setFormData({ ...formData, ownerName: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8 }} /></div>
                
                {/* LOGIC CHỌN QUỐC GIA TRƯỚC */}
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>Country <span style={{color:'#6b7280', fontSize:12, fontWeight:400}}>(Filter Location)</span></label>
                  <select value={formData.countryId} onChange={e => setFormData({ ...formData, countryId: e.target.value, provinceId: '' })} 
                    style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8 }}>
                    <option value="">-- Select Country First --</option>
                    {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                {/* LOGIC CHỌN TỈNH SAU */}
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>Province *</label>
                  <select value={formData.provinceId} onChange={e => setFormData({ ...formData, provinceId: e.target.value })} 
                    style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8, background: !formData.countryId ? '#f3f4f6' : 'white' }} 
                    disabled={!formData.countryId}
                    required>
                    <option value="">{formData.countryId ? "-- Select Province --" : "-- Waiting for Country --"}</option>
                    {filteredProvinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                <div style={{ gridColumn: '1 / -1' }}><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>Detailed Address</label><input type="text" value={formData.addressDetail} onChange={e => setFormData({ ...formData, addressDetail: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8 }} placeholder="e.g., 123 Village Road" /></div>
                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>Contact Info</label><input type="text" value={formData.contactInfo} onChange={e => setFormData({ ...formData, contactInfo: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8 }} /></div>
                <div style={{ display:'flex', gap:16 }}>
                    <div style={{flex:1}}><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>Latitude</label><input type="number" step="0.000001" min="-90" max="90" value={formData.latitude} onChange={e => setFormData({ ...formData, latitude: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8 }} placeholder="-90 to 90" /></div>
                    <div style={{flex:1}}><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>Longitude</label><input type="number" step="0.000001" min="-180" max="180" value={formData.longitude} onChange={e => setFormData({ ...formData, longitude: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8 }} placeholder="-180 to 180" /></div>
                </div>
              </div>
              <button type="submit" disabled={loading} style={{ marginTop: 20, padding: '12px 24px', background: '#667eea', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>{loading ? 'Saving...' : editingFarm ? 'Update Farm' : 'Create Farm'}</button>
            </form>
          )}

          <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Farm Name</th>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Owner</th>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Contact</th>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Location</th>
                  <th style={{ padding: 16, textAlign: 'right', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Actions</th>
              </tr></thead>
              <tbody>
                {farms.map(farm => (
                  <tr key={farm.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: 16, fontWeight: 600 }}>{farm.name}</td>
                    <td style={{ padding: 16, fontSize: 13 }}>{farm.ownerName || '-'}</td>
                    <td style={{ padding: 16, color: '#6b7280', fontSize: 13 }}>{farm.contactInfo || '-'}</td>
                    <td style={{ padding: 16 }}>
                      <span style={{ padding: '4px 12px', background: '#e0e7ff', color: '#4338ca', borderRadius: 999, fontSize: 13, fontWeight: 600 }}>
                        {farm.provinceName || 'Unknown'}, {farm.countryName}
                      </span>
                    </td>
                    <td style={{ padding: 16, textAlign: 'right' }}>
                      <button onClick={() => handleEditClick(farm)} style={{ marginRight: 8, padding: '6px 12px', background: '#dbeafe', color: '#1e40af', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Edit</button>
                      <button onClick={() => handleDeleteFarm(farm.id)} style={{ padding: '6px 12px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {subTab === 'certifications' && <FarmCertificationsSubTab deleteConfirm={deleteConfirm} setDeleteConfirm={setDeleteConfirm} setErrorModal={setErrorModal} confirmDelete={confirmDelete} refreshTrigger={refreshKey} />}
      
      {/* Error Modal */}
      {errorModal.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => setErrorModal({ show: false, title: '', message: '' })}>
          <div style={{ background: 'white', borderRadius: 16, maxWidth: 500, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: 24, borderBottom: '1px solid #f3f4f6' }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#111827' }}>{errorModal.title}</h3>
            </div>
            <div style={{ padding: 24 }}>
              <p style={{ margin: '0 0 24px 0', color: '#4b5563', fontSize: 15, lineHeight: 1.6 }}>{errorModal.message}</p>
              <button onClick={() => setErrorModal({ show: false, title: '', message: '' })} style={{ width: '100%', padding: '12px 24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(102,126,234,0.3)' }}>
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirm.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 32, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', maxWidth: 400, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>❓</div>
            <h3 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: 20, fontWeight: 700 }}>Confirm Delete</h3>
            <p style={{ margin: '0 0 24px 0', color: '#6b7280', fontSize: 15 }}>Are you sure you want to delete {deleteConfirm.type === 'cert' ? 'this certification' : 'this farm'}? This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => setDeleteConfirm({ show: false, type: 'farm', farmId: null, certification: '' })} style={{ padding: '10px 20px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button onClick={deleteConfirm.type === 'farm' ? confirmDeleteFarm : confirmDelete} style={{ padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}