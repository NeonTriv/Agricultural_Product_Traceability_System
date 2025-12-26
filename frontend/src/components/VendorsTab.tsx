import { useState, useEffect } from 'react'
import axios from 'axios'

interface Vendor { tin: string; name: string; address: string; contactInfo?: string; type: 'vendor' | 'distributor' | 'retail' | 'both'; distributorType?: string; retailFormat?: string; provinceId?: number; provinceName?: string; countryName?: string; longitude?: number; latitude?: number; isCarrier?: boolean }
interface Province { id: number; name: string; countryId: number }
interface Country { id: number; name: string }
interface VendorProduct { id: number; unit: string; vendorTin: string; vendorName?: string; agricultureProductId: number; productName?: string }
interface AgricultureProduct { id: number; name: string }
interface CarrierCompany { tin: string; licenseNumber: string; issueDate: string; expirationDate: string }

const baseUrl = 'http://localhost:5000'

// Sub-component: VendorProducts
function VendorProductsSubTab() {
  const [vendorProducts, setVendorProducts] = useState<VendorProduct[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [agricultureProducts, setAgricultureProducts] = useState<AgricultureProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ unit: '', vendorTin: '', agricultureProductId: '' })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; itemId: number | null; itemName: string }>({ show: false, itemId: null, itemName: '' })
  const [errorModal, setErrorModal] = useState<{ show: boolean; title: string; message: string }>({ show: false, title: '', message: '' })

  useEffect(() => { loadData() }, [])
  const loadData = async () => {
    setLoading(true)
    try {
      const [vpRes, vRes, apRes] = await Promise.all([
        axios.get(`${baseUrl}/api/pricing/vendor-products`),
        axios.get(`${baseUrl}/api/vendors`),
        axios.get(`${baseUrl}/api/products/agriculture-products`)
      ])
      setVendorProducts(vpRes.data); setVendors(vRes.data); setAgricultureProducts(apRes.data)
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try {
      if (editingId) await axios.patch(`${baseUrl}/api/pricing/vendor-products/${editingId}`, { unit: formData.unit })
      else await axios.post(`${baseUrl}/api/pricing/vendor-products`, { ...formData, agricultureProductId: parseInt(formData.agricultureProductId) })
      setFormData({ unit: '', vendorTin: '', agricultureProductId: '' }); setShowForm(false); setEditingId(null); loadData()
    } catch (e: any) { alert(e?.response?.data?.message || 'Error') } finally { setLoading(false) }
  }
  const handleDelete = async (id: number) => { setDeleteConfirm({ show: true, itemId: id, itemName: 'Vendor Product' }) }
  const confirmDelete = async () => { if (!deleteConfirm.itemId) return; setLoading(true); try { await axios.delete(`${baseUrl}/api/pricing/vendor-products/${deleteConfirm.itemId}`); loadData(); setDeleteConfirm({ show: false, itemId: null, itemName: '' }) } catch (e: any) { const msg = e.response?.data?.message || e.message; setErrorModal({ show: true, title: '⚠️ Cannot Delete', message: msg }); setDeleteConfirm({ show: false, itemId: null, itemName: '' }) } finally { setLoading(false) } }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ unit: '', vendorTin: '', agricultureProductId: '' }) }}
          style={{ padding: '10px 20px', background: showForm ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 12px rgba(102,126,234,0.3)' }}>
          {showForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: 24, padding: 24, background: 'white', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
            <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#6b7280' }}>Vendor *</label><select value={formData.vendorTin} onChange={e => setFormData({ ...formData, vendorTin: e.target.value })} disabled={!!editingId} style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} required><option value="">Select Vendor</option>{vendors.map(v => <option key={v.tin} value={v.tin}>{v.name}</option>)}</select></div>
            <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#6b7280' }}>Product *</label><select value={formData.agricultureProductId} onChange={e => setFormData({ ...formData, agricultureProductId: e.target.value })} disabled={!!editingId} style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} required><option value="">Select Product</option>{agricultureProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
            <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#6b7280' }}>Unit *</label><input type="text" value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} required /></div>
          </div>
          <button type="submit" style={{ marginTop: 20, padding: '12px 24px', background: '#667eea', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>{editingId ? 'Update' : 'Create'}</button>
        </form>
      )}
      <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Vendor</th>
            <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Product</th>
            <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Unit</th>
            <th style={{ padding: 16, textAlign: 'right', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Actions</th>
          </tr></thead>
          <tbody>
            {vendorProducts.map(vp => (
              <tr key={vp.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: 16, fontSize: 13 }}>{vp.vendorName || vp.vendorTin}</td>
                <td style={{ padding: 16, fontSize: 13 }}>{vp.productName}</td>
                <td style={{ padding: 16, fontSize: 13 }}>{vp.unit}</td>
                <td style={{ padding: 16, textAlign: 'right' }}>
                  <button onClick={() => { setEditingId(vp.id); setFormData({ unit: vp.unit, vendorTin: vp.vendorTin, agricultureProductId: vp.agricultureProductId.toString() }); setShowForm(true) }} style={{ marginRight: 8, padding: '6px 12px', background: '#dbeafe', color: '#1e40af', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Edit</button>
                  <button onClick={() => handleDelete(vp.id)} style={{ padding: '6px 12px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirm.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 32, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', maxWidth: 400, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>❓</div>
            <h3 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: 20, fontWeight: 700 }}>Confirm Delete</h3>
            <p style={{ margin: '0 0 24px 0', color: '#6b7280', fontSize: 15 }}>Are you sure you want to delete this {deleteConfirm.itemName}? This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => setDeleteConfirm({ show: false, itemId: null, itemName: '' })} style={{ padding: '10px 20px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button onClick={confirmDelete} style={{ padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Delete</button>
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
    </>
  )
}

// Main Component: VendorsTab
export default function VendorsTab() {
  const [subTab, setSubTab] = useState<'vendors'>('vendors')
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [carriers, setCarriers] = useState<CarrierCompany[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null)
  const [formData, setFormData] = useState({ tin: '', name: '', address: '', contactInfo: '', vendorType: '' as any, distributorType: '', retailFormat: '', countryId: '', provinceId: '', latitude: '', longitude: '' })
  const [provinces, setProvinces] = useState<Province[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; itemId: string | null; itemName: string }>({ show: false, itemId: null, itemName: '' })
  const [errorModal, setErrorModal] = useState<{ show: boolean; title: string; message: string }>({ show: false, title: '', message: '' })

  useEffect(() => { loadVendors(); loadLocations(); loadCarriers() }, [])
  const loadVendors = async () => { setLoading(true); try { const res = await axios.get(`${baseUrl}/api/vendors`); setVendors(res.data) } catch (e) { console.error(e) } finally { setLoading(false) } }
  const loadLocations = async () => { try { const [pRes, cRes] = await Promise.all([axios.get(`${baseUrl}/api/products/provinces`), axios.get(`${baseUrl}/api/products/countries`)]); setProvinces(pRes.data); setCountries(cRes.data) } catch (e) { console.error(e) } }
  const loadCarriers = async () => { try { const res = await axios.get(`${baseUrl}/api/logistics/carriers`); setCarriers(res.data) } catch (e) { console.error(e) } }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try {
      const payload = { 
        name: formData.name,
        address: formData.address,
        contactInfo: formData.contactInfo || undefined,
        vendorType: formData.vendorType || undefined,
        distributorType: formData.distributorType || undefined,
        retailFormat: formData.retailFormat || undefined,
        provinceId: formData.provinceId ? parseInt(formData.provinceId) : undefined,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined
      }
      if (editingVendor) await axios.patch(`${baseUrl}/api/vendors/${editingVendor.tin}`, payload)
      else await axios.post(`${baseUrl}/api/vendors`, { tin: formData.tin, ...payload })
      setShowForm(false); setEditingVendor(null); setFormData({ tin: '', name: '', address: '', contactInfo: '', vendorType: '', distributorType: '', retailFormat: '', countryId: '', provinceId: '', latitude: '', longitude: '' }); loadVendors()
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }
  const handleDelete = async (tin: string) => { setDeleteConfirm({ show: true, itemId: tin, itemName: 'Vendor' }) }
  const confirmDelete = async () => { if (!deleteConfirm.itemId) return; setLoading(true); try { await axios.delete(`${baseUrl}/api/vendors/${deleteConfirm.itemId}`); loadVendors(); setDeleteConfirm({ show: false, itemId: null, itemName: '' }) } catch (e: any) { const msg = e.response?.data?.message || e.message; setErrorModal({ show: true, title: '⚠️ Cannot Delete Vendor', message: msg }); setDeleteConfirm({ show: false, itemId: null, itemName: '' }) } finally { setLoading(false) } }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 40, fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Vendors</h2>
          <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: 13 }}>Manage vendor accounts and information</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          style={{ padding: '10px 20px', background: showForm ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 12px rgba(102,126,234,0.3)' }}>
          {showForm ? 'Close Form' : '+ Add Vendor'}
        </button>
      </div>

          {showForm && (
            <form onSubmit={handleSubmit} style={{ marginBottom: 24, padding: 24, background: 'white', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#6b7280' }}>TIN *</label><input type="text" value={formData.tin} onChange={e => setFormData({ ...formData, tin: e.target.value })} disabled={!!editingVendor} style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} required /></div>
                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#6b7280' }}>Name *</label><input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} required /></div>
                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#6b7280' }}>Address *</label><input type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} required /></div>
                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#6b7280' }}>Contact</label><input type="text" value={formData.contactInfo} onChange={e => setFormData({ ...formData, contactInfo: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} /></div>
                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#6b7280' }}>Latitude</label><input type="number" step="0.000001" value={formData.latitude} onChange={e => setFormData({ ...formData, latitude: e.target.value })} placeholder="e.g., 10.7769" style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} /></div>
                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#6b7280' }}>Longitude</label><input type="number" step="0.000001" value={formData.longitude} onChange={e => setFormData({ ...formData, longitude: e.target.value })} placeholder="e.g., 106.7000" style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} /></div>
                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#6b7280' }}>Country</label><select value={formData.countryId} onChange={e => setFormData({ ...formData, countryId: e.target.value, provinceId: '' })} style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }}><option value="">Select Country</option>{countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#6b7280' }}>Province</label><select value={formData.provinceId} onChange={e => setFormData({ ...formData, provinceId: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} disabled={!formData.countryId}><option value="">Select Province</option>{provinces.filter(p => p.countryId.toString() === formData.countryId).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#6b7280' }}>Type *</label>
                  <select value={formData.vendorType} onChange={e => { const type = e.target.value; setFormData({ ...formData, vendorType: type as any, distributorType: '', retailFormat: '' }) }} style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} required>
                    <option value="">-- Select Type --</option>
                    <option value="distributor">Distributor</option>
                    <option value="retail">Retail</option>
                    <option value="both">Both (Distributor + Retail)</option>
                  </select>
                </div>
                {(formData.vendorType === 'distributor' || formData.vendorType === 'both') && (
                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#6b7280' }}>Distributor Type *</label>
                    <select value={formData.distributorType} onChange={e => setFormData({ ...formData, distributorType: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} required={formData.vendorType === 'distributor' || formData.vendorType === 'both'}>
                      <option value="">-- Select Type --</option>
                      <option value="Direct">Direct</option>
                      <option value="Indirect">Indirect</option>
                    </select>
                  </div>
                )}
                {(formData.vendorType === 'retail' || formData.vendorType === 'both') && (
                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#6b7280' }}>Retail Format *</label>
                    <select value={formData.retailFormat} onChange={e => setFormData({ ...formData, retailFormat: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} required={formData.vendorType === 'retail' || formData.vendorType === 'both'}>
                      <option value="">-- Select Format --</option>
                      <option value="Supermarket">Supermarket</option>
                      <option value="Online Store">Online Store</option>
                      <option value="Convenience Store">Convenience Store</option>
                      <option value="Traditional Market">Traditional Market</option>
                      <option value="Specialty Shop">Specialty Shop</option>
                    </select>
                  </div>
                )}
              </div>
              <button type="submit" style={{ marginTop: 20, padding: '12px 24px', background: '#667eea', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>{editingVendor ? 'Update' : 'Create'}</button>
            </form>
          )}

          <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>TIN</th>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Name</th>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Address</th>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Location</th>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Contact</th>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Type</th>
                <th style={{ padding: 16, textAlign: 'right', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Actions</th>
              </tr></thead>
              <tbody>
                {vendors.map(v => (
                  <tr key={v.tin} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: 16, fontFamily: 'monospace', fontWeight: 600, fontSize: 13 }}>{v.tin}</td>
                    <td style={{ padding: 16, fontSize: 13 }}>{v.name}</td>
                    <td style={{ padding: 16, color: '#6b7280', fontSize: 13 }}>{v.address}</td>
                    <td style={{ padding: 16, color: '#6b7280', fontSize: 13 }}>
                      <div>{v.provinceName && v.countryName ? `${v.provinceName}, ${v.countryName}` : '-'}</div>
                      {v.longitude && v.latitude && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>📍 {v.latitude.toFixed(2)}, {v.longitude.toFixed(2)}</div>}
                    </td>
                    <td style={{ padding: 16, color: '#6b7280', fontSize: 13 }}>{v.contactInfo}</td>
                    <td style={{ padding: 16 }}>
                      <span style={{ padding: '4px 12px', background: v.type === 'distributor' ? '#dbeafe' : v.type === 'retail' ? '#d1fae5' : v.type === 'both' ? '#fef3c7' : '#f3f4f6', color: v.type === 'distributor' ? '#1e40af' : v.type === 'retail' ? '#065f46' : v.type === 'both' ? '#92400e' : '#374151', borderRadius: 4, fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>
                        {v.type}
                      </span>
                    </td>
                    <td style={{ padding: 16, textAlign: 'right' }}>
                      <button onClick={() => { const prov = provinces.find(p => p.id === (v.provinceId || 0)); const countryId = prov ? prov.countryId.toString() : ''; setEditingVendor(v); setFormData({ tin: v.tin, name: v.name, address: v.address, contactInfo: v.contactInfo || '', vendorType: v.type, distributorType: v.distributorType || '', retailFormat: v.retailFormat || '', countryId, provinceId: v.provinceId ? v.provinceId.toString() : '', latitude: v.latitude ? v.latitude.toString() : '', longitude: v.longitude ? v.longitude.toString() : '' }); setShowForm(true) }} style={{ marginRight: 8, padding: '6px 12px', background: '#dbeafe', color: '#1e40af', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Edit</button>
                      <button onClick={() => handleDelete(v.tin)} style={{ padding: '6px 12px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* DELETE CONFIRMATION MODAL */}
          {deleteConfirm.show && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
              <div style={{ background: 'white', borderRadius: 12, padding: 32, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', maxWidth: 400, textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>❓</div>
                <h3 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: 20, fontWeight: 700 }}>Confirm Delete</h3>
                <p style={{ margin: '0 0 24px 0', color: '#6b7280', fontSize: 15 }}>Are you sure you want to delete this {deleteConfirm.itemName}? This action cannot be undone.</p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  <button onClick={() => setDeleteConfirm({ show: false, itemId: null, itemName: '' })} style={{ padding: '10px 20px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                  <button onClick={confirmDelete} style={{ padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Delete</button>
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