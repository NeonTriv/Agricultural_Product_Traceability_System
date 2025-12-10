import { useState, useEffect } from 'react'
import axios from 'axios'

interface Vendor { tin: string; name: string; address: string; contactInfo?: string; type: 'vendor' | 'distributor' | 'retail' | 'both'; distributorType?: string; retailFormat?: string }
interface VendorProduct { id: number; unit: string; vendorTin: string; vendorName?: string; agricultureProductId: number; productName?: string }
interface AgricultureProduct { id: number; name: string }

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
  const handleDelete = async (id: number) => { if (!confirm('Delete?')) return; try { await axios.delete(`${baseUrl}/api/pricing/vendor-products/${id}`); loadData() } catch (e) { console.error(e) } }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ unit: '', vendorTin: '', agricultureProductId: '' }) }}
          style={{ padding: '10px 20px', background: showForm ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, boxShadow: '0 2px 4px rgba(102,126,234,0.3)' }}>
          {showForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: 24, padding: 24, background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div><label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Vendor *</label><select value={formData.vendorTin} onChange={e => setFormData({ ...formData, vendorTin: e.target.value })} disabled={!!editingId} style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8 }} required><option value="">Select Vendor</option>{vendors.map(v => <option key={v.tin} value={v.tin}>{v.name}</option>)}</select></div>
            <div><label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Product *</label><select value={formData.agricultureProductId} onChange={e => setFormData({ ...formData, agricultureProductId: e.target.value })} disabled={!!editingId} style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8 }} required><option value="">Select Product</option>{agricultureProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
            <div><label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Unit *</label><input type="text" value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8 }} required /></div>
          </div>
          <button type="submit" style={{ marginTop: 16, padding: '12px 24px', background: '#667eea', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>{editingId ? 'Update' : 'Create'}</button>
        </form>
      )}
      <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
            <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Vendor</th>
            <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Product</th>
            <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Unit</th>
            <th style={{ padding: 16, textAlign: 'right', fontWeight: 600, color: '#374151' }}>Actions</th>
          </tr></thead>
          <tbody>
            {vendorProducts.map(vp => (
              <tr key={vp.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: 16 }}>{vp.vendorName || vp.vendorTin}</td>
                <td style={{ padding: 16 }}>{vp.productName}</td>
                <td style={{ padding: 16 }}>{vp.unit}</td>
                <td style={{ padding: 16, textAlign: 'right' }}>
                  <button onClick={() => { setEditingId(vp.id); setFormData({ unit: vp.unit, vendorTin: vp.vendorTin, agricultureProductId: vp.agricultureProductId.toString() }); setShowForm(true) }} style={{ marginRight: 8, padding: '6px 12px', border: '1px solid #667eea', color: '#667eea', borderRadius: 6, background: 'white', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => handleDelete(vp.id)} style={{ padding: '6px 12px', border: '1px solid #dc2626', color: '#dc2626', borderRadius: 6, background: 'white', cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

// Main Component: VendorsTab
export default function VendorsTab() {
  const [subTab, setSubTab] = useState<'vendors' | 'vendor-products'>('vendors')
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null)
  const [formData, setFormData] = useState({ tin: '', name: '', address: '', contactInfo: '', vendorType: '' as any, distributorType: '', retailFormat: '' })

  useEffect(() => { loadVendors() }, [])
  const loadVendors = async () => { setLoading(true); try { const res = await axios.get(`${baseUrl}/api/vendors`); setVendors(res.data) } catch (e) { console.error(e) } finally { setLoading(false) } }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try {
      const payload = { 
        name: formData.name,
        address: formData.address,
        contactInfo: formData.contactInfo || undefined,
        vendorType: formData.vendorType || undefined,
        distributorType: formData.distributorType || undefined,
        retailFormat: formData.retailFormat || undefined
      }
      if (editingVendor) await axios.patch(`${baseUrl}/api/vendors/${editingVendor.tin}`, payload)
      else await axios.post(`${baseUrl}/api/vendors`, { tin: formData.tin, ...payload })
      setShowForm(false); setEditingVendor(null); setFormData({ tin: '', name: '', address: '', contactInfo: '', vendorType: '', distributorType: '', retailFormat: '' }); loadVendors()
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }
  const handleDelete = async (tin: string) => { if (!confirm('Delete?')) return; setLoading(true); try { await axios.delete(`${baseUrl}/api/vendors/${tin}`); loadVendors() } catch (e) { console.error(e) } finally { setLoading(false) } }

  const btnStyle = (active: boolean) => ({
    padding: '8px 16px', borderRadius: 8, border: active ? '2px solid #667eea' : '1px solid #e5e7eb',
    background: active ? '#eef2ff' : 'white', color: active ? '#667eea' : '#6b7280',
    fontSize: 14, fontWeight: active ? 600 : 500, cursor: 'pointer', transition: 'all 0.2s', marginRight: 8
  })

  return (
    <div>
      <div style={{ display: 'flex', marginBottom: 24, background: 'white', padding: '12px', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <button onClick={() => setSubTab('vendors')} style={btnStyle(subTab === 'vendors')}>🏪 Vendors</button>
        <button onClick={() => setSubTab('vendor-products')} style={btnStyle(subTab === 'vendor-products')}>📦 Vendor Products</button>
      </div>

      {subTab === 'vendor-products' && <VendorProductsSubTab />}

      {subTab === 'vendors' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button onClick={() => setShowForm(!showForm)}
              style={{ padding: '10px 20px', background: showForm ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, boxShadow: '0 2px 4px rgba(102,126,234,0.3)' }}>
              {showForm ? 'Cancel' : '+ Add Vendor'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} style={{ marginBottom: 24, padding: 24, background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div><label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>TIN *</label><input type="text" value={formData.tin} onChange={e => setFormData({ ...formData, tin: e.target.value })} disabled={!!editingVendor} style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8 }} required /></div>
                <div><label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Name *</label><input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8 }} required /></div>
                <div><label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Address *</label><input type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8 }} required /></div>
                <div><label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Contact</label><input type="text" value={formData.contactInfo} onChange={e => setFormData({ ...formData, contactInfo: e.target.value })} style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8 }} /></div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Type *</label>
                  <select value={formData.vendorType} onChange={e => { const type = e.target.value; setFormData({ ...formData, vendorType: type as any, distributorType: '', retailFormat: '' }) }} style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8 }} required>
                    <option value="">-- Select Type --</option>
                    <option value="distributor">Distributor</option>
                    <option value="retail">Retail</option>
                    <option value="both">Both (Distributor + Retail)</option>
                  </select>
                </div>
                {(formData.vendorType === 'distributor' || formData.vendorType === 'both') && (
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Distributor Type *</label>
                    <select value={formData.distributorType} onChange={e => setFormData({ ...formData, distributorType: e.target.value })} style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8 }} required={formData.vendorType === 'distributor' || formData.vendorType === 'both'}>
                      <option value="">-- Select Type --</option>
                      <option value="Direct">Direct</option>
                      <option value="Indirect">Indirect</option>
                    </select>
                  </div>
                )}
                {(formData.vendorType === 'retail' || formData.vendorType === 'both') && (
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Retail Format *</label>
                    <select value={formData.retailFormat} onChange={e => setFormData({ ...formData, retailFormat: e.target.value })} style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8 }} required={formData.vendorType === 'retail' || formData.vendorType === 'both'}>
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
              <button type="submit" style={{ marginTop: 16, padding: '12px 24px', background: '#667eea', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>{editingVendor ? 'Update' : 'Create'}</button>
            </form>
          )}

          <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>TIN</th>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Name</th>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Address</th>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Contact</th>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Type</th>
                <th style={{ padding: 16, textAlign: 'right', fontWeight: 600, color: '#374151' }}>Actions</th>
              </tr></thead>
              <tbody>
                {vendors.map(v => (
                  <tr key={v.tin} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: 16, fontFamily: 'monospace', fontWeight: 600 }}>{v.tin}</td>
                    <td style={{ padding: 16 }}>{v.name}</td>
                    <td style={{ padding: 16, color: '#6b7280' }}>{v.address}</td>
                    <td style={{ padding: 16, color: '#6b7280' }}>{v.contactInfo}</td>
                    <td style={{ padding: 16 }}>
                      <span style={{ padding: '4px 12px', background: v.type === 'distributor' ? '#dbeafe' : v.type === 'retail' ? '#d1fae5' : v.type === 'both' ? '#fef3c7' : '#f3f4f6', color: v.type === 'distributor' ? '#1e40af' : v.type === 'retail' ? '#065f46' : v.type === 'both' ? '#92400e' : '#374151', borderRadius: 4, fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>
                        {v.type}
                      </span>
                    </td>
                    <td style={{ padding: 16, textAlign: 'right' }}>
                      <button onClick={() => { setEditingVendor(v); setFormData({ tin: v.tin, name: v.name, address: v.address, contactInfo: v.contactInfo || '', vendorType: v.type, distributorType: v.distributorType || '', retailFormat: v.retailFormat || '' }); setShowForm(true) }} style={{ marginRight: 8, padding: '6px 12px', border: '1px solid #667eea', color: '#667eea', borderRadius: 6, background: 'white', cursor: 'pointer' }}>Edit</button>
                      <button onClick={() => handleDelete(v.tin)} style={{ padding: '6px 12px', border: '1px solid #dc2626', color: '#dc2626', borderRadius: 6, background: 'white', cursor: 'pointer' }}>Delete</button>
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