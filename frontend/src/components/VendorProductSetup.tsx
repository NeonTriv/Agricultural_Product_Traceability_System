import React, { useState, useEffect } from 'react'
import axios from 'axios'

const baseUrl = 'http://localhost:5000'

// === Định nghĩa dữ liệu trả về cho Parent ===
export interface VendorSetupData {
  vendorTin: string
  unit: string
  priceValue?: number
  priceCurrency: string
  discounts: Array<{
    percentage: number
    minValue?: number
    maxDiscountAmount?: number
    priority: number
    isStackable: boolean
    startDate: string
    expiredDate: string
  }>
}

interface VendorProductSetupProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: VendorSetupData) => void // Thay đổi: Trả VendorSetupData thay vì vendorProductId
  
  // Props hiển thị (Read-only, từ Parent truyền xuống)
  productNameDisplay: string // Tên sản phẩm để hiển thị (không cho edit)
  isNewProduct: boolean      // Là sản phẩm mới hay cũ
  
  // Props dữ liệu cũ (để hỗ trợ Edit)
  initialData?: VendorSetupData | null
}

interface Discount {
  percentage: string; minValue: string; maxDiscountAmount: string; 
  priority: string; isStackable: boolean; startDate: string; endDate: string
}

const todayStr = new Date().toISOString().split('T')[0]
const nextMonthStr = new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]

