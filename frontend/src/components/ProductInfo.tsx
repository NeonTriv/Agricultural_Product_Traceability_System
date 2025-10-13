import { useEffect, useState } from 'react'
import { getOne, type Veg } from '../api/vegetables'
import EditablePlate from './EditablePlate'

export default function ProductInfo(){
  const params = new URLSearchParams(window.location.search)
  const id = Number(params.get('code') || 0)

  const [data, setData] = useState<Veg | null>(null)
  const [open, setOpen] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    if (!id) return
    setLoading(true); setErr(null); setData(null)
    getOne(id)
      .then(d => { setData(d); setOpen(true) })
      .catch(e => setErr(e?.message || 'Fetch failed'))
      .finally(()=>setLoading(false))
  }, [id])

  return (
    <div className="container">
      <h1 style={{marginTop:0}}>Thông tin sản phẩm</h1>
      {id ? <p>Code: <code>{id}</code></p> : <p style={{color:'#b91c1c'}}>Thiếu <code>?code=ID</code></p>}
      {loading && <div className="card">Đang tải…</div>}
      {err && <div className="card" style={{color:'#b91c1c'}}>Lỗi: {err}</div>}
      {open && data && <EditablePlate data={data} onClose={()=>setOpen(false)} onSaved={(u)=>setData(u)} />}
      {data && !open && <pre>{JSON.stringify(data,null,2)}</pre>}
    </div>
  )
}
