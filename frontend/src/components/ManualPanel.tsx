import { useState } from 'react'
import ResultModal from './ResultModal'
import { fetchTraceByCode } from '../api/trace'
import type { TraceResponse } from '../types/trace'

export default function ManualPanel({baseUrl}:{baseUrl:string}){
  const [input,setInput]=useState('')
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState<string|null>(null)
  const [data,setData]=useState<TraceResponse|null>(null)
  const [open,setOpen]=useState(false)

  async function submit(){
    if(!input.trim()||loading) return
    setLoading(true); setError(null); setData(null)
    try{
      const d=await fetchTraceByCode(baseUrl,input.trim())
      setData(d); setOpen(true)
    }catch(e:any){
      setError(e?.response?.data?.message||e?.message||'Fetch failed')
    }finally{ setLoading(false) }
  }

  return (
    <div className='card'>
      <div style={{fontWeight:700,marginBottom:8}}>Trace by code / URL</div>
      <div style={{display:'flex',gap:8}}>
        <input className='input' placeholder='Nhập code hoặc dán URL QR (vd BK001 hoặc https://.../trace/BK001)'
               value={input} onChange={e=>setInput(e.target.value)}
               onKeyDown={e=>{ if(e.key==='Enter') submit() }}/>
        <button className='btn' onClick={submit} disabled={loading}>{loading?'Loading…':'Fetch'}</button>
      </div>
      {error&&<div style={{color:'#b91c1c',marginTop:8}}>{error}</div>}
      {open&&data&&<ResultModal data={data} onClose={()=>setOpen(false)}/>}
    </div>
  )
}
