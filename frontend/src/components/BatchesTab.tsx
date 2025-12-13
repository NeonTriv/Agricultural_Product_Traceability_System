import React, { useState, useEffect } from 'react'
import axios from 'axios'
import VendorProductSetup, { VendorSetupData } from './VendorProductSetup'

const baseUrl = 'http://localhost:5000'
const todayStr = new Date().toISOString().split('T')[0]
const DEFAULT_IMAGE = 'https://via.placeholder.com/150?text=No+Image'

const tabBtn = (active: boolean) => ({
  padding: '10px 20px', borderRadius: 8, border: 'none',
  background: active ? '#eef2ff' : 'transparent',
  color: active ? '#667eea' : '#6b7280',
  cursor: 'pointer', fontWeight: 600, fontSize: 14,
  display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s'
})

const primaryBtnStyle = {
  padding: '12px 24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600,
  boxShadow: '0 4px 12px rgba(102,126,234,0.3)', display: 'flex', alignItems: 'center', gap: 8
}

interface Category { id: number; name: string }
interface Type { id: number; variety: string; categoryId: number }
interface AgriProduct { id: number; name: string; typeId: number; imageUrl?: string }
interface VendorProduct { id: number; vendorName: string; productName: string; unit: string }
interface Farm { id: number; name: string }
interface BatchDisplay { id: number; productName: string; farmName: string; qrCodeUrl: string; harvestDate: string; grade: string; province?: string; country?: string; vendorProductId?: number }