export default function VendorProductSetup({ 
  isOpen, onClose, onSave, 
  productNameDisplay, isNewProduct, initialData 
}: VendorProductSetupProps) {
  
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Data từ API
  const [vendors, setVendors] = useState<any[]>([])

  // Form State
  const [selectedVendorTin, setSelectedVendorTin] = useState('')
  const [unit, setUnit] = useState('kg')
  const [price, setPrice] = useState('')
  const [currency, setCurrency] = useState('VND')
  const [discounts, setDiscounts] = useState<Discount[]>([])

  useEffect(() => {
    if (isOpen) {
      loadData()
      // Nếu có dữ liệu cũ (Edit mode) thì fill vào
      if (initialData) {
        setSelectedVendorTin(initialData.vendorTin)
        setUnit(initialData.unit)
        setPrice(initialData.priceValue?.toString() || '')
        setCurrency(initialData.priceCurrency)
        setDiscounts(initialData.discounts.map(d => ({
          percentage: d.percentage.toString(),
          minValue: d.minValue?.toString() || '',
          maxDiscountAmount: d.maxDiscountAmount?.toString() || '',
          priority: d.priority.toString(),
          isStackable: d.isStackable,
          startDate: d.startDate,
          endDate: d.expiredDate
        })))
      } else {
        resetForm()
      }
      setStep(1)
    }
  }, [isOpen, initialData])

  const loadData = async () => {
    try {
      const vendRes = await axios.get(`${baseUrl}/api/vendors`)
      setVendors(Array.isArray(vendRes.data) ? vendRes.data : [])
    } catch (e) { console.error('Error loading vendors:', e) }
  }

  const resetForm = () => {
    setSelectedVendorTin('')
    setUnit('kg')
    setPrice('')
    setCurrency('VND')
    setDiscounts([{ percentage: '0', minValue: '', maxDiscountAmount: '', priority: '1', isStackable: false, startDate: todayStr, endDate: nextMonthStr }])
  }

  const handleAddDiscount = () => { setDiscounts([...discounts, { percentage: '0', minValue: '', maxDiscountAmount: '', priority: '1', isStackable: false, startDate: todayStr, endDate: nextMonthStr }]) }
  const handleRemoveDiscount = (idx: number) => { setDiscounts(discounts.filter((_, i) => i !== idx)) }
  const handleDiscountChange = (idx: number, field: keyof Discount, value: any) => { const updated = [...discounts]; updated[idx] = { ...updated[idx], [field]: value }; setDiscounts(updated) }

  // === HÀM SAVE MỚI: CHỈ ĐÓNG GÓI DỮ LIỆU, KHÔNG GỌI API ===
  const handleSave = () => {
    if (!selectedVendorTin) {
      alert("Vui lòng chọn nhà cung cấp (Vendor)")
      return
    }
    if (!unit) {
      alert("Vui lòng nhập đơn vị (Unit)")
      return
    }

    // Đóng gói dữ liệu thành object
    const dataToReturn: VendorSetupData = {
      vendorTin: selectedVendorTin,
      unit: unit,
      priceValue: price ? parseFloat(price) : undefined,
      priceCurrency: currency,
      discounts: discounts
        .filter(d => parseFloat(d.percentage) > 0) // Chỉ lấy discount có percentage > 0
        .map(d => ({
          percentage: parseFloat(d.percentage),
          minValue: d.minValue ? parseFloat(d.minValue) : undefined,
          maxDiscountAmount: d.maxDiscountAmount ? parseFloat(d.maxDiscountAmount) : undefined,
          priority: parseInt(d.priority),
          isStackable: d.isStackable,
          startDate: d.startDate,
          expiredDate: d.endDate
        }))
    }

    // Gửi dữ liệu về cho Parent (Không lưu DB)
    onSave(dataToReturn)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', borderRadius: 16, padding: 32, maxWidth: 600, width: '90%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, color: '#111827', fontSize: 24, fontWeight: 700 }}>Setup Vendor Product</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#6b7280' }}>✕</button>
        </div>

        {/* Step Indicator */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ flex: 1, height: 8, borderRadius: 4, background: step >= s ? '#667eea' : '#e5e7eb' }} />
          ))}
        </div>

        {/* Step 1: Product Information */}
        {step === 1 && (
          <div>
            <h3 style={{ marginBottom: 16, color: '#374151', fontSize: 18, fontWeight: 600 }}>Step 1: Product Information</h3>
            
            {/* Hiển thị tên sản phẩm (Read-only) - Nhận từ Parent */}
            <div style={{ marginBottom: 16, padding: 12, background: '#f3f4f6', borderRadius: 8, border: '1px solid #e5e7eb' }}>
              <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4, fontWeight: 600 }}>Target Product</label>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>
                {productNameDisplay}
                {isNewProduct && <span style={{ marginLeft: 8, fontSize: 11, background: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: 4 }}>✨ New</span>}
              </div>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#374151' }}>Vendor *</label>
              <select value={selectedVendorTin} onChange={e => setSelectedVendorTin(e.target.value)} required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #d1d5db' }}>
                <option value="">-- Select Vendor --</option>
                {vendors.map(v => <option key={v.tin} value={v.tin}>{v.name}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#374151' }}>Unit *</label>
              <input type="text" value={unit} onChange={e => setUnit(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #d1d5db' }} placeholder="kg, box, ton..." />
            </div>
          </div>
        )}

        {/* Step 2: Base Price (Giữ nguyên) */}
        {step === 2 && (
          <div>
            <h3 style={{ marginBottom: 16, color: '#374151', fontSize: 18, fontWeight: 600 }}>Step 2: Base Price</h3>
            <div style={{ marginBottom: 16 }}><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#374151' }}>Price Value</label><input type="number" value={price} onChange={e => setPrice(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #d1d5db' }} placeholder="50000" /></div>
            <div style={{ marginBottom: 16 }}><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#374151' }}>Currency</label><select value={currency} onChange={e => setCurrency(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #d1d5db' }}><option value="VND">VND</option><option value="USD">USD</option></select></div>
          </div>
        )}

        {/* Step 3: Discounts (Giữ nguyên) */}
        {step === 3 && (
          <div>
            <h3 style={{ marginBottom: 16, color: '#374151', fontSize: 18, fontWeight: 600 }}>Step 3: Discounts</h3>
            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}><button onClick={handleAddDiscount} style={{ padding: '8px 14px', background: '#eef2ff', color: '#667eea', border: '1px solid #c7d2fe', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>+ Add Discount</button></div>
            {discounts.map((disc, idx) => (
              <div key={idx} style={{ marginBottom: 16, padding: 12, border: '1px solid #e5e7eb', borderRadius: 8, background: '#f9fafb' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div><label style={{ display: 'block', fontSize: 12, fontWeight: 600 }}>%</label><input type="number" value={disc.percentage} onChange={e => handleDiscountChange(idx, 'percentage', e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #d1d5db' }} /></div>
                  <div><label style={{ display: 'block', fontSize: 12, fontWeight: 600 }}>Min Val</label><input type="number" value={disc.minValue} onChange={e => handleDiscountChange(idx, 'minValue', e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #d1d5db' }} /></div>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 12 }}><input type="checkbox" checked={disc.isStackable} onChange={e => handleDiscountChange(idx, 'isStackable', e.target.checked)} /> Stackable</label>
                  <button onClick={() => handleRemoveDiscount(idx)} style={{ marginLeft:'auto', padding: '4px 10px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Nav Buttons */}
        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          {step > 1 && <button onClick={() => setStep(step - 1)} style={{ flex: 1, padding: '12px', background: '#f3f4f6', color: '#374151', borderRadius: 8, fontWeight: 600, cursor:'pointer', border: 'none' }}>Back</button>}
          {step < 3 && <button onClick={() => setStep(step + 1)} style={{ flex: 1, padding: '12px', background: '#667eea', color: 'white', borderRadius: 8, fontWeight: 600, cursor:'pointer', border: 'none' }}>Next</button>}
          {step === 3 && <button onClick={handleSave} disabled={loading} style={{ flex: 1, padding: '12px', background: '#667eea', color: 'white', borderRadius: 8, fontWeight: 600, cursor:'pointer', border: 'none' }}>{loading ? 'Saving...' : 'Confirm Configuration'}</button>}
        </div>
      </div>
    </div>
  )
}