import { useEffect, useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { getAll, create, type Veg } from '../api/vegetables'

export default function Products(){
  const [items, setItems] = useState<Veg[]>([])
  const [picked, setPicked] = useState<Veg | null>(null)

  const [name, setName] = useState('')
  const [qty, setQty] = useState<number | ''>('')
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(()=>{ getAll().then(setItems).catch(console.error) }, [])

  const origin = window.location.origin.replace(/\/$/, '')
  const infoUrl = picked ? `${origin}/product?code=${picked.ID}` : ''

  async function onCreate(e: React.FormEvent){
    e.preventDefault()
    setErr(null)
    const q = typeof qty === 'string' ? Number(qty) : qty
    if (!name.trim()) return setErr('Name là bắt buộc')
    if (!Number.isFinite(q) || q! < 0) return setErr('Quantity phải là số ≥ 0')
    setSubmitting(true)
    try {
      const v = await create(name.trim(), q!)
      setItems(prev => [v, ...prev])
      setName(''); setQty('')
    } catch (e:any) {
      setErr(e?.message || 'Tạo mới thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h1 style={{marginTop:0}}>Products</h1>

      <form onSubmit={onCreate} className="card" style={{marginBottom:12}}>
        <div style={{fontWeight:700, marginBottom:6}}>Create new</div>
        {err && <div style={{color:'#b91c1c', marginBottom:6}}>Lỗi: {err}</div>}
        <div style={{display:'grid', gridTemplateColumns:'1fr 160px auto', gap:8}}>
          <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
          <input placeholder="Quantity" type="number" value={qty}
                 onChange={e=>setQty(e.target.value===''?'':Number(e.target.value))} />
          <button className="btn" type="submit" disabled={submitting}>{submitting?'Đang tạo…':'Tạo'}</button>
        </div>
      </form>

      <div className="grid">
        {items.map(it => (
          <div key={it.ID} className="card" onClick={()=>setPicked(it)} style={{cursor:'pointer'}}>
            <div style={{fontWeight:700, marginBottom:4}}>{it.Name}</div>
            <div className="muted">ID: <code>{it.ID}</code></div>
            <div className="muted">Qty: {it.Quantity}</div>
          </div>
        ))}
      </div>

      {picked && (
        <div className="card" style={{marginTop:12}}>
          <div style={{display:'flex', alignItems:'center', gap:12}}>
            <div>
              <div style={{fontWeight:700}}>{picked.Name}</div>
              <div className="muted">QR mở: <code>{infoUrl}</code></div>
              <div style={{marginTop:8, display:'flex', gap:8}}>
                <a className="btn" href={infoUrl} target="_blank" rel="noreferrer">Mở trang thông tin</a>
                <button className="btn" onClick={()=>setPicked(null)}>Đóng</button>
              </div>
            </div>
            <div style={{marginLeft:'auto', display:'grid', placeItems:'center'}}>
              <QRCodeCanvas value={infoUrl} size={220} includeMargin />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