export default function BatchesTab() {
  const [categories, setCategories] = useState<Category[]>([])
  const [types, setTypes] = useState<Type[]>([])
  const [products, setProducts] = useState<AgriProduct[]>([])
  const [vendorProducts, setVendorProducts] = useState<VendorProduct[]>([])
  const [farms, setFarms] = useState<Farm[]>([])
  const [batches, setBatches] = useState<BatchDisplay[]>([])
  
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [setupModalOpen, setSetupModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'batches' | 'products'>('batches')

  // Form State
  const [formData, setFormData] = useState({ categoryId: '', newCategoryName: '', typeId: '', newTypeName: '', productId: '', newProductName: '', vendorProductId: '', farmId: '', harvestDate: todayStr, grade: 'A', seedBatch: '', createdBy: 'Admin' })
  const [isNewCategory, setIsNewCategory] = useState(false)
  const [isNewType, setIsNewType] = useState(false)
  const [isNewProduct, setIsNewProduct] = useState(false)
  const [vendorSetupData, setVendorSetupData] = useState<VendorSetupData | null>(null)
  
  // Product Tab State
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProductId, setEditingProductId] = useState<number | null>(null)
  const [productFormData, setProductFormData] = useState({ name: '', categoryId: '', typeId: '', imageUrl: '' })
  
  // Batch Edit State
  const [editingBatchId, setEditingBatchId] = useState<number | null>(null)
  const [batchEditData, setBatchEditData] = useState<any>(null)
  
  // Error Modal State
  const [errorModal, setErrorModal] = useState<{ show: boolean; title: string; message: string }>({ show: false, title: '', message: '' })
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; type: 'batch' | 'product'; id: number | null }>({ show: false, type: 'batch', id: null })

  useEffect(() => { loadAllData() }, [])

  const loadAllData = async () => {
    setLoading(true)
    try {
      const [catRes, typeRes, prodRes, vpRes, farmRes, batchRes] = await Promise.all([
        axios.get(`${baseUrl}/api/products/categories`),
        axios.get(`${baseUrl}/api/products/types`),
        axios.get(`${baseUrl}/api/products/agriculture-products`),
        axios.get(`${baseUrl}/api/pricing/vendor-products`),
        axios.get(`${baseUrl}/api/products/farms`),
        axios.get(`${baseUrl}/api/products`)
      ])
      setCategories(catRes.data); setTypes(typeRes.data); setProducts(prodRes.data)
      setVendorProducts(Array.isArray(vpRes.data) ? vpRes.data : [])
      setFarms(Array.isArray(farmRes.data) ? farmRes.data : [])
      setBatches((Array.isArray(batchRes.data) ? batchRes.data : []).map((b: any) => ({
        id: b.batchId || b.id, productName: b.productName, farmName: b.farmName || 'Unknown', qrCodeUrl: b.qrCodeUrl || `QR-${b.id}`, harvestDate: b.harvestDate, grade: b.grade || 'A', province: b.province, country: b.country
      })))
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try {
      if (isNewProduct && !vendorSetupData) { alert("⚠️ Please setup vendor first"); setLoading(false); return }
      if (!isNewProduct && !formData.productId) { alert("⚠️ Please select a product"); setLoading(false); return }
      if (!formData.farmId) { alert("⚠️ Please select a farm"); setLoading(false); return }
      if (!isNewProduct && !formData.vendorProductId && !vendorSetupData) { alert("⚠️ Please select vendor config"); setLoading(false); return }
      let currentCategoryId = formData.categoryId, currentTypeId = formData.typeId
      if (isNewCategory) { const res = await axios.post(`${baseUrl}/api/products/categories`, { name: formData.newCategoryName }); currentCategoryId = res.data.id }
      if (isNewType) { const res = await axios.post(`${baseUrl}/api/products/types`, { variety: formData.newTypeName, categoryId: parseInt(currentCategoryId.toString()) }); currentTypeId = res.data.id }

      const payload: any = {
        farmId: parseInt(formData.farmId), harvestDate: formData.harvestDate, grade: formData.grade, seedBatch: formData.seedBatch, createdBy: formData.createdBy,
        isNewProduct: isNewProduct, productId: isNewProduct ? null : parseInt(formData.productId), newProductName: isNewProduct ? formData.newProductName : null, newProductTypeId: isNewProduct ? parseInt(currentTypeId.toString()) : null,
        vendorConfig: vendorSetupData ? vendorSetupData : (isNewProduct ? null : { vendorProductId: parseInt(formData.vendorProductId) })
      }
      await axios.post(`${baseUrl}/api/products/create-full-batch`, payload)
      alert('✅ Batch created!'); setShowForm(false); setVendorSetupData(null); loadAllData()
    } catch (e: any) { alert(e.response?.data?.message || e.message) } finally { setLoading(false) }
  }

  const handleVendorSetupSave = (data: VendorSetupData) => { setVendorSetupData(data); setSetupModalOpen(false) }
  const getProductNameById = (id?: string) => products.find(p => p.id.toString() === id)?.name || ''
  const filteredTypes = types.filter(t => !formData.categoryId || String(t.categoryId) === String(formData.categoryId))
  const filteredProducts = products.filter(p => !formData.typeId || String(p.typeId) === String(formData.typeId))

  // Product CRUD
  const handleCreateProduct = async () => {
    if (!productFormData.name || !productFormData.typeId) return
    try {
      const payload = { 
        name: productFormData.name, 
        typeId: parseInt(productFormData.typeId),
        imageUrl: productFormData.imageUrl || DEFAULT_IMAGE
      }
      if (editingProductId) await axios.patch(`${baseUrl}/api/products/agriculture-products/${editingProductId}`, payload)
      else await axios.post(`${baseUrl}/api/products/agriculture-products`, payload)
      setProductFormData({ name: '', categoryId: '', typeId: '', imageUrl: '' }); setEditingProductId(null); setShowProductForm(false); loadAllData()
    } catch (e) { console.error(e) }
  }
  const handleDeleteProduct = async (id: number) => { 
    setDeleteConfirm({ show: true, type: 'product', id })
  }
  const confirmDeleteProduct = async () => {
    if (!deleteConfirm.id) return
    setLoading(true)
    try {
      await axios.delete(`${baseUrl}/api/products/agriculture-products/${deleteConfirm.id}`)
      loadAllData()
      setDeleteConfirm({ show: false, type: 'product', id: null })
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message
      setErrorModal({
        show: true,
        title: '⚠️ Cannot Delete Product',
        message: msg
      })
      setDeleteConfirm({ show: false, type: 'product', id: null })
    } finally { setLoading(false) }
  }
  const handleEditProduct = (p: AgriProduct) => { 
    const type = types.find(t => t.id === p.typeId)
    setEditingProductId(p.id)
    setProductFormData({ 
      name: p.name, 
      categoryId: type ? String(type.categoryId) : '', 
      typeId: p.typeId ? String(p.typeId) : '',
      imageUrl: p.imageUrl || ''
    })
    setShowProductForm(true)
  }

  // Batch CRUD
  const handleDeleteBatch = async (id: number) => { 
    setDeleteConfirm({ show: true, type: 'batch', id })
  }
  const confirmDeleteBatch = async () => {
    if (!deleteConfirm.id) return
    setLoading(true)
    try {
      await axios.delete(`${baseUrl}/api/products/batches/${deleteConfirm.id}`).catch(async () => {
        await axios.delete(`${baseUrl}/api/products/${deleteConfirm.id}`)
      })
      loadAllData()
      setDeleteConfirm({ show: false, type: 'batch', id: null })
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message
      setErrorModal({
        show: true,
        title: '⚠️ Cannot Delete Batch',
        message: msg
      })
      setDeleteConfirm({ show: false, type: 'batch', id: null })
    } finally { setLoading(false) }
  }
  
  const handleEditBatch = (b: BatchDisplay) => {
    setEditingBatchId(b.id)
    setBatchEditData(b)
    setFormData({
      ...formData,
      farmId: '', 
      harvestDate: b.harvestDate.split('T')[0],
      grade: b.grade,
      seedBatch: '',
      vendorProductId: b.vendorProductId?.toString() || ''
    })
    setShowForm(true)
  }

  const handleUpdateBatch = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try {
      const payload = {
        harvestDate: formData.harvestDate,
        grade: formData.grade,
        vendorProductId: formData.vendorProductId ? parseInt(formData.vendorProductId) : undefined
      }
      await axios.patch(`${baseUrl}/api/products/batches/${editingBatchId}`, payload).catch(async () => {
        await axios.patch(`${baseUrl}/api/products/${editingBatchId}`, payload)
      })
      alert('✅ Batch updated!')
      setShowForm(false)
      setEditingBatchId(null)
      setBatchEditData(null)
      loadAllData()
    } catch (e: any) { 
      alert(`Error: ${e.response?.data?.message || e.message}`) 
    } finally { setLoading(false) }
  }

  const filteredTypesForProduct = types.filter(t => !productFormData.categoryId || t.categoryId.toString() === productFormData.categoryId)

  return (
    <div>
      <VendorProductSetup isOpen={setupModalOpen} onClose={() => setSetupModalOpen(false)} onSave={handleVendorSetupSave} productNameDisplay={isNewProduct ? formData.newProductName : getProductNameById(formData.productId)} isNewProduct={isNewProduct} initialData={vendorSetupData} />

      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 40, fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Batch Management</h2>
      </div>

      <div style={{ display: 'flex', padding: 6, gap: 4, borderRadius: 12, width: 'fit-content', background: 'white', marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <button onClick={() => setActiveTab('batches')} style={tabBtn(activeTab === 'batches')}>📦 Batches</button>
        <button onClick={() => setActiveTab('products')} style={tabBtn(activeTab === 'products')}>🌾 Agriculture Products</button>
      </div>

      {activeTab === 'batches' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Production Batches</h3>
              <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: 14 }}>Track and manage all production batches with full traceability</p>
            </div>
            <button onClick={() => {
              setShowForm(!showForm)
              if (showForm) {
                setEditingBatchId(null)
                setBatchEditData(null)
              }
            }} style={{ padding: '12px 24px', background: showForm ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(102,126,234,0.3)' }}>
              {showForm ? 'Cancel' : editingBatchId ? 'Cancel Edit' : '+ New Batch'}
            </button>
          </div>
          {showForm && (
            <div style={{ background: 'white', padding: 24, borderRadius: 16, marginBottom: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
              <h3 style={{ margin: '0 0 16px 0', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: 18, fontWeight: 700 }}>
                {editingBatchId ? '✏️ Edit Batch' : '➕ Create New Batch'}
              </h3>
              <form onSubmit={editingBatchId ? handleUpdateBatch : handleBatchSubmit}>
                {/* Form Content Copied but Condensed for brevity - Logic is same as before */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
                   {/* Left Col */}
                   <div>
                      <h4 style={{marginTop:0, color:'#667eea'}}>Product Info</h4>
                      <div style={{marginBottom:16}}><label style={{display:'block',marginBottom:6,fontWeight:600,fontSize:13}}>Category</label>{!isNewCategory ? <div style={{display:'flex',gap:8}}><select style={{flex:1,padding:10,borderRadius:8,border:'1px solid #d1d5db'}} value={formData.categoryId} onChange={e=>setFormData({...formData,categoryId:e.target.value,typeId:'',productId:''})}><option value="">-- Select Category --</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select><button type="button" onClick={()=>setIsNewCategory(true)} style={{padding:'0 12px',background:'#eef2ff',color:'#667eea',border:'none',borderRadius:8,fontWeight:600}}>+ New</button></div> : <div style={{display:'flex',gap:8}}><input style={{flex:1,padding:10,borderRadius:8,border:'2px solid #667eea'}} value={formData.newCategoryName} onChange={e=>setFormData({...formData,newCategoryName:e.target.value})} placeholder="New Category"/><button type="button" onClick={()=>setIsNewCategory(false)}>✕</button></div>}</div>
                      <div style={{marginBottom:16}}><label style={{display:'block',marginBottom:6,fontWeight:600,fontSize:13}}>Type</label>{!isNewType ? <div style={{display:'flex',gap:8}}><select style={{flex:1,padding:10,borderRadius:8,border:'1px solid #d1d5db'}} value={formData.typeId} onChange={e=>setFormData({...formData,typeId:e.target.value,productId:''})} disabled={!editingBatchId && !formData.categoryId && !isNewCategory}><option value="">-- Select Type --</option>{filteredTypes.map(t=><option key={t.id} value={t.id}>{t.variety}</option>)}</select><button type="button" onClick={()=>setIsNewType(true)} disabled={!editingBatchId && !formData.categoryId && !isNewCategory} style={{padding:'0 12px',background:'#eef2ff',color:'#667eea',border:'none',borderRadius:8,fontWeight:600}}>+ New</button></div> : <div style={{display:'flex',gap:8}}><input style={{flex:1,padding:10,borderRadius:8,border:'2px solid #667eea'}} value={formData.newTypeName} onChange={e=>setFormData({...formData,newTypeName:e.target.value})} placeholder="New Type"/><button type="button" onClick={()=>setIsNewType(false)}>✕</button></div>}</div>
                      <div style={{marginBottom:16}}><label style={{display:'block',marginBottom:6,fontWeight:600,fontSize:13}}>Product</label>{!isNewProduct ? <div style={{display:'flex',gap:8}}><select style={{flex:1,padding:10,borderRadius:8,border:'1px solid #d1d5db'}} value={formData.productId} onChange={e=>setFormData({...formData,productId:e.target.value})} disabled={!editingBatchId && !formData.typeId && !isNewType}><option value="">-- Select Product --</option>{filteredProducts.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select><button type="button" onClick={()=>setIsNewProduct(true)} disabled={!editingBatchId && !formData.typeId && !isNewType} style={{padding:'0 12px',background:'#eef2ff',color:'#667eea',border:'none',borderRadius:8,fontWeight:600}}>+ New</button></div> : <div style={{display:'flex',gap:8}}><input style={{flex:1,padding:10,borderRadius:8,border:'2px solid #667eea'}} value={formData.newProductName} onChange={e=>setFormData({...formData,newProductName:e.target.value})} placeholder="New Product Name"/><button type="button" onClick={()=>setIsNewProduct(false)}>✕</button></div>}</div>
                   </div>
                   {/* Right Col */}
                   <div>
                      <h4 style={{marginTop:0, color:'#667eea'}}>Origin & Config</h4>
                      <div style={{marginBottom:16}}><label style={{display:'block',marginBottom:6,fontWeight:600,fontSize:13}}>Vendor Config</label>{isNewProduct ? (vendorSetupData ? <div style={{padding:12,border:'1px solid #10b981',borderRadius:8,background:'#f0fdf4',color:'#166534',fontWeight:600, display:'flex', justifyContent:'space-between'}}><span>✅ Configured: {vendorSetupData.vendorTin}</span><button type="button" onClick={()=>setSetupModalOpen(true)} style={{border:'none',background:'none',color:'#2563eb',cursor:'pointer',fontWeight:600}}>Edit</button></div> : <button type="button" onClick={()=>setSetupModalOpen(true)} style={{width:'100%',padding:'10px',background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',color:'white',border:'none',borderRadius:8,fontWeight:600,cursor:'pointer'}}>⚙️ Setup Vendor</button>) : <div style={{display:'flex',gap:8}}><select style={{flex:1,padding:10,borderRadius:8,border:'1px solid #d1d5db'}} value={formData.vendorProductId} onChange={e=>setFormData({...formData,vendorProductId:e.target.value})}><option value="">-- Select Vendor Config --</option>{vendorProducts.map(vp=><option key={vp.id} value={vp.id}>{vp.vendorName} - {vp.productName} ({vp.unit})</option>)}</select><button type="button" onClick={()=>setSetupModalOpen(true)} style={{padding:'0 12px',background:'#eef2ff',color:'#4f46e5',border:'1px solid #c7d2fe',borderRadius:8,fontWeight:600}}>+ New Config</button></div>}</div>
                      <div style={{marginBottom:16}}><label style={{display:'block',marginBottom:6,fontWeight:600,fontSize:13}}>Farm</label><select style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #d1d5db'}} value={formData.farmId} onChange={e=>setFormData({...formData,farmId:e.target.value})}><option value="">-- Select Farm --</option>{farms.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}</select></div>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}><div style={{marginBottom:16}}><label style={{display:'block',marginBottom:6,fontWeight:600,fontSize:13}}>Harvest Date</label><input type="date" style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #d1d5db'}} value={formData.harvestDate} onChange={e=>setFormData({...formData,harvestDate:e.target.value})}/></div><div><label style={{display:'block',marginBottom:6,fontWeight:600,fontSize:13}}>Grade</label><select style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #d1d5db'}} value={formData.grade} onChange={e=>setFormData({...formData,grade:e.target.value})}><option>A</option><option>B</option><option>C</option></select></div></div>
                   </div>
                </div>
                <button type="submit" disabled={loading} style={{marginTop:20,width:'100%',padding:'14px',background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',color:'white',border:'none',borderRadius:8,fontSize:16,fontWeight:700,cursor:'pointer',boxShadow:'0 4px 12px rgba(102,126,234,0.3)',opacity:loading?0.7:1}}>
                  {loading ? 'Processing...' : editingBatchId ? 'UPDATE BATCH' : 'CREATE BATCH'}
                </button>
              </form>
            </div>
          )}
          
          <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}><th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Product Info</th><th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Farm & Location</th><th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Harvest</th><th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>QR Code</th><th style={{ padding: 16, textAlign: 'center', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Actions</th></tr></thead>
              <tbody>{batches.map(b => (<tr key={b.id} style={{ borderBottom: '1px solid #f3f4f6' }}><td style={{ padding: 16 }}><div style={{ fontWeight: 600, color: '#111827', fontSize: 13 }}>{b.productName}</div><div style={{ fontSize: 12, color: '#6b7280' }}>Grade: {b.grade}</div></td><td style={{ padding: 16 }}><div style={{ fontWeight: 500, fontSize: 13 }}>{b.farmName}</div><div style={{ fontSize: 13, color: '#6b7280' }}>{b.province}, {b.country}</div></td><td style={{ padding: 16, fontSize: 13 }}>{new Date(b.harvestDate).toLocaleDateString()}</td><td style={{ padding: 16 }}><code style={{ background: '#f3f4f6', padding: '4px 8px', borderRadius: 4, fontFamily: 'monospace', fontSize: 12 }}>{b.qrCodeUrl}</code></td><td style={{ padding: 16, textAlign: 'center' }}><button onClick={() => handleEditBatch(b)} style={{ marginRight: 8, padding: '6px 12px', background: '#dbeafe', color: '#1e40af', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>Edit</button><button onClick={() => handleDeleteBatch(b.id)} style={{ padding: '6px 12px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>Delete</button></td></tr>))}</tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'products' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Agriculture Products</h3>
              <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: 14 }}>Manage agriculture product types and classifications</p>
            </div>
            {!showProductForm && <button onClick={() => setShowProductForm(true)} style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(102,126,234,0.3)' }}>+ New Product</button>}
          </div>
          {showProductForm && (
            <div style={{ background: 'white', padding: 24, borderRadius: 16, marginBottom: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#374151' }}>{editingProductId ? 'Edit Product' : 'New Product'}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>Product Name *</label><input type="text" value={productFormData.name} onChange={e => setProductFormData({ ...productFormData, name: e.target.value })} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13 }} placeholder="Enter name" /></div>
                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>Category *</label><select value={productFormData.categoryId} onChange={e => setProductFormData({ ...productFormData, categoryId: e.target.value, typeId: '' })} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13 }}><option value="">-- Select Category --</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>Type / Variety *</label><select value={productFormData.typeId} onChange={e => setProductFormData({ ...productFormData, typeId: e.target.value })} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13 }} disabled={!productFormData.categoryId}><option value="">-- Select Type --</option>{filteredTypesForProduct.map(t => <option key={t.id} value={t.id}>{t.variety}</option>)}</select></div>
                <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>Image URL</label><input type="text" value={productFormData.imageUrl} onChange={e => setProductFormData({ ...productFormData, imageUrl: e.target.value })} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13 }} placeholder={DEFAULT_IMAGE} /></div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}><button onClick={handleCreateProduct} style={{ flex: 1, padding: '12px 24px', background: '#667eea', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>{editingProductId ? 'Update' : 'Create'}</button><button onClick={() => { setShowProductForm(false); setEditingProductId(null); setProductFormData({ name: '', categoryId: '', typeId: '', imageUrl: '' }) }} style={{ flex: 1, padding: '12px 24px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Cancel</button></div>
            </div>
          )}
          {/* Products Table (Reused Table Style) */}
          <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}><th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Name</th><th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Category</th><th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Type</th><th style={{ padding: 16, textAlign: 'right', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Actions</th></tr></thead>
              <tbody>{products.map(p => {
                const type = types.find(t => t.id === p.typeId);
                const category = type ? categories.find(c => c.id === type.categoryId) : null;
                return (<tr key={p.id} style={{ borderBottom: '1px solid #f3f4f6' }}><td style={{ padding: 16, fontWeight: 600, fontSize: 13 }}>{p.name}</td><td style={{ padding: 16, fontSize: 13, color: '#6b7280' }}>{category?.name || '-'}</td><td style={{ padding: 16, fontSize: 13, color: '#6b7280' }}>{type?.variety || '-'}</td><td style={{ padding: 16, textAlign: 'right' }}><button onClick={() => handleEditProduct(p)} style={{ marginRight: 8, padding: '6px 12px', background: '#dbeafe', color: '#1e40af', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>Edit</button><button onClick={() => handleDeleteProduct(p.id)} style={{ padding: '6px 12px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>Delete</button></td></tr>)
              })}</tbody>
            </table>
          </div>
        </>
      )}
      
      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div onClick={() => setDeleteConfirm({ show: false, type: 'batch', id: null })} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'white', padding: 32, borderRadius: 16, maxWidth: 400, width: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 16 }}>❓</div>
            <h3 style={{ fontSize: 24, fontWeight: 600, marginBottom: 12, textAlign: 'center' }}>Confirm Delete</h3>
            <p style={{ color: '#666', textAlign: 'center', marginBottom: 24 }}>
              {deleteConfirm.type === 'batch' && 'Are you sure you want to delete this batch? This action cannot be undone.'}
              {deleteConfirm.type === 'product' && 'Are you sure you want to delete this agriculture product?'}
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setDeleteConfirm({ show: false, type: 'batch', id: null })} style={{ flex: 1, padding: '12px 24px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>Cancel</button>
              <button onClick={deleteConfirm.type === 'batch' ? confirmDeleteBatch : confirmDeleteProduct} style={{ flex: 1, padding: '12px 24px', borderRadius: 8, border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>Delete</button>
            </div>
          </div>
        </div>
      )}
      
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
    </div>
  )
}