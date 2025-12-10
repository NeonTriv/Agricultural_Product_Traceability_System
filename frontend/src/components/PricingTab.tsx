import React, { useState, useEffect } from 'react'
import axios from 'axios'

const baseUrl = 'http://localhost:5000'

interface Price { vendorProductId: number; value: number; currency: string; productName?: string; vendorName?: string; unit?: string }
interface VendorProduct { id: number; productName?: string; vendorName?: string; unit?: string }

export default function PricingTab() {
  const [prices, setPrices] = useState<Price[]>([])
  const [vendorProducts, setVendorProducts] = useState<VendorProduct[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ vendorProductId: '', value: '', currency: 'VND' })
  const [editingPrice, setEditingPrice] = useState<Price | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchPrices = async () => { setLoading(true); try { const res = await axios.get(`${baseUrl}/api/pricing/prices`); setPrices(res.data); setError('') } catch (err: any) { setError(err.message) } finally { setLoading(false) } }
  const fetchVendorProducts = async () => { try { const res = await axios.get(`${baseUrl}/api/pricing/vendor-products`); setVendorProducts(res.data) } catch (e) { console.error(e) } }
  useEffect(() => { fetchPrices(); fetchVendorProducts() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      if (editingPrice) await axios.patch(`${baseUrl}/api/pricing/prices/${editingPrice.vendorProductId}`, { value: parseFloat(formData.value), currency: formData.currency })
      else await axios.post(`${baseUrl}/api/pricing/prices`, { vendorProductId: parseInt(formData.vendorProductId), value: parseFloat(formData.value), currency: formData.currency })
      setShowForm(false); setEditingPrice(null); setFormData({ vendorProductId: '', value: '', currency: 'VND' }); fetchPrices()
    } catch (err: any) { setError(err.response?.data?.message || err.message) } finally { setLoading(false) }
  }
  const handleDelete = async (id: number) => { if (!confirm('Delete?')) return; setLoading(true); try { await axios.delete(`${baseUrl}/api/pricing/prices/${id}`); fetchPrices() } catch (e) { console.error(e) } finally { setLoading(false) } }

  const formatCurrency = (value: number, currency: string) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: currency }).format(value)

  return (
    <div>
      {/* TRANG ĐƠN: Chỉ giữ nút Add, bỏ tiêu đề thừa */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button onClick={() => { setShowForm(!showForm); setEditingPrice(null); setFormData({ vendorProductId: '', value: '', currency: 'VND' }) }}
          style={{ padding: '10px 20px', background: showForm ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, boxShadow: '0 2px 4px rgba(102,126,234,0.3)' }}>
          {showForm ? 'Cancel' : '+ Add Price'}
        </button>
      </div>

      {error && <div style={{ padding: 16, marginBottom: 24, background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 8, color: '#b91c1c' }}>{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: 'white', padding: 24, borderRadius: 12, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
             {!editingPrice && (
               <div><label style={{display:'block',marginBottom:8,fontWeight:600}}>Product *</label>
                 <select style={{width:'100%',padding:12,border:'2px solid #e5e7eb',borderRadius:8}} value={formData.vendorProductId} onChange={e=>setFormData({...formData,vendorProductId:e.target.value})} required>
                   <option value="">Select Vendor Product</option>
                   {vendorProducts.map(vp=><option key={vp.id} value={vp.id}>{vp.productName} ({vp.vendorName})</option>)}
                 </select>
               </div>
             )}
             <div><label style={{display:'block',marginBottom:8,fontWeight:600}}>Price *</label><input type="number" step="0.01" style={{width:'100%',padding:12,border:'2px solid #e5e7eb',borderRadius:8}} value={formData.value} onChange={e=>setFormData({...formData,value:e.target.value})} required /></div>
             <div><label style={{display:'block',marginBottom:8,fontWeight:600}}>Currency</label><select style={{width:'100%',padding:12,border:'2px solid #e5e7eb',borderRadius:8}} value={formData.currency} onChange={e=>setFormData({...formData,currency:e.target.value})}><option value="VND">VND</option><option value="USD">USD</option></select></div>
          </div>
          <button type="submit" style={{marginTop:16,padding:'12px 24px',background:'#667eea',color:'white',border:'none',borderRadius:8,cursor:'pointer',fontWeight:600}}>{editingPrice?'Update':'Create'}</button>
        </form>
      )}

      <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
            <th style={{ padding: 16, textAlign: 'left', color: '#374151' }}>Product</th>
            <th style={{ padding: 16, textAlign: 'left', color: '#374151' }}>Vendor</th>
            <th style={{ padding: 16, textAlign: 'left', color: '#374151' }}>Unit</th>
            <th style={{ padding: 16, textAlign: 'left', color: '#374151' }}>Price</th>
            <th style={{ padding: 16, textAlign: 'right', color: '#374151' }}>Actions</th>
          </tr></thead>
          <tbody>
            {prices.map(p => (
              <tr key={p.vendorProductId} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: 16, fontWeight:600 }}>{p.productName || `Product #${p.vendorProductId}`}</td>
                <td style={{ padding: 16, color:'#6b7280' }}>{p.vendorName || '-'}</td>
                <td style={{ padding: 16, color:'#6b7280' }}>{p.unit || '-'}</td>
                <td style={{ padding: 16 }}>
                  <span style={{ padding: '6px 12px', background: '#dcfce7', color: '#166534', borderRadius: 8, fontSize: 14, fontWeight: 700 }}>{formatCurrency(p.value, p.currency)}</span>
                </td>
                <td style={{ padding: 16, textAlign: 'right' }}>
                  <button onClick={()=>{setEditingPrice(p);setFormData({vendorProductId:p.vendorProductId.toString(),value:p.value.toString(),currency:p.currency});setShowForm(true)}} style={{marginRight:8,padding:'6px 12px',border:'1px solid #667eea',color:'#667eea',borderRadius:6,background:'white',cursor:'pointer'}}>Edit</button>
                  <button onClick={()=>handleDelete(p.vendorProductId)} style={{padding:'6px 12px',border:'1px solid #dc2626',color:'#dc2626',borderRadius:6,background:'white',cursor:'pointer'}}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}