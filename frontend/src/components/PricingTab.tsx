import React, { useState, useEffect } from 'react'
import axios from 'axios'

const baseUrl = 'http://localhost:5000'

// --- Interfaces ---
interface VendorProduct {
  id: number
  vendorName: string
  productName: string
  unit: string
  vendorTin: string
  agricultureProductId: number
}

interface Price {
  vendorProductId: number
  value: number
  currency: string
  productName?: string // Helper for UI
  vendorName?: string // Helper for UI
}

interface Discount {
  id: number
  name: string
  percentage: number
  minValue?: number
  maxDiscountAmount?: number
  priority: number
  isStackable: boolean
  startDate: string
  expiredDate: string
}

// Linked products applied to a discount
interface LinkedProduct {
  vendorProductId: number
  productName: string
  vendorName: string
  unit: string
}

// Helper Style
const tabBtn = (active: boolean) => ({
  padding: '10px 20px', borderRadius: 8, border: 'none',
  background: active ? '#eef2ff' : 'transparent', color: active ? '#667eea' : '#6b7280',
  fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
})

export default function PricingTab() {
  const [subTab, setSubTab] = useState<'products' | 'prices' | 'discounts'>('products')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; type: 'product' | 'price' | 'discount' | 'linked'; id: number | null; vendorProductId?: number | null }>({ show: false, type: 'product', id: null })
  const [errorModal, setErrorModal] = useState<{ show: boolean; title: string; message: string }>({ show: false, title: '', message: '' })

  // --- Data State ---
  const [vendorProducts, setVendorProducts] = useState<VendorProduct[]>([])
  const [prices, setPrices] = useState<Price[]>([])
  const [discounts, setDiscounts] = useState<Discount[]>([])
  
  // --- State cho Modal Apply ---
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null)
  const [linkedProducts, setLinkedProducts] = useState<LinkedProduct[]>([])
  const [selectedVpId, setSelectedVpId] = useState('')

  const loadLinkedProducts = async (discountId: number) => {
    try {
      const res = await axios.get(`${baseUrl}/api/pricing/discounts/${discountId}/products`)
      setLinkedProducts(res.data)
    } catch (e) { console.error(e) }
  }

  const handleOpenApplyModal = async (discount: Discount) => {
    setSelectedDiscount(discount)
    setShowApplyModal(true)
    setSelectedVpId('')
    await loadLinkedProducts(discount.id)
    if (vendorProducts.length === 0) {
      const res = await axios.get(`${baseUrl}/api/pricing/vendor-products`)
      setVendorProducts(res.data)
    }
  }

  const handleLinkProduct = async () => {
    if (!selectedDiscount || !selectedVpId) return
    setLoading(true)
    try {
      await axios.post(`${baseUrl}/api/pricing/link-discount`, {
        vendorProductId: parseInt(selectedVpId),
        discountId: selectedDiscount.id,
      })
      await loadLinkedProducts(selectedDiscount.id)
      setSelectedVpId('')
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to link')
    } finally {
      setLoading(false)
    }
  }

  const handleUnlinkProduct = async (vpId: number) => {
    if (!selectedDiscount) return
    setDeleteConfirm({ show: true, type: 'linked', id: selectedDiscount.id, vendorProductId: vpId })
  }
  const confirmUnlinkProduct = async () => {
    if (!deleteConfirm.id || !deleteConfirm.vendorProductId) return
    try {
      await axios.delete(`${baseUrl}/api/pricing/discounts/${deleteConfirm.id}/products/${deleteConfirm.vendorProductId}`)
      await loadLinkedProducts(deleteConfirm.id)
      setDeleteConfirm({ show: false, type: 'product', id: null })
    } catch (e: any) { const msg = e.response?.data?.message || e.message; setErrorModal({ show: true, title: '⚠️ Cannot Unlink', message: msg }); setDeleteConfirm({ show: false, type: 'product', id: null }) }
  }

  const availableProducts = vendorProducts.filter((vp) => !linkedProducts.some((lp) => lp.vendorProductId === vp.id))
  // Master Data for Forms
  const [vendors, setVendors] = useState<any[]>([])
  const [agriProducts, setAgriProducts] = useState<any[]>([])

  // --- Forms State ---
  const [showProductForm, setShowProductForm] = useState(false)
  const [productFormData, setProductFormData] = useState({ vendorTin: '', agriProductId: '', unit: '' })
  const [editingProductId, setEditingProductId] = useState<number | null>(null)

  const [showPriceForm, setShowPriceForm] = useState(false)
  const [priceFormData, setPriceFormData] = useState({ vendorProductId: '', value: '', currency: 'VND' })
  const [editingPriceId, setEditingPriceId] = useState<number | null>(null)

  const [showDiscountForm, setShowDiscountForm] = useState(false)
  const [discountFormData, setDiscountFormData] = useState({ 
    name: '', percentage: '', minValue: '', maxDiscountAmount: '', 
    priority: '0', isStackable: false, startDate: '', expiredDate: '' 
  })

  useEffect(() => {
    loadData()
    if (subTab === 'products') loadMasterData()
  }, [subTab])

  // --- Loaders ---
  const loadData = async () => {
    setLoading(true)
    try {
      if (subTab === 'products') {
        const res = await axios.get(`${baseUrl}/api/pricing/vendor-products`)
        setVendorProducts(res.data)
      } else if (subTab === 'prices') {
        const res = await axios.get(`${baseUrl}/api/pricing/prices`)
        setPrices(res.data)
      } else if (subTab === 'discounts') {
        const res = await axios.get(`${baseUrl}/api/pricing/discounts`)
        setDiscounts(res.data)
      }
      setError('')
    } catch (e: any) { setError(e.message) } finally { setLoading(false) }
  }

  const loadMasterData = async () => {
    try {
      const [vRes, apRes] = await Promise.all([
        axios.get(`${baseUrl}/api/vendors`),
        axios.get(`${baseUrl}/api/products/agriculture-products`)
      ])
      setVendors(vRes.data)
      setAgriProducts(apRes.data)
    } catch (e) { console.error(e) }
  }

  // --- Handlers ---
  
  // 1. Vendor Product
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try {
      if (editingProductId) {
        await axios.patch(`${baseUrl}/api/pricing/vendor-products/${editingProductId}`, {
          unit: productFormData.unit
        })
      } else {
        await axios.post(`${baseUrl}/api/pricing/vendor-products`, {
          vendorTin: productFormData.vendorTin,
          agricultureProductId: parseInt(productFormData.agriProductId),
          unit: productFormData.unit
        })
      }
      setShowProductForm(false); setProductFormData({ vendorTin: '', agriProductId: '', unit: '' }); setEditingProductId(null); loadData()
    } catch (e: any) { setError(e.response?.data?.message || e.message) } finally { setLoading(false) }
  }

  const handleEditProduct = (vp: VendorProduct) => {
    setProductFormData({ vendorTin: vp.vendorTin, agriProductId: vp.agricultureProductId.toString(), unit: vp.unit })
    setEditingProductId(vp.id)
    setShowProductForm(true)
  }

  const handleDeleteProduct = async (id: number) => {
    setDeleteConfirm({ show: true, type: 'product', id })
  }
  const confirmDeleteProduct = async () => {
    if (!deleteConfirm.id) return
    try { await axios.delete(`${baseUrl}/api/pricing/vendor-products/${deleteConfirm.id}`); loadData(); setDeleteConfirm({ show: false, type: 'product', id: null }) } catch (e: any) { const msg = e.response?.data?.message || e.message; setErrorModal({ show: true, title: '⚠️ Cannot Delete Product', message: msg }); setDeleteConfirm({ show: false, type: 'product', id: null }) }
  }

  // 2. Price
  const handlePriceSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try {
      if (editingPriceId) {
        await axios.patch(`${baseUrl}/api/pricing/prices/${editingPriceId}`, {
          value: parseFloat(priceFormData.value),
          currency: priceFormData.currency
        })
      } else {
        await axios.post(`${baseUrl}/api/pricing/prices`, {
          vendorProductId: parseInt(priceFormData.vendorProductId),
          value: parseFloat(priceFormData.value),
          currency: priceFormData.currency
        })
      }
      setShowPriceForm(false); setPriceFormData({ vendorProductId: '', value: '', currency: 'VND' }); setEditingPriceId(null); loadData()
    } catch (e: any) { setError(e.response?.data?.message || e.message) } finally { setLoading(false) }
  }

  const handleEditPrice = (p: Price) => {
    setPriceFormData({ vendorProductId: p.vendorProductId.toString(), value: p.value.toString(), currency: p.currency })
    setEditingPriceId(p.vendorProductId)
    setShowPriceForm(true)
  }

  const handleDeletePrice = async (vpId: number) => {
    setDeleteConfirm({ show: true, type: 'price', id: vpId })
  }
  const confirmDeletePrice = async () => {
    if (!deleteConfirm.id) return
    try { await axios.delete(`${baseUrl}/api/pricing/prices/${deleteConfirm.id}`); loadData(); setDeleteConfirm({ show: false, type: 'price', id: null }) } catch (e: any) { const msg = e.response?.data?.message || e.message; setErrorModal({ show: true, title: '⚠️ Cannot Delete Price', message: msg }); setDeleteConfirm({ show: false, type: 'price', id: null }) }
  }

  // 3. Discount
  const handleDiscountSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try {
      await axios.post(`${baseUrl}/api/pricing/discounts`, {
        name: discountFormData.name,
        percentage: parseFloat(discountFormData.percentage),
        minValue: discountFormData.minValue ? parseFloat(discountFormData.minValue) : undefined,
        maxDiscountAmount: discountFormData.maxDiscountAmount ? parseFloat(discountFormData.maxDiscountAmount) : undefined,
        priority: parseInt(discountFormData.priority),
        isStackable: discountFormData.isStackable,
        startDate: discountFormData.startDate,
        expiredDate: discountFormData.expiredDate
      })
      setShowDiscountForm(false); 
      setDiscountFormData({ name: '', percentage: '', minValue: '', maxDiscountAmount: '', priority: '0', isStackable: false, startDate: '', expiredDate: '' }); 
      loadData()
    } catch (e: any) { setError(e.response?.data?.message || e.message) } finally { setLoading(false) }
  }

  const handleDeleteDiscount = async (id: number) => {
    setDeleteConfirm({ show: true, type: 'discount', id })
  }
  const confirmDeleteDiscount = async () => {
    if (!deleteConfirm.id) return
    try { await axios.delete(`${baseUrl}/api/pricing/discounts/${deleteConfirm.id}`); loadData(); setDeleteConfirm({ show: false, type: 'discount', id: null }) } catch (e: any) { const msg = e.response?.data?.message || e.message; setErrorModal({ show: true, title: '⚠️ Cannot Delete Discount', message: msg }); setDeleteConfirm({ show: false, type: 'discount', id: null }) }
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 40, fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Pricing Management</h2>
      </div>

      {/* Sub-Tabs Switcher */}
      <div style={{ display: 'flex', padding: 6, gap: 4, borderRadius: 12, width: 'fit-content', background: 'white', marginBottom: 24 }}>
        <button onClick={() => setSubTab('products')} style={tabBtn(subTab === 'products')}>📦 Vendor Products</button>
        <button onClick={() => setSubTab('prices')} style={tabBtn(subTab === 'prices')}>💰 Price List</button>
        <button onClick={() => setSubTab('discounts')} style={tabBtn(subTab === 'discounts')}>🏷️ Discounts</button>
      </div>

      {error && <div style={{ padding: 16, marginBottom: 24, background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 8, color: '#b91c1c' }}>Error: {error}</div>}

      {/* --- TAB 1: VENDOR PRODUCTS --- */}
      {subTab === 'products' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div><h2 style={{ fontSize: 24, fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Vendor Products</h2><p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: 13 }}>Mapping agriculture products to vendors with units</p></div>
            <button onClick={() => { setShowProductForm(!showProductForm); if(!showProductForm) { setEditingProductId(null); setProductFormData({ vendorTin: '', agriProductId: '', unit: '' }) } }} style={{ padding: '10px 20px', background: showProductForm ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 12px rgba(102,126,234,0.3)' }}>{showProductForm ? 'Cancel' : '+ Add Mapping'}</button>
          </div>

          {showProductForm && (
            <form onSubmit={handleProductSubmit} style={{ background: 'white', padding: 24, borderRadius: 16, marginBottom: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#6b7280' }}>Vendor *</label><select style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} value={productFormData.vendorTin} onChange={e => setProductFormData({...productFormData, vendorTin: e.target.value})} disabled={!!editingProductId} required><option value="">Select Vendor</option>{vendors.map(v => <option key={v.tin} value={v.tin}>{v.name}</option>)}</select></div>
                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#6b7280' }}>Product *</label><select style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} value={productFormData.agriProductId} onChange={e => setProductFormData({...productFormData, agriProductId: e.target.value})} disabled={!!editingProductId} required><option value="">Select Product</option>{agriProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#6b7280' }}>Unit *</label><input type="text" style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} value={productFormData.unit} onChange={e => setProductFormData({...productFormData, unit: e.target.value})} placeholder="e.g. kg, box, ton" required /></div>
              </div>
              <button type="submit" style={{ marginTop: 20, padding: '12px 24px', background: '#667eea', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>{editingProductId ? 'Update' : 'Create'} Mapping</button>
            </form>
          )}

          <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}><th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>ID</th><th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Vendor</th><th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Product</th><th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Unit</th><th style={{ padding: 16, textAlign: 'right', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Actions</th></tr></thead>
              <tbody>
                {vendorProducts.map(vp => (
                  <tr key={vp.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: 16, fontWeight: 600 }}>#{vp.id}</td>
                    <td style={{ padding: 16, fontSize: 13 }}>{vp.vendorName}</td>
                    <td style={{ padding: 16, fontSize: 13 }}>{vp.productName}</td>
                    <td style={{ padding: 16, color: '#6b7280', fontSize: 13 }}>{vp.unit}</td>
                    <td style={{ padding: 16, textAlign: 'right' }}>
                      <button onClick={() => handleEditProduct(vp)} style={{ marginRight: 8, padding: '6px 12px', background: '#dbeafe', color: '#1e40af', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Edit</button>
                      <button onClick={() => handleDeleteProduct(vp.id)} style={{ padding: '6px 12px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* --- TAB 2: PRICES --- */}
      {subTab === 'prices' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div><h2 style={{ fontSize: 24, fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Price List</h2><p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: 13 }}>Base prices for vendor products</p></div>
            <button onClick={() => { setShowPriceForm(!showPriceForm); if(!showPriceForm) { setEditingPriceId(null); setPriceFormData({ vendorProductId: '', value: '', currency: 'VND' }) }; loadMasterData() }} style={{ padding: '10px 20px', background: showPriceForm ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 12px rgba(102,126,234,0.3)' }}>{showPriceForm ? 'Cancel' : '+ Set Price'}</button>
          </div>

          {showPriceForm && (
            <form onSubmit={handlePriceSubmit} style={{ background: 'white', padding: 24, borderRadius: 16, marginBottom: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#6b7280' }}>Vendor Product *</label>
                  <select style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} value={priceFormData.vendorProductId} onChange={e => setPriceFormData({...priceFormData, vendorProductId: e.target.value})} disabled={!!editingPriceId} required>
                    <option value="">Select Vendor Product</option>
                    {vendorProducts.map(vp => (
                      <option key={vp.id} value={vp.id}>{vp.vendorName} - {vp.productName} ({vp.unit})</option>
                    ))}
                  </select>
                </div>
                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#6b7280' }}>Value *</label><input type="number" style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} value={priceFormData.value} onChange={e => setPriceFormData({...priceFormData, value: e.target.value})} required /></div>
                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#6b7280' }}>Currency</label><select style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} value={priceFormData.currency} onChange={e => setPriceFormData({...priceFormData, currency: e.target.value})}><option value="VND">VND</option><option value="USD">USD</option></select></div>
              </div>
              <button type="submit" style={{ marginTop: 20, padding: '12px 24px', background: '#667eea', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>{editingPriceId ? 'Update' : 'Save'} Price</button>
            </form>
          )}

          <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Product</th>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Vendor</th>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Price</th>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Currency</th>
                  <th style={{ padding: 16, textAlign: 'right', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {prices.map((p, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: 16, fontWeight: 600, fontSize: 13 }}>{p.productName || `#${p.vendorProductId}`}</td>
                    <td style={{ padding: 16, fontSize: 13 }}>{p.vendorName || '-'}</td>
                    <td style={{ padding: 16, fontSize: 13 }}>{p.value.toLocaleString()}</td>
                    <td style={{ padding: 16, color: '#6b7280', fontSize: 13 }}>{p.currency}</td>
                    <td style={{ padding: 16, textAlign: 'right' }}>
                      <button onClick={() => handleEditPrice(p)} style={{ marginRight: 8, padding: '6px 12px', background: '#dbeafe', color: '#1e40af', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Edit</button>
                      <button onClick={() => handleDeletePrice(p.vendorProductId)} style={{ padding: '6px 12px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* --- TAB 3: DISCOUNTS --- */}
      {subTab === 'discounts' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div><h2 style={{ fontSize: 24, fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Discounts</h2><p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: 13 }}>Manage discount rules and campaigns</p></div>
            <button onClick={() => setShowDiscountForm(!showDiscountForm)} style={{ padding: '10px 20px', background: showDiscountForm ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 12px rgba(102,126,234,0.3)' }}>{showDiscountForm ? 'Cancel' : '+ Add Discount'}</button>
          </div>

          {showDiscountForm && (
            <form onSubmit={handleDiscountSubmit} style={{ background: 'white', padding: 24, borderRadius: 16, marginBottom: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ gridColumn: '1 / -1' }}><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#6b7280' }}>Name *</label><input type="text" style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} value={discountFormData.name} onChange={e => setDiscountFormData({...discountFormData, name: e.target.value})} placeholder="e.g. Summer Sale" required /></div>
                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#6b7280' }}>Percentage (%) *</label><input type="number" style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} value={discountFormData.percentage} onChange={e => setDiscountFormData({...discountFormData, percentage: e.target.value})} required /></div>
                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#6b7280' }}>Priority</label><input type="number" style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} value={discountFormData.priority} onChange={e => setDiscountFormData({...discountFormData, priority: e.target.value})} /></div>
                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#6b7280' }}>Min Order Value</label><input type="number" style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} value={discountFormData.minValue} onChange={e => setDiscountFormData({...discountFormData, minValue: e.target.value})} /></div>
                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#6b7280' }}>Max Discount Amt</label><input type="number" style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} value={discountFormData.maxDiscountAmount} onChange={e => setDiscountFormData({...discountFormData, maxDiscountAmount: e.target.value})} /></div>
                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#6b7280' }}>Start Date</label><input type="date" style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} value={discountFormData.startDate} onChange={e => setDiscountFormData({...discountFormData, startDate: e.target.value})} required /></div>
                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#6b7280' }}>End Date</label><input type="date" style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} value={discountFormData.expiredDate} onChange={e => setDiscountFormData({...discountFormData, expiredDate: e.target.value})} required /></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" id="stackable" checked={discountFormData.isStackable} onChange={e => setDiscountFormData({...discountFormData, isStackable: e.target.checked})} />
                  <label htmlFor="stackable" style={{ fontWeight: 600 }}>Is Stackable?</label>
                </div>
              </div>
              <button type="submit" style={{ marginTop: 20, padding: '12px 24px', background: '#667eea', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Save Discount</button>
            </form>
          )}

          <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Name</th>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>%</th>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Dates</th>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Priority</th>
                <th style={{ padding: 16, textAlign: 'right', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Actions</th>
              </tr></thead>
              <tbody>
                {discounts.map(d => (
                  <tr key={d.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: 16, fontWeight: 600, fontSize: 13 }}>{d.name}</td>
                    <td style={{ padding: 16, fontSize: 13 }}>{d.percentage}%</td>
                    <td style={{ padding: 16, fontSize: 13, color: '#6b7280' }}>{new Date(d.startDate).toLocaleDateString()} - {new Date(d.expiredDate).toLocaleDateString()}</td>
                    <td style={{ padding: 16, fontSize: 13 }}>{d.priority} {d.isStackable && '(Stackable)'}</td>
                    <td style={{ padding: 16, textAlign: 'right' }}>
                      <button
                        onClick={() => handleOpenApplyModal(d)}
                        style={{ marginRight: 8, padding: '6px 12px', background: '#d1fae5', color: '#065f46', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                      >
                        🔗 Apply
                      </button>
                       <button onClick={() => handleDeleteDiscount(d.id)} style={{ padding: '6px 12px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
          {showApplyModal && selectedDiscount && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
              <div style={{ background: 'white', borderRadius: 16, padding: 24, width: '600px', maxWidth: '90%', maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ margin: 0 }}>Apply: <span style={{ color: '#667eea' }}>{selectedDiscount.name}</span></h3>
                  <button onClick={() => setShowApplyModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>✕</button>
                </div>

                <div style={{ background: '#f9fafb', padding: 16, borderRadius: 8, marginBottom: 20, border: '1px solid #e5e7eb' }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 13 }}>Select Product to Apply</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <select style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #d1d5db' }} value={selectedVpId} onChange={(e) => setSelectedVpId(e.target.value)}>
                      <option value="">-- Choose Product --</option>
                      {availableProducts.map((vp) => (
                        <option key={vp.id} value={vp.id}>
                          {vp.vendorName} - {vp.productName} ({vp.unit})
                        </option>
                      ))}
                    </select>
                    <button onClick={handleLinkProduct} disabled={!selectedVpId || loading} style={{ padding: '8px 16px', background: '#059669', color: 'white', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer', opacity: !selectedVpId || loading ? 0.6 : 1 }}>
                      Add
                    </button>
                  </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: 14, color: '#374151' }}>Currently Applied Products ({linkedProducts.length})</h4>
                  {linkedProducts.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#9ca3af', padding: 20, fontStyle: 'italic' }}>No products applied yet.</div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead style={{ background: '#f3f4f6' }}>
                        <tr>
                          <th style={{ padding: 8, textAlign: 'left' }}>Product</th>
                          <th style={{ padding: 8, textAlign: 'left' }}>Vendor</th>
                          <th style={{ padding: 8, textAlign: 'right' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {linkedProducts.map((lp) => (
                          <tr key={lp.vendorProductId} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ padding: 8 }}>{lp.productName} ({lp.unit})</td>
                            <td style={{ padding: 8, color: '#6b7280' }}>{lp.vendorName}</td>
                            <td style={{ padding: 8, textAlign: 'right' }}>
                              <button onClick={() => handleUnlinkProduct(lp.vendorProductId)} style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <div style={{ marginTop: 16, textAlign: 'right' }}>
                  <button onClick={() => setShowApplyModal(false)} style={{ padding: '8px 16px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer' }}>Close</button>
                </div>
              </div>
            </div>
          )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div onClick={() => setDeleteConfirm({ show: false, type: 'product', id: null })} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'white', padding: 32, borderRadius: 16, maxWidth: 400, width: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 16 }}>❓</div>
            <h3 style={{ fontSize: 24, fontWeight: 600, marginBottom: 12, textAlign: 'center' }}>
              {deleteConfirm.type === 'linked' ? 'Confirm Unlink' : deleteConfirm.type === 'discount' ? 'Confirm Delete Discount' : 'Confirm Delete'}
            </h3>
            <p style={{ color: '#666', textAlign: 'center', marginBottom: 24 }}>
              {deleteConfirm.type === 'linked' && 'Are you sure you want to unlink this product from the discount?'}
              {deleteConfirm.type === 'product' && 'Are you sure you want to delete this vendor product?'}
              {deleteConfirm.type === 'price' && 'Are you sure you want to delete this price?'}
              {deleteConfirm.type === 'discount' && 'Are you sure you want to delete this discount?'}
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setDeleteConfirm({ show: false, type: 'product', id: null })} style={{ flex: 1, padding: '12px 24px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>Cancel</button>
              <button onClick={deleteConfirm.type === 'linked' ? confirmUnlinkProduct : deleteConfirm.type === 'product' ? confirmDeleteProduct : deleteConfirm.type === 'price' ? confirmDeletePrice : confirmDeleteDiscount} style={{ flex: 1, padding: '12px 24px', borderRadius: 8, border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {errorModal.show && (
        <div onClick={() => setErrorModal({ show: false, title: '', message: '' })} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'white', padding: 32, borderRadius: 16, maxWidth: 400, width: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>{errorModal.title}</h3>
            <p style={{ color: '#666', marginBottom: 24 }}>{errorModal.message}</p>
            <button onClick={() => setErrorModal({ show: false, title: '', message: '' })} style={{ width: '100%', padding: '12px 24px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>Got it</button>
          </div>
        </div>
      )}
    </div>
  )
}