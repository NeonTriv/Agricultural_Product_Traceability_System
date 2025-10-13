import { useState } from 'react'
import type { Veg } from '../api/vegetables'
import { rename, setQuantity, remove } from '../api/vegetables'

export default function EditablePlate({ data, onClose, onSaved }:{ data:Veg; onClose:()=>void; onSaved:(v:Veg)=>void }){
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(data.Name)
  const [qty, setQty] = useState<number | ''>(data.Quantity ?? 0)

  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function save(){
    setLoading(true); setErr(null)
    try{
      let v = data
      if (name !== data.Name) v = await rename(data.ID, name)
      if (qty !== data.Quantity) v = await setQuantity(data.ID, Number(qty))
      onSaved(v); setEditing(false)
    }catch(e:any){
      setErr(e?.message || 'Save failed')
    }finally{ setLoading(false) }
  }

  // NEW: nút Xóa
  async function onDelete(){
    if (!confirm(`Xóa "${data.Name}"?`)) return
    setLoading(true); setErr(null)
    try{
      await remove(data.ID)
      onClose() // close modal after deletion
    }catch(e:any){
      setErr(e?.message || 'Delete failed')
    }finally{ setLoading(false) }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div style={{fontWeight:800, fontSize:18}}>{data.Name}</div>
            <div className="muted">ID: <code>{data.ID}</code></div>
          </div>
          {!editing ? (
            <>
              <button className="btn" onClick={()=>setEditing(true)}>Chỉnh sửa</button>
              <button className="btn" onClick={onDelete} style={{color:'#b91c1c'}} disabled={loading}>Xóa</button>
            </>
          ) : (
            <>
              <button className="btn" onClick={save} disabled={loading}>{loading?'Đang lưu…':'Lưu'}</button>
              <button className="btn" onClick={()=>setEditing(false)} disabled={loading}>Huỷ</button>
              <button className="btn" onClick={onDelete} style={{color:'#b91c1c'}} disabled={loading}>Xóa</button>
            </>
          )}
          <button className="close-x" onClick={onClose} aria-label="Close">×</button>
        </div>

        {err && <div style={{color:'#b91c1c', marginBottom:8}}>Lỗi: {err}</div>}

        <section className="card">
          <div style={{fontWeight:700, marginBottom:6}}>Thông tin</div>
          {!editing ? (
            <>
              <Row label="Name">{data.Name}</Row>
              <Row label="Quantity">{data.Quantity}</Row>
            </>
          ) : (
            <>
              <Row label="Name"><input value={name} onChange={e=>setName(e.target.value)} /></Row>
              <Row label="Quantity"><input type="number" value={qty} onChange={e=>setQty(e.target.value===''?'':Number(e.target.value))} /></Row>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
function Row({label, children}:{label:string; children:any}){
  return <div className="row"><div className="muted">{label}</div><div>{children}</div></div>
}